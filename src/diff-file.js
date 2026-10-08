#!/usr/bin/env node
import { lstat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInGitRepo } from './_git.js'
import { changes } from './_lib/diff.js'
import renderDiff from './_lib/render-diff.js'

const args = process.argv.slice(2)
if (args[0] === '--') {
  args.shift()
}
const filename = args[0]

if (args.length > 1 || filename === '') {
  console.error('Usage: slop-diff-file [--] [file]')
  process.exitCode = 1
} else {
  await runInGitRepo(async repo => {
    if (filename === undefined) {
      const files = await changes(repo)
      await renderDiff(repo, files)
      return
    }
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
