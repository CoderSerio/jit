const fileTool = require('../utils/file');
const path = require('path');

module.exports = () => {
    const jitPath = fileTool.getJitPath();
    if (!jitPath) {
        console.log('[rm cache] Error: the dir .jit not found. please run `jit init` first !');
        return;
    }

    const storagePath = path.resolve(jitPath, './.jit/index');
    fileTool.writeFile(storagePath, '');
    console.log('[rm-cache]: cleared!');
}