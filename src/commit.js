var yargs = require('yargs');
var chalk = require('chalk');
var exec = require('shelljs').exec;
var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ')
  .argv;

let msg = args['_'].join(' ');
msg = msg.replace(/['"]/g, '');
msg = msg.trim();

exec(`git commit -m '${msg}'`, function(code, stdout, stderr) {
  if (code !== 0 || stderr) {
    console.log(stderr);
    process.exit(1);
  }
  console.log('');
  console.log(chalk.green('   ✅   '));
});
