const fileTool = require('../utils/file');
const path = require('path');
const { error, emphasize, prompt } = require('../utils/notice');

module.exports = () => {
    const jitPath = fileTool.getJitPath();
    if (!jitPath) {
        const msg = error('rm cache', `the dir .jit not found. please run ${emphasize('jit init')} first !`);
        console.error(msg);
        return;
    }

    const storagePath = path.resolve(jitPath, './.jit/index');
    fileTool.writeFile(storagePath, '');
    const msg = prompt('rm-cache', 'cleared!');
    console.log(msg);
}