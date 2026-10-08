const summarizePatch = patch => {
  const lines = []
  let removed = []
  let added = []
  let inHunk = false

  const flush = () => {
    // Pair replacements by position within the same changed block.
    const paired = Math.min(removed.length, added.length)
    added.slice(0, paired).forEach(line => lines.push('~' + line.slice(1)))
    lines.push(...removed.slice(paired), ...added.slice(paired))
    removed = []
    added = []
  }

  patch.split('\n').forEach(line => {
    if (line.startsWith('@@')) {
      flush()
      inHunk = true
    } else if (inHunk && line.startsWith('-')) {
      if (added.length) {
        flush()
      }
      removed.push(line)
    } else if (inHunk && line.startsWith('+')) {
      added.push(line)
    } else if (inHunk && !line.startsWith('\\')) {
      flush()
      if (!line.startsWith(' ')) {
        inHunk = false
      }
    }
  })
  flush()
  return lines
}

export default summarizePatch
