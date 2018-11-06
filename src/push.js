var chalk = require('chalk');
var shelljs = require('shelljs');
shelljs.config.silent = true;
const ora = require('ora');

const spinner = ora(' - ').start();
spinner.color = 'green';

shelljs.exec(`git push`, function(code, stdout, stderr) {
  if (code !== 0 || stderr) {
    console.log(stderr);
    process.exit(1);
  }
  console.log('');
  spinner.stopAndPersist({
    symbol: '✔️'
  });
  console.log(chalk.green('             ✅   '));
});
