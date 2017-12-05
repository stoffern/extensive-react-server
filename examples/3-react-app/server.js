const path = require('path')
const EReactServer = require('../../lib')

var server = new EReactServer(); // create a new instance

const mainRoute = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js') // path to app file
);

server.start(); //start server