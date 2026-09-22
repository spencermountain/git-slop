#! /usr/bin/env node
'use strict'
import { styleText } from 'node:util'
import { runInGitRepo } from './_git.js'

const printLine = function(file, symbol, color, isStaged) {
  let msg = symbol + ' ' + file
  if (isStaged) {
    msg = styleText(color, msg.padStart(35, ' ')) + styleText('grey', '   | ')
  } else {
    msg = ''.padEnd(35, ' ') + styleText('grey', '   |   ') + styleText(color, msg)
  }
  console.log(msg)
}

const printModified = function(arr, staged) {
  arr.forEach(file => {
    printLine(file, '~', 'blue', staged[file])
  })
}
const printNew = function(arr, staged) {
  arr.forEach(file => {
    printLine(file, '+', 'green', staged[file])
  })
}
const printRemoved = function(arr, staged) {
  arr.forEach(file => {
    printLine(file, '-', 'red', staged[file])
  })
}
const printMoved = function(arr, staged) {
  arr.forEach(file => {
    printLine(file, '>', 'yellow', staged[file])
  })
}
const printConflicted = function(arr, staged) {
  arr.forEach(file => {
    printLine(file, '❌', 'red', staged[file])
  })
}

const baseDir = process.argv[2] || process.cwd()

await runInGitRepo(async (repo) => {
  const status = await repo.status()
  if (status.isClean()) {
    console.log(styleText('green', '  ✓'))
    return
  }

  let staged = status.staged.reduce((h, f) => {
    h[f] = true
    return h
  }, {})
  let renamed = status.renamed.map(o => o.to)
  status.created.forEach(f => (staged[f] = true))
  renamed.forEach(f => (staged[f] = true))
  printConflicted(status.conflicted, staged)
  printModified(status.modified, staged)
  printNew(status.not_added, staged)
  printNew(status.created, staged)
  printRemoved(status.deleted, staged)
  printMoved(renamed, staged)
}, baseDir)
