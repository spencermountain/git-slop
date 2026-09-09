#! /usr/bin/env node
import chalk from 'chalk'
import spacetime from 'spacetime'
import { hasHead, runInGitRepo } from './_git.js'

const printLog = function(commits) {
  let lastDay = null
  commits.forEach(c => {
    let s = spacetime(c.date)
    let user = c.author_name
    let day = `${s.year()}-${s.dayOfYear()}-${user}`
    if (day !== lastDay) {
      let out = chalk.magenta(s.format('MMM d'))
      //add year, if necessary
      if (s.year() !== new Date().getFullYear()) {
        out += ' ' + s.year()
      }
      console.log(out.padEnd(18, ' ') + chalk.yellow('- ' + user + ' -'))
    }
    lastDay = day
    let time = '    ' + s.format('time')
    time = time.padEnd(12, ' ')
    time = chalk.grey(time)

    let msg = c.message.split('\n')[0]
    msg = chalk.blue(msg)
    console.log(time + ' ' + msg)
  })
  let length = commits.length + ' commits total.'
  console.log(length.padStart(30, ' '))
}

const baseDir = process.argv[2] || process.cwd()

await runInGitRepo(async repo => {
  if (!(await hasHead(repo))) {
    printLog([])
    return
  }
  const result = await repo.log({ maxCount: 25 })
  printLog(result.all)
}, baseDir)
