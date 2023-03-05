const fileTool = require('../utils/file');
const path = require('path');
const { error, warn, emphasize } = require('../utils/notice');
const { green } = require('chalk');


const endHashID = '0'.repeat(40);

// build a list with the map, hashID -> commit
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
  console.log(`HASH: ${green(hashID)}\nTIME: ${time}\n MSG: ${msg}`);
}

module.exports = () => {
  const jitPath = fileTool.getJitPath();

  if (!jitPath) {
    const msg = error('log', `the dir .jit not found. please run ${emphasize('jit init')} first !`);
    console.error(msg);
    return;
  }

  const headPath = path.resolve(jitPath, './.jit/HEAD');
  const hash2record = getHash2Record(jitPath);

  let currentHashID = fileTool.readFile(headPath);
  console.log('===== Commit Logs =====\n');
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
  console.log('\n===== =========== =====');
};