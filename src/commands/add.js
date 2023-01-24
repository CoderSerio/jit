const fs = require('fs-extra');
const path = require('path');
const fileTool = require('../utils/file');

function getBlobObjects (rootPath) {
  const blobObjs = [];
  
  function getter (path) {
    const items = fs.readdirSync(path);
    items.forEach((itemName) => {
      if (itemName !== '.jit') {
        const filePath = `${path}/${itemName}`;
        const status = fs.statSync(filePath);
        const isFile = status.isFile();
        const isDir = status.isDirectory();
        if (isFile) {
          const fileContent = fileTool.readFile(filePath, true); 
          const hashID = fileTool.SHA1(fileContent);
          const compressedContent = fileTool.compress(fileContent);
          blobObjs.push({
            hashID,
            path: filePath,
            content: compressedContent,
          });
        } else if (isDir) {
          return getter(filePath);
        }
      }
    })
  }

  getter(rootPath);

  return blobObjs;
}

module.exports = () => {
  const jitPath = fileTool.getJitPath();
  if (!jitPath) {
    console.log('[add] Error: the dir .jit not found. please run `jit init` first !');
    return;
  }
  
  const blobObjs = getBlobObjects(jitPath);
  let storageContent = '';
  blobObjs?.forEach((blobObj) => {
    // 创建blob objects文件
    const objectPath = path.resolve(jitPath, `./.jit/objects/${blobObj.hashID}`);
    fileTool.writeFile(objectPath, `blob ${blobObj.content}`);
    // 拼接缓存区内容
    storageContent += `${blobObj.hashID} ${blobObj.path}\n`;
  });
  // 写入缓存区
  const storagePath = path.resolve(jitPath, './.jit/index');
  fileTool.writeFile(storagePath, storageContent);
}