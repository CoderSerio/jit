const path = require('path');
const fs = require('fs-extra');
const fileTool = require('../utils/file');

module.exports = () => {
    const rootPath = process.cwd();
    const jitPath = fileTool.getJitPath(rootPath);

    if (jitPath) {
      console.error(`[init] Error: the dir .jit already exits on ${jitPath}`);
      return;
    }

    console.log(`Initializing on ${rootPath}...`);

    async function initFiles (){
      fs.ensureDir(`${rootPath}/.jit/objects`);
      fs.ensureFile(`${rootPath}/.jit/index`);
      fs.ensureFile(`${rootPath}/.jit/HEAD`);
      fs.ensureFile(`${rootPath}/.jit/logs/HEAD`);
    }
 
    (async () => {
      try {
        await initFiles();
      } catch (err) {
        console.error('[init] Error: unknown error, something goes wrong.');
      }
    })(); 
}