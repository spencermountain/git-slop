#!/usr/bin/env node
import { styleText } from 'node:util'
import { runInGitRepo } from './_git.js'

await runInGitRepo(async repo => {
  await repo.push()
  console.log(styleText('green', '  ✓'))
})
