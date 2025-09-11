const path = require('path');
const cwd = path.resolve(__dirname);
const nodeModules = path.resolve(cwd, 'node_modules');

module.exports = {
  apps : [{
    name: 'todo-app-next',
    cwd: cwd,
    script: 'next start --port 8080',
    env: {
      PATH: `${nodeModules}/.bin:${process.env.PATH}`,
    }
  }]
};
