#! /usr/bin/env node
import chalk from 'chalk'
import { join } from 'path'
import got from 'got'
import { existsSync, readFileSync } from 'fs'

const findPkg = cwd => {
  for (let i = 0; i < 3; i += 1) {
    let tryPath = join(cwd, './package.json')
    if (existsSync(tryPath)) {
      return tryPath
    }
    cwd = join(cwd, '..')
  }
  return null
}

let cwd = process.cwd()
let pkg = findPkg(cwd)
if (!pkg) {
  console.error(chalk.red("Err: couldn't find package.json"))
  process.exit(1)
}

let obj = {}
try {
  obj = JSON.parse(readFileSync(pkg).toString())
  if (!obj || !obj.repository || !obj.repository.url) {
    throw 'no package.json'
  }
} catch (e) {
  console.error(chalk.red("Err: couldn't find repository information"))
  process.exit(1)
}

let repo = obj.repository.url || ''
repo = repo.replace(/^git\+/, '')
repo = repo.replace(/\.git$/, '')
repo = repo.replace(/^(https?|git):\/\/github.com\//, '')

if (!repo || repo.indexOf('/') === -1) {
  console.error(red("Err: couldn't find github repo name"))
  process.exit(1)
}

let url = `https://api.github.com/repos/${repo}/issues`
got(url)
  .then(res => {
    let data = JSON.parse(res.body)
    if (data.length === 0) {
      console.log(chalk.blue('\n   -    no open issues!   -\n'))
      process.exit(0)
    }
    data = data.slice(0, 5)
    data.forEach(o => {
      let title = o.title || ''
      if (title.length > 70) {
        title = title.substring(0, 60) + '..'
      }
      console.log(
        `    ${chalk.blue('#' + o.number)}   -  ${chalk.green(title)}`
      )
    })
  })
  .catch(console.log)
