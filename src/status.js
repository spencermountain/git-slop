#! /usr/bin/env node
var chalk = require('chalk');
var git = require("nodegit");
var yargs = require('yargs');
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

let path = argv['_'][0] || process.cwd();

const isStaged = function(f) {
  return f.inIndex() !== 0;
};

const printLine = function(f, symbol, color) {
  let msg = chalk[color](symbol + ' ' + f.path());
  if (isStaged(f)) {
    msg = msg.padStart(38, ' ') + chalk.grey('   | ');
  } else {
    msg = ''.padEnd(28, ' ') + chalk.grey('   |   ') + msg;
  }
  console.log(msg);
};

const printNew = function(files) {
  let newFiles = files.filter((f) => f.isNew());
  newFiles.forEach((f) => {
    printLine(f, '+', 'green');
  });
};

const printChanged = function(files) {
  let ls = files.filter((f) => f.isModified() || f.isTypechange() || f.isIgnored());
  ls.forEach((f) => {
    printLine(f, '~', 'blue');
  });
};
const printMoved = function(files) {
  let ls = files.filter((f) => f.isRenamed());
  ls.forEach((f) => {
    printLine(f, '>', 'blue');
  });
};
const printDeleted = function(files) {
  let ls = files.filter((f) => f.isIgnored() || f.isDeleted());
  ls.forEach((f) => {
    printLine(f, '-', 'red');
  });
};
const printConflicted = function(files) {
  let ls = files.filter((f) => f.isConflicted());
  ls.forEach((f) => {
    printLine(f, '*', 'red');
  });
};

git.Repository.openExt(path, 2, '~')
  .then(function(repo) {
    repo.getStatus().then(function(files) {
      console.log('');
      printNew(files);
      printDeleted(files);
      printChanged(files);
      printMoved(files);
      printConflicted(files);
    });
  })
  .catch(function(reason) {
    console.log(reason);
  });
