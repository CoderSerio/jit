const chalk = require('chalk');


function prompt(tag, msg) {
  const str = `[${tag}]: ${msg}`;
  return chalk.greenBright(str);
}

function warn(tag, msg) {
  const str = `[${tag}] WARN: ${msg}`;
  return chalk.yellowBright(str);
}

function error(tag, msg) {
  const str = `[${tag}] ERROR: ${msg}`;
  return chalk.red(str);
}

function emphasize(msg) {
  return chalk.italic(chalk.bold(msg));
}

module.exports = {
  prompt,
  warn,
  error,
  emphasize
};