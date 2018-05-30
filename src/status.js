#! /usr/bin/env node
var chalk = require('chalk')
var git = require("nodegit");
var yargs = require('yargs')
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

let path = argv['_'][0]

const printNew=function(files){
  let newFiles=files.filter((f) => f.isNew())
  newFiles.forEach((f) => {
    console.log(chalk.green('+  '+f.path()))
  })
}
const printChanged=function(files){
  let dirty=files.filter((f) => f.isModified() || f.isTypechange() || f.isIgnored())
  dirty.forEach((f) => {
    console.log(chalk.blue('~  '+f.path()))
  })
}
const printMoved=function(files){
  let dirty=files.filter((f) => f.isRenamed())
  dirty.forEach((f) => {
    console.log(chalk.blue('>  '+f.path()))
  })
}
const printDeleted=function(files){
  let dirty=files.filter((f) => f.isIgnored() || f.isDeleted())
  dirty.forEach((f) => {
    console.log(chalk.red('-  '+f.path()))
  })
}
const printConflicted=function(files){
  let dirty=files.filter((f) => f.isConflicted())
  dirty.forEach((f) => {
    console.log(chalk.red('*  '+f.path()))
  })
}

git.Repository.open(path)
  .then(function(repo) {
    repo.getStatus().then(function(files) {
      printNew(files)
      printDeleted(files)
      printChanged(files)
      printMoved(files)
      printConflicted(files)
    });
});
