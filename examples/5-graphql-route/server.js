const path = require('path')
const EReactServer = require('../../src')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const env = process.env.NODE_ENV || 'development'

var server = new EReactServer({
  environment: process.env.NODE_ENV || 'development',
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000
});

server.addRoute('routes'); //add routes folder
server.start();