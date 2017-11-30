const path = require('path')
const EReactServer = require('../../lib')

var server = new EReactServer({
  environment: process.env.NODE_ENV || 'development',
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000
}); // create a new instance

server.addRoute('route.js'); //just add a file or a folder
server.start(); //start server