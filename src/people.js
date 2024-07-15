#! /usr/bin/env node
import simpleGit from 'simple-git'
import './_polyfill.js'
import chalk  from 'chalk'

let path = process.cwd()

const repo = simpleGit(path)

const printLog = function (commits) {
  commits.forEach(c => {
    let str = c.author_name || c.author_email
    all[str] = all[str] || 0
    all[str] += 1
  })
  let length = commits.length.toLocaleString() + ' commits total.'
  console.log(length.padStart(30, ' '))
}



let all = {}
repo.log(function (_err, res) {
  printLog(res.all)
  let people = Object.entries(all)
  people = people.sort((a, b) => {
    if (a[1] > b[1]) {
      return -1
    } else if (a[1] < b[1]) {
      return 1
    }
    return 0
  })
  people.forEach(a => {
    let [name, count] = a
    console.log(chalk.blue(name.padEnd(20)) + ' ' + chalk.yellow(count.toLocaleString()))
  })
  // console.log(JSON.stringify(Object.keys(all), null, 2))
})
