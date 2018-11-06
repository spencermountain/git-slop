var yargs = require('yargs');
var exec = require('shelljs').exec;
var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ')
  .argv;

let msg = args['_'].join(' ');
msg = msg.replace(/['"]/g, '');
msg = msg.trim();

exec(`git commit -m '${msg}'`);
