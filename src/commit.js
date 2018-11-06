var yargs = require('yargs');
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
  if (code !== 0 || stderr) {
    console.log(stderr);
    process.exit(1);
  }
});
