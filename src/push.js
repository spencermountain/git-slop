#! /usr/bin/env node
import chalk from 'chalk'
import { runInGitRepo } from './_git.js'

await runInGitRepo(async repo => {
  await repo.push()
  console.log(chalk.green('  ✓'))
})
