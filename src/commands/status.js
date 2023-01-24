const fileTool = require('../utils/file');
const path = require('path');

module.exports = () => {
    const jitPath = fileTool.getJitPath();
    if (!jitPath) {
        console.log('[status] Error: the dir .jit not found. please run `jit init` first !');
        return;
    }
    const storagePath = path.resolve(jitPath, './.jit/index');
    const storageContent = fileTool.readFile(storagePath);
    console.log('===== Storage Content =====\n'); 
    console.log(storageContent);
    console.log('===== =============== ====='); 
}