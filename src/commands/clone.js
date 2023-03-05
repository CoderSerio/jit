const shell = require('shelljs');
const { prompt, emphasize, error } = require('../utils/notice');

module.exports = (url, option) => {
  if (option.mode === 'git') { // git mode
    if (!shell.which('git')) {
      console.error(error('clone', `please install ${emphasize('git')} first!`));
      shell.exit(1);
    } else {
      shell.exec(`git clone ${url}`);
    }
  } else if (!option.mode) { // default case, jit mode
    console.log(prompt('clone',
      `there is no ${emphasize('JitHub')} yet...maybe someday will be?`));
  } else {
    console.error(error('clone', `unknow mode ${emphasize(option.mode)}`));
  }
};