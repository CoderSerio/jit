const fileTool = require('../utils/file')
const path = require('path');
const fs = require('fs-extra');

// 为tree节点生成hashID, 顺便压缩其content
function getHashID(treeObject) {
  let content = '';
  treeObject.content.forEach((child) => {
    content += `${child.type} ${child.hashID} ${child.path}\n`;
  })
  // 格式化并压缩
  treeObject.content = fileTool.compress(content);
  const HashID = fileTool.SHA1(content);
  return HashID;
}

// 读取暂存区, 构建映射表
function getHash2PathMap (jitPath) {
  const hash2path = {}; 
  const storagePath = path.resolve(jitPath, './.jit/index');

  const storageContentLines = fileTool.readFile(storagePath).split('\n');
  storageContentLines.pop(); // 末尾会多余的空行
  storageContentLines.forEach((line) => {
    const hashID = line.slice(0, 40); // SHA-1摘要固定长度40
    const filePath = line.slice(41);
    hash2path[hashID] = filePath;
  });
  return hash2path;
}

function getTreeObjects(jitPath, hash2path) {
  const objectsPath = path.resolve(jitPath, './.jit/objects');
  // 读取本地仓库区, 构建文件树
  // 不可以直接遍历根目录, 因为commit是需要以暂存区内容为前提的, 必须按照映射表的内容来
  const fileTree = {};
  const fileTreeIndexs = [];
  const fileObjs = fs.readdirSync(objectsPath);
  
  // 将blob节点挂到父级tree节点
  fileObjs.forEach((hashID) => {
    const filePath = hash2path[hashID];
    if (filePath) { // 排除非映射表内的节点
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
  
  // 自底向上构建tree
  // 逆序遍历能保证从叶子节点开始
  for (let i = fileTreeIndexs.length - 1; i >= 0; i --) {
    const treeObjectFilePath = fileTreeIndexs[i];
    
    const hashID = getHashID(fileTree[treeObjectFilePath]);
    fileTree[treeObjectFilePath].hashID = hashID;

    const treeObject = {
      type: 'tree',
      hashID,
      path: treeObjectFilePath,
    };

    // 将子节点呈递给父节点
    if (treeObjectFilePath !== jitPath) {
      const parentFilePath = path.resolve(treeObjectFilePath, '..'); 
      if (!fileTree[parentFilePath]) {
        fileTree[parentFilePath] = {
          hashID: '',
          content: [],
        }
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
  const previousCommitHashID = lastRootHashID ? lastRootHashID : '0'.repeat(40); // 默认为首次commit
  
  if (previousCommitHashID === rootHashID) { // 避免同样的内容重复提交导致链表出现回环
    console.error('[commit] Error: nothing changed to commit!');
    return;
  }

  const record = `${previousCommitHashID} ${rootHashID} ${new Date()} ${msg}\n`;

  fileTool.writeFile(logsPath, record, 'a');
  fileTool.writeFile(headPath, rootHashID); // 覆盖.jit/HEAD
  fileTool.writeFile(storagePath, ''); // 覆盖.jit/index
}

module.exports = (options) => {
  if (!options?.msg) {
    console.error('[commit]: Error: no message text!');
    return;
  }
  const jitPath = fileTool.getJitPath();
  if (!jitPath) {
    console.log('[commit] Error: the dir .jit not found. please run `jit init` first !');
    return;
  }
  const hash2path = getHash2PathMap(jitPath);
  if (!Object.keys(hash2path).length) {
    console.log('[commit] Warn: nothing to commit!');
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