var yargs = require('yargs');
var chalk = require('chalk');
var shelljs = require('shelljs');
shelljs.config.silent = true;

var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ')
  .argv;

let msg = args['_'].join(' ');
msg = msg.replace(/['"]/g, '');
msg = msg.trim();
msg = msg || ' - ';

shelljs.exec(`git commit -m '${msg}'`, function(code, stdout, stderr) {
  console.log(stdout);
  if (code !== 0 || stderr) {
    console.log(stderr);
    process.exit(1);
  }
  console.log('');
  console.log(chalk.green('             ✅   '));
});
