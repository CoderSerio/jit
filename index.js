#!/usr/bin/env node
const program = require('commander');
const pkg = require('./package.json');
const init = require('./src/commands/init');
const add = require('./src/commands/add');
const commit = require('./src/commands/commit');
const status = require('./src/commands/status');
const rmCache = require('./src/commands/rm-cache');
const log = require('./src/commands/log');
const { prompt, emphasize } = require('./src/utils/notice');
// const clone = require('./src/commands/clone');

// handle the command
program
  .command('init')
  .description('initialize the Jit files')
  .action((options) => {
    init(options);
  });

program
  .command('add')
  .description('add all the files into storage')
  .action((options) => {
    add(options);
  });

program
  .command('commit')
  .description('create a commit record')
  .option('-m, --msg <string>', 'Add a msg for this commit')
  .action((options) => {
    commit(options);
  });

program
  .command('status')
  .description('log the status of the storage')
  .action((options) => {
    status(options);
  });

program
  .command('rm-cache')
  .description('clear the storage')
  .action((options) => {
    rmCache(options);
  });

program
  .command('log')
  .description('display all the commit logs')
  .action((options) => {
    log(options);
  });

// program
//   .command('clone')
//   .description('clone program to localhost from the remote')
//   .argument('<string>', 'the remote repository url')
//   .action((str) => {
//     clone(str);
//   });

program
  .version(pkg.version)
  .description(`${prompt('Jit',
    `\nMore features will be supported soon... \nRecent plan is adjust the storage structure to make it more suitable for JavaScript.\nWelcome to come up with more ideas and join us: ${emphasize('https://github.com/CoderSerio/jit')}`)}`)

program.parse(process.argv);
