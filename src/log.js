#!/usr/bin/env node
import { styleText } from 'node:util'
import spacetime from 'spacetime'
import { hasHead, runInGitRepo } from './_git.js'

const printLog = commits => {
  let lastDay = null
  commits.forEach((c, index) => {
    const s = spacetime(c.date)
    const email = c.author_email || ''
    let user = email.split('@')[0] || c.author_name
    if (email.endsWith('@users.noreply.github.com')) {
      user = user.replace(/^\d+\+/, '')
    }
    const day = `${s.year()}-${s.dayOfYear()}-${user}`
    if (day !== lastDay) {
      let out = s.format('{day-short} {month-short} {date-ordinal}')
      //add year, if necessary
      if (s.year() !== new Date().getFullYear()) {
        out += ' ' + s.year()
      }
      const arrow = index === 0 ? styleText('magenta', '↓ ') : '  '
      console.log(arrow + styleText('magenta', out) + ' ' + styleText(['yellow', 'dim'], '- ' + user))
    }
    lastDay = day
    let time = '    ' + s.format('time')
    time = time.padEnd(12, ' ')
    time = styleText('grey', time)

    let msg = c.message.split('\n')[0]
    msg = styleText('blue', msg)
    console.log(time + ' ' + msg)
  })
  const length = commits.length + ' commits total.'
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
