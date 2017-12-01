const path = require('path')
const EReactServer = require('../../src')

var server = new EReactServer();
const route = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js'), //Path to react app, must return a found router..
);

server.start();