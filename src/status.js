#! /usr/bin/env node
var chalk = require('chalk')
var git = require("nodegit");
var yargs = require('yargs')
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

let path = argv['_'][0] || process.cwd()

const printNew = function(files) {
  let symbol = '+'
  let newFiles = files.filter((f) => f.isNew())
  newFiles.forEach((f, i) => {
    symbol = i > 0 ? ' ' : symbol
    console.log(chalk.green(symbol + ' ' + f.path()))
  })
  if (newFiles.length > 0) {
    console.log('')
  }
}
const printChanged = function(files) {
  let symbol = '~'
  let ls = files.filter((f) => f.isModified() || f.isTypechange() || f.isIgnored())
  ls.forEach((f, i) => {
    symbol = i > 0 ? ' ' : symbol
    console.log(chalk.blue(symbol + ' ' + f.path()))
  })
  if (ls.length > 0) {
    console.log('')
  }
}
const printMoved = function(files) {
  let symbol = '>'
  let ls = files.filter((f) => f.isRenamed())
  ls.forEach((f, i) => {
    symbol = i > 0 ? ' ' : symbol
    console.log(chalk.blue(symbol + ' ' + f.path()))
  })
  if (ls.length > 0) {
    console.log('')
  }
}
const printDeleted = function(files) {
  let symbol = '-'
  let ls = files.filter((f) => f.isIgnored() || f.isDeleted())
  ls.forEach((f, i) => {
    symbol = i > 0 ? ' ' : symbol
    console.log(chalk.red(symbol + ' ' + f.path()))
  })
  if (ls.length > 0) {
    console.log('')
  }
}
const printConflicted = function(files) {
  let symbol = '*'
  let ls = files.filter((f) => f.isConflicted())
  ls.forEach((f, i) => {
    symbol = i > 0 ? ' ' : symbol
    console.log(chalk.red(symbol + ' ' + f.path()))
  })
  if (ls.length > 0) {
    console.log('')
  }
}

git.Repository.openExt(path, 2, '~')
  .then(function(repo) {
    repo.getStatus().then(function(files) {
      console.log('')
      printNew(files)
      printDeleted(files)
      printChanged(files)
      printMoved(files)
      printConflicted(files)
    });
  })
  .catch(function(reason) {
    console.log(reason)
  })
