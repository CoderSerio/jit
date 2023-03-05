const fileTool = require('../utils/file');
const path = require('path');
const fs = require('fs-extra');
const { error, warn, emphasize } = require('../utils/notice');

// generate hashID for the tree objects, and compres the content of files
function getHashID(treeObject) {
  let content = '';
  treeObject.content.forEach((child) => {
    content += `${child.type} ${child.hashID} ${child.path}\n`;
  });
  // 格式化并压缩
  treeObject.content = fileTool.compress(content);
  const HashID = fileTool.SHA1(content);
  return HashID;
}

// read the storage, build hash-path map
function getHash2PathMap(jitPath) {
  const hash2path = {};
  const storagePath = path.resolve(jitPath, './.jit/index');

  const storageContentLines = fileTool.readFile(storagePath).split('\n');
  storageContentLines.pop(); // extra line
  storageContentLines.forEach((line) => {
    const hashID = line.slice(0, 40); // the length of the res of the SHA-1 is 40
    const filePath = line.slice(41);
    hash2path[hashID] = filePath;
  });
  return hash2path;
}

function getTreeObjects(jitPath, hash2path) {
  const objectsPath = path.resolve(jitPath, './.jit/objects');
  // read the objects, build file tree
  // and commit record is based on the storage 
  const fileTree = {};
  const fileTreeIndexs = [];
  const fileObjs = fs.readdirSync(objectsPath);

  // make blob object node linked to its parent tree object node
  fileObjs.forEach((hashID) => {
    const filePath = hash2path[hashID];
    if (filePath) { // filter the non-storage node
      const objectPath = path.resolve(objectsPath, hashID);
      const type = fileTool.readFile(objectPath, true).split(' ')[0];
      const treeObjectFilePath = path.resolve(filePath, '..');

      if (!fileTree[treeObjectFilePath]) {
        fileTree[treeObjectFilePath] = {
          hashID: '',
          content: [],
        };
      }

      fileTree[treeObjectFilePath].content.push({
        type,
        hashID,
        path: filePath,
      });

      if (!fileTreeIndexs.includes(treeObjectFilePath)) {
        fileTreeIndexs.push(treeObjectFilePath);
      }
    }
  });

  // from bottom to top, buiding the tree
  // traversing in reverse order makes it start from the leaf blob node
  // ( empty folders will be ignored )  
  for (let i = fileTreeIndexs.length - 1; i >= 0; i--) {
    const treeObjectFilePath = fileTreeIndexs[i];

    const hashID = getHashID(fileTree[treeObjectFilePath]);
    fileTree[treeObjectFilePath].hashID = hashID;

    const treeObject = {
      type: 'tree',
      hashID,
      path: treeObjectFilePath,
    };

    // exposing one child node to parent its parent node 
    if (treeObjectFilePath !== jitPath) {
      const parentFilePath = path.resolve(treeObjectFilePath, '..');
      if (!fileTree[parentFilePath]) {
        fileTree[parentFilePath] = {
          hashID: '',
          content: [],
        };
      }
      fileTree[parentFilePath]?.content.push(treeObject);
    }
  }

  return [fileTree, fileTreeIndexs];
}

function writeCommitRecord(jitPath, rootHashID, msg) {
  const logsPath = path.resolve(jitPath, './.jit/logs/HEAD');
  const storagePath = path.resolve(jitPath, './.jit/index');
  const headPath = path.resolve(jitPath, './.jit/HEAD');

  const lastRootHashID = fileTool.readFile(headPath);
  const previousCommitHashID = lastRootHashID ? lastRootHashID : '0'.repeat(40); // first commit by default

  if (previousCommitHashID === rootHashID) { //  avoid commit the same content to make the list loop back
    const msg = error('commit', 'noting changed to commit');
    console.error(msg);
    return;
  }

  const record = `${previousCommitHashID} ${rootHashID} ${new Date()} ${msg}\n`;

  fileTool.writeFile(logsPath, record, 'a');
  fileTool.writeFile(headPath, rootHashID); // overwirte the .jit/HEAD
  fileTool.writeFile(storagePath, ''); // overwrite the .jit/index
}

module.exports = (options) => {
  if (!options?.msg) {
    const msg = error('commit', `no message text. please run ${emphasize('jit commit -m <string>')} !`);
    console.error(msg);
    return;
  }

  const jitPath = fileTool.getJitPath();
  if (!jitPath) {
    const msg = error('commit', `the dir ${emphasize('.jit')} not found. please run ${emphasize('jit init')} first !`);
    console.error(msg);
    return;
  }

  const hash2path = getHash2PathMap(jitPath);
  if (!Object.keys(hash2path).length) {
    const msg = warn('commit', 'nothing to commit!');
    console.warn(msg);
    return;
  }

  const objectsPath = path.resolve(jitPath, './.jit/objects');
  const [treeObjects, treeObjectsIndex] = getTreeObjects(jitPath, hash2path);

  treeObjectsIndex.forEach((fileIndex) => {
    const treeObject = treeObjects[fileIndex];
    const hashID = treeObject.hashID;
    const content = `tree ${treeObject.content}`;
    fileTool.writeFile(`${objectsPath}/${hashID}`, content);
  });

  const rootHashID = treeObjects[jitPath].hashID;
  writeCommitRecord(jitPath, rootHashID, options.msg);
};