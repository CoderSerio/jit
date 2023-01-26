const fs = require('fs-extra');
const fileTool = require('../utils/file');
const { prompt, error, emphasize } = require('../utils/notice');

module.exports = () => {
  const rootPath = process.cwd();
  const jitPath = fileTool.getJitPath(rootPath);

  if (jitPath) {
    const msg = error('init', `the dir ${emphasize('.jit')} already exists on ${jitPath}`)
    console.error(msg);
    return;
  }

  const msg = prompt('init', `repository is initialized on ${emphasize(rootPath)}`);
  console.log(msg);

  async function initFiles() {
    fs.ensureDir(`${rootPath}/.jit/objects`);
    fs.ensureFile(`${rootPath}/.jit/index`);
    fs.ensureFile(`${rootPath}/.jit/HEAD`);
    fs.ensureFile(`${rootPath}/.jit/logs/HEAD`);
  }

  (async () => {
    try {
      await initFiles();
    } catch (err) {
      const msg = error('init', `${err}`);
      console.error(msg);
    }
  })();
}