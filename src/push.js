var chalk = require('chalk')
var shelljs = require('shelljs')
shelljs.config.silent = true
const ora = require('ora')

const spinner = ora('').start()
spinner.color = 'green'

shelljs.exec(`git push`, function(code, hmm, stdout) {
  if (code !== 0) {
    spinner.stopAndPersist({
      symbol: '↩',
      text: ''
    })
    console.log(stdout)
    process.exit(1)
  }
  spinner.stopAndPersist({
    symbol: chalk.green('\n  ✔️'),
    text: ''
  })
})
