var yargs = require('yargs');
var exec = require('shelljs').exec;
var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ')
  .argv;

let msg = args['_'].join(' ');
msg = msg.replace(/['"]/g, '');
msg = msg.trim();

exec();

exec(`git commit -m '${msg}'`, function(code, stdout, stderr) {
  console.log('Exit code:', code);
  console.log('Program output:', stdout);
  console.log('Program stderr:', stderr);
});
