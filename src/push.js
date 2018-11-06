var chalk = require('chalk');
var shelljs = require('shelljs');
shelljs.config.silent = true;
const ora = require('ora');

const spinner = ora(' - ').start();
spinner.color = 'green';

shelljs.exec(`git push`, function(code, stdout, stderr) {
  console.log('---');
  console.log('1', stdout);
  console.log('2', stderr);
  console.log('---');
  if (code !== 0 || stderr) {
    spinner.stopAndPersist({
      symbol: '',
      text: '',
    });
    console.log(stderr);
    process.exit(1);
  }
  spinner.stopAndPersist({
    symbol: '✔️'
  });
  console.log(chalk.green('             ✅   '));
});
