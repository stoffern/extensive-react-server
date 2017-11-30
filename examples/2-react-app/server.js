const path = require('path')
const EReactServer = require('../../lib')

var server = new EReactServer({
  environment: process.env.NODE_ENV || 'development',
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000
}); // create a new instance

const mainRoute = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js'), //Path to react app, must return a found router..
  {entry: path.resolve(process.cwd(), '../../lib/utils/client-render')}, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
  {entry: path.resolve(process.cwd(), '../../lib/utils/server-render')}, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
);

server.start(); //start server