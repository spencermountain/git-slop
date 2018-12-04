#! /usr/bin/env node
const simpleGit = require('simple-git');
var chalk = require('chalk');
var yargs = require('yargs');
var spacetime = require('spacetime');
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

let path = argv['_'][0] || process.cwd();

const repo = simpleGit(path);

const printLog = function(commits) {
  let lastDay = null
  commits.forEach((c) => {
    let s = spacetime(c.date.substr(0, 19));
    let user = c.author_name;
    let day = s.dayOfYear() + user;
    if (day !== lastDay) {
      let out = chalk.magenta(s.format('MMM d'));
      //add year, if necessary
      if (s.year() !== new Date().getFullYear()) {
        out += ' ' + s.year();
      }
      console.log(out.padEnd(18, ' ') + chalk.yellow('- ' + user + ' -'));
    }
    lastDay = day;
    let time = '    ' + s.format('time');
    time = time.padEnd(12, ' ');
    time = chalk.grey(time);

    let msg = c.message.split('\n')[0];
    msg = chalk.blue(msg);
    console.log(time + ' ' + msg);
  });
  let length = commits.length + ' commits total.';
  console.log(length.padStart(30, ' '));
};

// git.Repository.openExt(path, 2, '~')
//   .then(function(repo) {
//     countCommits(repo);
//   });
repo.log(function(err, res) {
  let commits = res.all.slice(0, 25)
  printLog(commits)
})
