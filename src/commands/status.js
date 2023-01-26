const fileTool = require('../utils/file');
const path = require('path');
const { error, emphasize } = require('../utils/notice');

module.exports = () => {
    const jitPath = fileTool.getJitPath();
    if (!jitPath) {
        const msg = error('status', `the dir ${emphasize('.jit')} not found. please run ${emphasize('jit init')} first !`);
        console.error(msg);
        return;
    }
    const storagePath = path.resolve(jitPath, './.jit/index');
    const storageContent = fileTool.readFile(storagePath);
    console.log('===== Storage Content =====\n');
    console.log(storageContent);
    console.log('===== =============== =====');
}