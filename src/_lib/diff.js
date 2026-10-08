import { lstat, readFile, readlink } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { hasHead } from '../_git.js'
import summarizePatch from './patch.js'

const diffOptions = ['--no-ext-diff', '--no-textconv', '--no-renames', '--no-color']
const changeSize = file => (file.added || 0) + (file.removed || 0)

const addedFile = async (root, name) => {
  const path = join(root, name)
  const stat = await lstat(path)
  if (stat.isDirectory()) {
    return { name, type: 'A', detail: 'submodule' }
  }
  const data = stat.isSymbolicLink() ? Buffer.from(await readlink(path)) : await readFile(path)
  if (data.includes(0)) {
    return { name, type: 'A', detail: 'binary file' }
  }
  let added = 0
  data.forEach(byte => {
    if (byte === 10) {
      added += 1
    }
  })
  if (data.length && data[data.length - 1] !== 10) {
    added += 1
  }
  const lines = data.toString('utf8').split('\n').slice(0, added).map(line => '+' + line)
  return { name, type: 'A', added, removed: 0, lines }
}

const changes = async (repo, prefix) => {
  const root = (await repo.revparse(['--show-toplevel'])).trim()
  const scope = prefix === undefined ? [] : [relative(root, resolve(prefix)).split(sep).join('/') || '.']
  repo.cwd(root)
  const committed = await hasHead(repo)
  const files = []
  if (committed) {
    const args = ['--literal-pathspecs', 'diff', ...diffOptions, 'HEAD']
    const names = (await repo.raw([...args, '--name-status', '-z', '--', ...scope])).split('\0')
    const stats = (await repo.raw([...args, '--numstat', '-z', '--', ...scope])).split('\0')
    const types = new Map()
    for (let i = 0; i < names.length - 1; i += 2) {
      types.set(names[i + 1], names[i])
    }
    stats.filter(Boolean).forEach(entry => {
      const [, added, removed, name] = entry.match(/^([^\t]+)\t([^\t]+)\t([\s\S]*)$/)
      files.push({
        name,
        type: types.get(name),
        added: Number(added),
        removed: Number(removed),
        detail: added === '-' ? 'binary file' : ''
      })
    })
  }
  // Before the first commit, every existing file is an addition.
  const args = ['--literal-pathspecs', 'ls-files', '--others', '--exclude-standard', '-z']
  if (!committed) {
    args.push('--cached')
  }
  const names = new Set((await repo.raw([...args, '--', ...scope])).split('\0').filter(Boolean))
  for (const name of names) {
    try {
      files.push(await addedFile(root, name))
    } catch (err) {
      // A staged file may have been removed again before the first commit.
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }
  return files.sort((a, b) => changeSize(b) - changeSize(a) || a.name.localeCompare(b.name))
}

const preview = async (repo, file) => {
  if (file.lines) {
    return file.lines
  }
  const patch = await repo.raw([
    '--literal-pathspecs', 'diff', ...diffOptions, '--unified=0', 'HEAD', '--', file.name
  ])
  return summarizePatch(patch)
}

export { changes, preview }
