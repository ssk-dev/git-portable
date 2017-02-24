// https://www.npmjs.com/package/shelljs
const userProfilePath = process.env.USERPROFILE;
const environment = require('./config');
const rootDir = normalizePath(userProfilePath + environment.config.git.root_path);
const app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var shell = require('shelljs');
const chokidar = require('chokidar');

// https://www.npmjs.com/package/git-bash-shell
require('git-bash-shell');
exports.bash = require('cross-spawn').sync;
// spawnSync(`cd ${rootDir}/test-repo && echo $(gitk) && git status && npm i`, {
//   shell: '/bin/sh',
//   stdio: 'inherit',
// });

function normalizePath(path) {
  replaceChar = /[[\]\\]/gi
  return path.replace(replaceChar, '/');
}

async function getFolderNameFromRepository(repository) {
  return new Promise(resolve => {
    data = repository.split('/').slice(-1).pop().split('.')[0];
    resolve(data)
  })
}

const git = {
  version: () => shell.exec('git --version', {silent: true}).stdout,
  init: (repository) => {
    return new Promise(resolve => shell.exec(`git -C ${rootDir}/${repository} git init`, (data) => {
      resolve(data)
    }))
  },
  clone: (repository) => {
    return new Promise(resolve => shell.exec(`git -C ${rootDir} clone ${repository}`, (data) => {
      // return 0 on success,
      // return 128 if repo exist localy,
      resolve(data)
    }))
  },
  delete: {
    local: (repository, branch) => {
      return new Promise(resolve => shell.exec(`git -C ${rootDir}/${repository} branch -D ${branch}`, (data) => {
        resolve(data)
      }))
    },
    remote: (repository, branch) => {
      return new Promise((resolve) => shell.exec(`git -C ${rootDir}/${repository} push origin :${branch}`, (data) => {
        resolve(data)
      }))
    }
  },
  add: () => {
    return new Promise(resolve => shell.exec('git add .'))
  },
  status: (repository) => shell.exec(`git -C ${rootDir}/${repository} status`, {silent: true}).stdout,
  checkout: {
    branch: (repository, branch) => {
      return new Promise(resolve => shell.exec(`git -C ${rootDir}/${repository} checkout ${branch}`, (data) => {
        resolve(data)
      }))
    },
    new_branch: (repository, branch) => {
      return new Promise(resolve => shell.exec(`git -C ${rootDir}/${repository} checkout -b ${branch}`, (data) => {
        resolve(data)
      }))
    }
  },
  pull: (repository) => shell.exec(`git -C ${rootDir}/${repository} pull`, {silent: true}).stdout,
  push: (repository, force) => {
    const f = force ? ' -f' : ''
    return new Promise(resolve => shell.exec(`git -C ${rootDir}/${repository} push${f}`, (data) => {
      resolve(data)
    }))
  },
  gitk: () => {
    return new Promise(resolve => shell.exec('gitk', (data) => {
      resolve(data)
    }))
  }
}

const npm = {
  version: () => shell.exec('npm --version', {silent: true}).stdout,
  install: () => {
    return new Promise(resolve => shell.exec('cd ../ && npm install', (data) => {
      resolve(data)
    }))
  }
}

const node = {
  version: () => shell.exec('node --version', {silent: true}).stdout,
}

const folder = {
  open: (repository) => {
    return new Promise(resolve => shell.exec(`start ${rootDir}/${repository}`, (data) => {
      resolve(data)
    }))
  },
  watch: (repository) => {
    return chokidar.watch(`${rootDir}/${repository}`, {
      recursive: true,
      ignoreInitial: true,
      ignored: '/node_modules/'
    }).on('all', (event, path) => {
      console.log('event', event, path);
      // git.status(repository);
      io.emit('message', event, path)
    });
  }
}

exports.ssh = {
  get: () => shell.exec('cat ~/.ssh/id_rsa.pub', {silent: true}).stdout
}

async function cloneAndInstall(repository) {
  // 'git@github.com:jasi-dev/test-repo.git'
  await git.clone(rootDir, 'git@github.com:jasi-dev/test-repo.git');
}

async function load() {
  await getFolderNameFromRepository('git@github.com:jasi-dev/123/test-repo.git').then(folder => shell.echo(folder))
  //shell.echo(getFolderNameFromRepository('git@github.com:jasi-dev/123/test-repo.git'))
  // shell.exec('cd ' + rootDir)
  // await git.init(normalizePath(rootDir))
  // await git.status(normalizePath(rootDir))
  // await git.clone(rootDir, 'git@github.com:jasi-dev/test-repo.git')
  // await npm.install();
  // await git.gitk().then((data)=> git.status());

}

// load()
exports.cmd = shell;
exports.git = git;
exports.node = node;
exports.npm = npm;
exports.folder = folder;
exports.root = rootDir;
exports.load = load;
