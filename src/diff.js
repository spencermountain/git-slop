#!/usr/bin/env node
import { runInGitRepo } from './_git.js'
import { changes } from './_lib/diff.js'
import renderDiff from './_lib/render-diff.js'

const directoryFilter = process.argv[2]

await runInGitRepo(async repo => {
  const files = await changes(repo, directoryFilter)
  await renderDiff(repo, files)
})
