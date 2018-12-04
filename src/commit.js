const simpleGit = require('simple-git');
var chalk = require('chalk');
var yargs = require('yargs');
var args = yargs
  .usage('gc <msg>')
  .example('gc these pretezels are making me thirsty ')
  .argv;

let path = process.cwd();
const repo = simpleGit(path);

let msg = args['_'].join(' ');
msg = msg.replace(/['"]/g, '');
msg = msg.trim();
msg = msg || ' - ';

// shelljs.exec(`git commit -m '${msg}'`, function(code, stdout, stderr) {
//   if (code !== 0 || stderr) {
//     console.log(stderr);
//     process.exit(1);
//   }
// });
repo.commit(msg, function(err, r) {
  if (err) {
    console.log(err)
  } else {
    console.log(r)
    console.log(chalk.green('\n  ✔️'))
  }
})
