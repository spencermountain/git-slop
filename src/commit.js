const simpleGit = require('simple-git')
var chalk = require('chalk')
var yargs = require('yargs')
var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ').argv

let path = process.cwd()
const repo = simpleGit(path)

let msg = args['_'].join(' ')
msg = msg.replace(/['"]/g, '')
msg = msg.trim()
msg = msg || ' - '

repo.commit(msg, function(err, r) {
  if (err) {
    console.log(err)
    return
  }
  if (!r || !r.commit || !r.summary || r.summary.changes === 0) {
    console.log(chalk.magenta('\n                 -empty- '))
    return
  }
  let noun = ' change'
  if (r.summary.changes > 1) {
    noun += 's'
  }
  console.log(chalk.green('          +' + r.summary.changes + noun))
})
