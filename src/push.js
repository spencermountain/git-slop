var yargs = require('yargs');
var chalk = require('chalk');
var shelljs = require('shelljs');
shelljs.config.silent = true;

var args = yargs
  .usage('gp')
  .argv;

shelljs.exec(`git push`, function(code, stdout, stderr) {
  if (code !== 0 || stderr) {
    console.log(stderr);
    process.exit(1);
  }
  console.log(stdout);
  console.log('');
  console.log(chalk.green('             ✅   '));
});
