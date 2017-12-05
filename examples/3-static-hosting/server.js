const path = require('path')
const EReactServer = require('../../src')

var server = new EReactServer({
  environment: process.env.NODE_ENV || 'development',
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000
}); // create a new instance

server.addStaticFile(path.resolve(process.cwd(),'hello.txt')); //just add a file or a folder
server.addStaticFile(path.resolve(process.cwd(),'hello.txt'),'/hereto.txt'); //serve same file at /hereto.txt
server.addStaticFolder(path.resolve(process.cwd(),'static'), '/public'); //serves folder on /public
server.start(); //start server