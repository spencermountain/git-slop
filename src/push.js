import chalk from 'chalk'
import shell from 'shelljs'
shell.config.silent = true
import ora from 'ora'

const spinner = ora('').start()
spinner.color = 'green'

shell.exec(`git push`, function(code, hmm, stdout) {
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
