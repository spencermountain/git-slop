import simpleGit from 'simple-git'
import chalk from 'chalk'
import yargs from 'yargs'
const args = process.argv

  console.log(args)
let path = process.cwd()
const repo = simpleGit(path)

let msg = args.slice(1).join(' ')
msg = msg.replace(/['"]/g, '')
msg = msg.trim()
msg = msg || ' - '
console.log(msg)

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
