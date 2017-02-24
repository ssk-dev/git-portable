"use strict";
exports.__esModule = true;
const general_port = 9999;
exports.config = {
  production: false,
  git: {
    client_id: 'ba321acf62030da66eeb',
    client_secret: 'ad1fac6771186dcd020d9a14d8819b743d83ef8d',
    host: 'github.com', // Url of GitHub
    root_path: '/git-repositories'
  },
  oauth: {
    port: 443,
    path: '/login/oauth/access_token',
    method: 'POST'
  },
  express: {
    port: general_port,
    host: 'localhost',
    url: "http://localhost:" + general_port,
    redirect_uri: 'http://localhost:4200/auth'
  }
};

exports.endpoint = {
  authenticate: '/authenticate/:code',
  git: {
    clone: '/git/clone',
    checkout: '/git/checkout',
    push: '/git/push',
    pull: '/git/pull',
    active_branch: '/git/active_branch',
    remove: '/git/remove',
    rebase: '/git/rebase',
    status: '/git/status',
    add: '/git/add'
  },
  terminal: '/terminal/open'
}
