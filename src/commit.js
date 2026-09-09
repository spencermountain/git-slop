#! /usr/bin/env node
import chalk from 'chalk'
import { runInGitRepo } from './_git.js'

const msg = process.argv.slice(2).join(' ').trim()

if (!msg) {
  console.error('Usage: slop-commit <message>')
  process.exitCode = 1
} else {
  await runInGitRepo(async repo => {
    const result = await repo.commit(msg)
    if (!result.commit || !result.summary || result.summary.changes === 0) {
      console.log(chalk.magenta('\n                 -empty- '))
      return
    }
    let noun = result.summary.changes === 1 ? ' change' : ' changes'
    console.log(chalk.green('          +' + result.summary.changes + noun))
  })
}
