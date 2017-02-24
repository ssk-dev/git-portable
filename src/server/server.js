require('dotenv').config();

const environment = require('./config');
const https = require('https');
const qs = require('querystring');
const bodyParser = require("body-parser");
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = environment.config.express.port;
app.locals.title = 'Auth Gatekeeper';

let fsl = require('./file-storage-handler');
let shell = require('./shell');
var watch = require('node-watch');
var watcher;
var activeRepository;

// start websocket first
http.listen(10000, function () {
  console.log('Websocket running on *:10000');
});

function authenticate(code, cb) {
  const data = qs.stringify({
    client_id: environment.config.git.client_id,
    client_secret: environment.config.git.client_secret,
    code: code
  });
  const reqOptions = {
    host: environment.config.git.host,
    port: environment.config.oauth.port,
    path: environment.config.oauth.path,
    method: environment.config.oauth.method,
    headers: {'content-length': data.length}
  };
  let body = '';
  const req = https.request(reqOptions, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      cb(null, qs.parse(body).access_token);
    });
  });
  req.write(data);
  req.end();
  req.on('error', function (e) {
    cb(e.message);
  });
}

function log(label, value, sanitized) {
  const replace = '***';
  value = value || '';
  if (sanitized) {
    if (typeof (value) === 'string' && value.length > 10) {
      shell.cmd.echo(label, value.substring(3, 0) + replace);
    } else {
      shell.cmd.echo(label, replace);
    }
  } else {
    shell.cmd.echo(label, value);
  }
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.all('*', async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, HEAD, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  // res.setHeader('Content-Type', 'application/json');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// auth calls
// keeps github oauth
app.get(environment.endpoint.authenticate, (req, res) => {
  log('authenticating code:', req.params.code, true);
  authenticate(req.params.code, function (err, token) {
    let result;
    if (err || !token) {
      result = {'error': err || 'invalid_code'};
      log('something went wrong:', result.error, false);
    } else {
      result = {'token': token};
      log('token:', result.token, true);
    }
    res.json(result);
  });
});

// file system calls
app.post('/create/root', async (req, res, next) => {
  await fsl.directory.exists().then((data) => {
    if (!data) {
      shell.cmd.echo('root doesnt exist');
      fsl.directory.mkdir().then(data2 => shell.cmd.echo('data2 ', data2))
      res.status(200).send({code: true});
    } else {
      shell.cmd.echo('cannot create root folder -> already exist');
      res.status(409).send({code: data, message: 'folder already exist'});
    }
  });
  fsl.directory.mkdir().catch(data => shell.cmd.echo('catch: ' + data)).then(data3 => shell.cmd.echo('data3 ', data3))
  next();
});

app.post('/dir/read', async (req, res, next) => {
  const path = req.body.path;
  await fsl.directory.exists(path).then((data) => {
    if (data) {
      fsl.directory.readDir(path).then(entry => {
        shell.cmd.echo('Directory: ', entry),
          res.send(entry)
      })
    } else {
      res.send([])
    }
  });
  next();
});

// git calls
// file system calls
app.post(environment.endpoint.git.clone, async (req, res, next) => {
  const repository = req.body.repository
  await fsl.directory.exists(repository).then(async (data) => {
    if (!data) {
      await shell.git.clone(repository).then((data) => {
        if (data === 0) {
          shell.cmd.echo('repository cloned:', repository)
          res.status(200).send({code: data});
        } else {
          shell.cmd.echo('couldnt clone:', repository)
          res.status(409).send({code: data});
        }
      });
    } else {
      res.status(200).send({error: 'local repository folder doesnt exist for: ' + repository});
    }
    next();
  });
});

async function checkout(repository, branch, create, force) {
  if (create) {
    await shell.cmd.echo(`git checkout new branch: ${repository} -> ${branch}`);
    await shell.git.checkout.new_branch(repository, branch).catch(err => console.log('err', err));
    await shell.git.push(repository, force).catch(err => console.log('err', err));
    // await shell.folder.open(repository).catch(err => console.log('err', err));
  } else {
    await shell.cmd.echo(`git checkout branch: ${repository} -> ${branch}`);
    await shell.git.checkout.branch(repository, branch).catch(err => console.log('err', err));
    // await shell.folder.open(repository).catch(err => console.log('err', err));
  }

  if (watcher) {
    watcher.close()
  }
  watcher = await shell.folder.watch(repository);
}

// checkout branch {branch: 'branch-name',new: boolen}
app.post(environment.endpoint.git.checkout, async (req, res, next) => {
  const repository = req.body.repository;
  const branch = req.body.branch;
  const create = req.body.create;
  const force = req.body.force;

  if (await fsl.directory.exists(repository)) {
    checkout(repository, branch, create, force).catch(err => console.log(err)).then(res.status(200)
      .send({
        log: `checkout branch -> ${branch}`
      }));
  } else {
    await shell.cmd.echo(`git clone repository: ${repository} -> ${branch}`);
    await shell.git.clone(`git@github.com:ssk-dev/${repository}.git`)
    checkout(repository, branch, create, force).catch(err => console.log(err)).then(res.status(200)
      .send({
        log: `checkout branch -> ${branch}`
      }));
  }
  next();
});

app.post(environment.endpoint.git.pull,  (request, resolve, next) => {
  const repository = request.body.repository;
  io.emit('message', {status: shell.git.pull(repository)})
  resolve.send({})
  next();
});

app.post(environment.endpoint.git.remove, async (req, res, next) => {
  shell.cmd.echo('req.body', req.body);
  const repository = req.body.repository;
  const branch = req.body.branch;
  const source = req.body.source;

  if (source === 'origin') {
    await shell.git.delete.remote(repository, branch).then(async (data) => {
      if (data === 0) {
        res.status(200).send({code: data});
      } else {
        res.status(409).send({code: data});
      }
    });
  } else {
    await shell.git.delete.local(repository, branch).then(async (data) => {
      if (data === 0) {
        res.status(200).send({code: data});
      } else {
        res.status(409).send({code: data});
      }
    });
  }
  next();
});

app.post(environment.endpoint.git.active_branch, async (req, res, next) => {
  const repository = req.body.repository;
  const path = req.body.path;
  await fsl.directory.readFile(repository + path)
    .then((branch) => {
      shell.cmd.echo(`${repository}${path} -> ${branch}`);
      res.status(200).send({active: branch.replace(/(\r\n|\n|\r)/gm, "")});
    }).catch(() => {
      shell.cmd.echo(`${repository}${path} doesent exist`);
      res.status(200).send({active: null});
    });
  next();
});

app.post(environment.endpoint.git.status, async (request, resolve, next) => {
  const repository = request.body.repository.name
  await fsl.directory.exists(repository).then(async (data) => {
    if (data) {
      io.emit('message', {status:  shell.git.status(repository)});
    }
    resolve.send({})
  })

  next();
})

app.post('/ssh', async (req, res, next) => {
  io.emit('message', {status: shell.ssh.get()});
  res.status(200).send({status: shell.ssh.get()});
  next();
});

app.post('/folder/open', async (req, res, next) => {
  shell.cmd.echo('open folder:', req.body.folder);
  await shell.folder.open(req.body.folder)
    .then((data) => res.status(200).send({code: data}))
    .catch(err => res.status(409).send({code: data}));
  next();
});

app.post(environment.endpoint.terminal, async (request, resolve, next) => {
  const repository = request.body.repository.name;
  shell.cmd.exec(`open terminal`)
  await fsl.directory.exists(repository).then(async (data) => {
    if (data) {
      shell.bash(`cd ${shell.root}/${repository} && start ${process.env.SHELL}`, {
        shell: '/bin/sh',
        stdio: 'inherit',
      });
      resolve.status(200).send({notification: `open bash terminal -> ${repository}`});
    } else {
      shell.bash(`cd ${shell.root} && start ${process.env.SHELL}`, {
        shell: '/bin/sh',
        stdio: 'inherit',
      });
      resolve.status(200).send({notification: `open bash terminal -> root`});
    }
  })
  next();
});

app.listen(port, async () => {
  await shell.cmd.echo("Server running on: http://localhost:" + port + "!");
  console.log(
    'Git Version:', shell.git.version(),
    'Node Version:', shell.node.version(),
    'NPM Version:', shell.npm.version()
  );
});

io.on('connection', function (socket) {
  console.log('Frontend is running');
});

