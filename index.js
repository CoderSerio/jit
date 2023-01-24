#!/usr/bin/env node
const program = require('commander');
const pkg = require('./package.json');
const init = require('./src/commands/init');
const add = require('./src/commands/add');
const commit = require('./src/commands/commit');
const status = require('./src/commands/status');
const rmChache = require('./src/commands/rm-cache');
const log = require('./src/commands/log');
const clone = require('./src/commands/clone')

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
  .command('rm-chache')
  .description('clear the storage')
  .action((options) => {
    rmChache(options);
  });

program
  .command('log')
  .description('display all the commit logs')
  .action((options) => {
    log(options);
  });

program
  .command('clone')
  .description('clone program to localhost from the remote')
  .argument('<string>', 'the remote repository url')
  .action((str) => {
    clone(str);
  });

program
  .version(pkg.version)
  .option('-test', 'just a test command')


program.parse(process.argv);
