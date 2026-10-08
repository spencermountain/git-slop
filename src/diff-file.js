#!/usr/bin/env node
import { lstat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInGitRepo } from './_git.js'
import { changes } from './_lib/diff.js'
import renderDiff from './_lib/render-diff.js'

const filename = process.argv[2]

if (!filename || process.argv.length !== 3) {
  console.error('Usage: slop-diff-file <file>')
  process.exitCode = 1
} else {
  await runInGitRepo(async repo => {
    const path = resolve(filename)
    const stat = await lstat(path).catch(err => {
      if (err.code === 'ENOENT') {
        return null
      }
      throw err
    })
    if (stat?.isDirectory()) {
      throw new Error('expected a file; use slop-diff for directories')
    }
    const root = (await repo.revparse(['--show-toplevel'])).trim()
    const files = (await changes(repo, filename)).filter(file => resolve(root, file.name) === path)
    if (!stat && !files.length) {
      throw new Error(`file not found: ${filename}`)
    }
    await renderDiff(repo, files, { full: true })
  })
}
