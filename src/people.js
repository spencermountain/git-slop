#! /usr/bin/env node
import chalk  from 'chalk'
import { hasHead, runInGitRepo } from './_git.js'

const baseDir = process.argv[2] || process.cwd()

await runInGitRepo(async repo => {
  if (!(await hasHead(repo))) {
    console.log('0 commits total.'.padStart(30, ' '))
    return
  }

  const [summary, total] = await Promise.all([
    repo.raw(['shortlog', '-sn', 'HEAD']),
    repo.raw(['rev-list', '--count', 'HEAD'])
  ])
  console.log(`${Number(total.trim()).toLocaleString()} commits total.`.padStart(30, ' '))

  summary.trim().split('\n').filter(Boolean).forEach(line => {
    const match = line.match(/^\s*(\d+)\s+(.+)$/)
    if (match) {
      const [, count, name] = match
      console.log(chalk.blue(name.padEnd(20)) + ' ' + chalk.yellow(Number(count).toLocaleString()))
    }
  })
}, baseDir)
