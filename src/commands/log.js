const fileTool = require('../utils/file');
const path = require('path');

const endHashID = '0'.repeat(40);

// 构建带映射表的链表, hashID -> commit
function getHash2Record(jitPath) {
  const logsPath = path.resolve(jitPath, './.jit/logs/HEAD');
  const records = fileTool.readFile(logsPath).split('\n');
  
  const hash2record = {};
  records.forEach((record) => {
    const preHashID = record.slice(0, 40);
    const hashID = record.slice(41, 81);
    hash2record[hashID] = {
      preHashID,
      data: record,
    }; 
  });

  return hash2record;
}

function formatLog(recordData) {
  const hashID = recordData.slice(41, 81);
  const time = recordData.slice(82, 127);
  const msg = recordData.slice(128);
  console.log(`HASH: ${hashID}\nTIME: ${time}\n MSG: ${msg}`);
}

module.exports = () => {
  const jitPath = fileTool.getJitPath();

  if (!jitPath) {
    console.log('[log] Error: the dir .jit not found. please run `jit init` first !');
    return;
  }

  const headPath = path.resolve(jitPath, './.jit/HEAD');
  const hash2record = getHash2Record(jitPath);
  
  let currentHashID = fileTool.readFile(headPath); 
  console.log('===== Commit Logs ====='); 
  while (true) {
    const record = hash2record[currentHashID];
    if (!record.data) {
      break;
    }
    formatLog(record.data);
    currentHashID = record.preHashID;
    if (currentHashID === endHashID) {
      break;
    } 
  }
  console.log('===== =========== =====');
}