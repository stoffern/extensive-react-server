const EReactServer = require('../../src')
var server = new EReactServer();
server.addRoute('routes'); //add routes folder
server.start();