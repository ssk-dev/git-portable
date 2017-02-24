const fs = require('fs');
const userProfilePath = process.env.USERPROFILE;
const environment = require('./config');
const rootDir = userProfilePath + environment.config.git.root_path;

let status;
const directory = {
  mkdir: () => {
    return new Promise(resolve => resolve(fs.mkdirSync(rootDir)))
  },
  exists: (path) => {
    const route = path ? `${rootDir}/${path}` : rootDir;
    return new Promise(resolve => resolve(fs.existsSync(route)));
  },
  readDir: (path) => {
    const route = path ? `${rootDir}/${path}` : rootDir;
    return new Promise(resolve => resolve(fs.readdirSync(route)));
  },
  readFile: (path) => {
    const route = path ? `${rootDir}/${path}` : rootDir;
    return new Promise(resolve => resolve(fs.readFileSync(route, {encoding: 'UTF-8'})));
  }
}


// async function createRootStorage() {
//   await directory.mkdir().then(data => {
//     setStatus(data);
//   });
// }

function setStatus(value) {
  status = value
}

function getStatus() {
  return status
}

exports.directory = directory;
exports.getStatus = getStatus;

