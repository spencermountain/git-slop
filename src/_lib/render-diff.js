import { stripVTControlCharacters, styleText } from 'node:util'
import { relative, resolve } from 'node:path'
import { preview } from './diff.js'

const maxPreview = 10
const maxExpandedFiles = 4
const markerColors = { '+': 'green', '-': 'red', '~': 'blue' }
const indent = '  '
const width = Math.max(10, (process.stdout.columns || 100) - indent.length - 1)

const createPrinter = lineWidth => (...parts) => {
  const segments = parts.map(([text, style = 'grey']) => ({
    chars: Array.from(stripVTControlCharacters(text).replace(/[\x00-\x1f\x7f]/g, ' ')),
    style
  }))
  const clipped = segments.reduce((total, part) => total + part.chars.length, 0) > lineWidth
  let remaining = lineWidth - Number(clipped)
  const output = segments.map(({ chars, style }) => {
    const text = chars.slice(0, remaining).join('')
    remaining = Math.max(0, remaining - chars.length)
    return styleText(style, text)
  }).join('')
  const prefix = parts.length ? indent : ''
  console.log(prefix + output + (clipped ? styleText('grey', '…') : ''))
}

const renderDiff = async (repo, files, { full = false } = {}) => {
  const print = createPrinter(full ? Infinity : width)
  print()
  if (!files.length) {
    print(['✓ No changes', 'green'])
    print()
    return
  }
  const root = (await repo.revparse(['--show-toplevel'])).trim()
  for (const [index, file] of files.entries()) {
    if (index >= maxExpandedFiles) {
      print()
    }
    let color = 'blue'
    if (file.type === 'A') {
      color = 'green'
    } else if (file.type === 'D') {
      color = 'red'
    }
    if (file.detail) {
      let symbol = ''
      if (file.type === 'A') {
        symbol = '+ '
      } else if (file.type === 'D') {
        symbol = '🗑️ '
      }
      print(['• ', ['white', 'dim']], [symbol, color],
        ['./' + file.name, [color, 'underline', 'italic']], ['  ' + file.detail, ['grey', 'dim']])
      continue
    }
    const lines = await preview(repo, file)
    const totals = { '+': 0, '-': 0, '~': 0 }
    lines.forEach(line => {
      totals[line[0]] += 1
    })
    const counts = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([marker, count], countIndex) => {
        const style = [markerColors[marker]]
        if (count === 0) {
          style.push('dim')
        }
        if (count > 10) {
          style.push('underline')
        }
        const sign = countIndex === 0 && marker !== '~' ? marker : ''
        return [sign + count, style]
      })
    if (file.type === 'A' || file.type === 'D') {
      const symbol = file.type === 'A' ? '+' : '🗑️'
      const count = file.type === 'A' ? `+${file.added}` : `-${file.removed}`
      const countStyle = [color]
      if (Math.abs(Number(count)) > 10) {
        countStyle.push('underline')
      }
      print(['• ', ['white', 'dim']], [symbol + ' ', color],
        ['./' + file.name, [color, 'underline', 'italic']], [' (', color], [count, countStyle], [')', color])
    } else {
      print(['• ', ['white', 'dim']], counts[0], ['/'], counts[1], ['/'], counts[2],
        [' - ', ['grey', 'dim']], ['./' + file.name, [color, 'underline', 'italic']])
    }
    if (index >= maxExpandedFiles) {
      continue
    }
    // Square-root scaling keeps small diffs readable and large ones compact.
    const limit = full ? lines.length : Math.min(maxPreview, Math.ceil(Math.sqrt(lines.length)))
    const shown = lines.slice(0, limit)
    shown.forEach((line, lineIndex) => {
      const markerColor = markerColors[line[0]]
      if (shown[lineIndex - 1]?.[0] !== line[0]) {
        const border = lineIndex === 0 ? '╭─' : '├─'
        print(['    '], [border, markerColor])
      }
      print(['    '], ['│ ', markerColor], [line[0], [markerColor, 'bold']], [' ' + line.slice(1)])
      if (lineIndex === shown.length - 1) {
        print(['    '], ['╰─', markerColor])
      }
    })
    if (!lines.length) {
      const detail = file.type === 'M' || file.type === 'T' ? 'metadata-only change' : 'empty file'
      print([`    (${detail})`, ['grey', 'dim']])
    }
    const remaining = lines.length - shown.length
    if (remaining > 0) {
      const path = './' + relative(process.cwd(), resolve(root, file.name))
      const quoted = "'" + path.replace(/'/g, "'\\''") + "'"
      let command = 'slop-diff-file'
      if (!file.lines) {
        const staged = await repo.raw([
          '--literal-pathspecs', 'diff', '--cached', '--name-only', '-z', 'HEAD', '--', file.name
        ])
        command = /[*?\[\]\\]/.test(path) ? 'git --literal-pathspecs diff' : 'git diff'
        if (staged) {
          command += ' HEAD'
        }
        command += ' --'
      }
      // Keep the command complete so long paths remain copyable.
      createPrinter(Infinity)([`    see full - ${command} `, ['grey', 'dim']],
        [quoted, ['grey', 'dim', 'italic']])
    }
  }
  print()
}

export default renderDiff
