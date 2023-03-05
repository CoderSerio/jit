const fs = require('fs-extra');
const fileTool = require('../utils/file');
const { prompt, error, emphasize } = require('../utils/notice');

module.exports = () => {
  const rootPath = process.cwd();
  const jitPath = fileTool.getJitPath(rootPath);

  if (jitPath) {
    const msg = error('init', `the dir ${emphasize('.jit')} already exists on ${jitPath}`);
    console.error(msg);
    return;
  }

  const msg = prompt('init', `repository is initialized on ${emphasize(rootPath)} 🎉`);
  console.log(msg);

  async function initFiles() {
    fs.ensureDir(`${rootPath}/.jit/objects`); // the local repository area
    fs.ensureFile(`${rootPath}/.jit/index`); // the index area
    fs.ensureFile(`${rootPath}/.jit/logs/HEAD`); // records all versions of the current branch
    fs.ensureFile(`${rootPath}/.jit/logs/refs`); // includes all the branchs
    fs.ensureFile(`${rootPath}/.jit/HEAD`); // records the current version(commit object's hashID)
  }

  (async () => {
    try {
      await initFiles();
    } catch (err) {
      const msg = error('init', `${err}`);
      console.error(msg);
    }
  })();
};