#! /usr/bin/env node
var chalk = require('chalk')
var git = require("nodegit");
var yargs = require('yargs')
var spacetime = require('spacetime')
var argv = yargs
  .usage('gs <path>')
  .example('gs ./my/repo')
  .argv;

let path = argv['_'][0]
const countCommits = function(repo) {
  let lastDay = null
  var walker = git.Revwalk.create(repo);
  // walker.pushHead();
  walker.pushGlob('refs/heads/*');
  walker.getCommitsUntil(c => true).then(function(commits) {
    commits = commits.reverse()
    commits.forEach((c) => {
      let d = c.date()
      let s = spacetime(d.getTime())
      let day = s.dayOfYear()
      if (day !== lastDay) {
        console.log(chalk.magenta(s.format('MMM d')))
      }
      lastDay = day
      let time = '   -  ' + s.format('time')
      time = time.padEnd(18, ' ')
      time = chalk.grey(time)

      let msg = c.message().split('\n')[0]
      msg = chalk.blue(msg)
      console.log(time + ' ' + msg)
    })
    let length = commits.length + ' commits total.'
    console.log(length.padStart(30, ' '))
  })
}


git.Repository.open(path)
  .then(function(repo) {
    countCommits(repo)
  })
