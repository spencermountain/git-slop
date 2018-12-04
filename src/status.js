#! /usr/bin/env node
const simpleGit = require('simple-git');
var chalk = require('chalk');
var yargs = require('yargs');
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

// var path = '/Users/spencer/mountain/wtf_wikipedia'
let path = argv['_'][0] || process.cwd();

const repo = simpleGit(path);

const printLine = function(file, symbol, color, isStaged) {
  let msg = chalk[color](symbol + ' ' + file);
  if (isStaged) {
    msg = msg.padStart(38, ' ') + chalk.grey('   | ');
  } else {
    msg = ''.padEnd(28, ' ') + chalk.grey('   |   ') + msg;
  }
  console.log(msg);
};

const printModified = function(arr, staged) {
  arr.forEach((file) => {
    printLine(file, '~', 'blue', staged[file]);
  })
}
const printNew = function(arr, staged) {
  arr.forEach((file) => {
    printLine(file, '+', 'green', staged[file]);
  })
}
const printRemoved = function(arr, staged) {
  arr.forEach((file) => {
    printLine(file, '-', 'red', staged[file]);
  })
}
const printMoved = function(arr, staged) {
  arr.forEach((file) => {
    printLine(file, '>', 'blue', staged[file]);
  })
}
const printConflicted = function(arr, staged) {
  arr.forEach((file) => {
    printLine(file, '❌', 'red', staged[file]);
  })
}

repo.status((err, status) => {
  let staged = status.staged.reduce((h, f) => {
    h[f] = true
    return h;
  }, {});
  status.created.forEach((f) => staged[f] = true)

  printConflicted(status.conflicted, staged)
  printModified(status.modified, staged)
  printNew(status.not_added, staged)
  printNew(status.created, staged)
  printRemoved(status.deleted, staged)
  printMoved(status.renamed, staged)
})
