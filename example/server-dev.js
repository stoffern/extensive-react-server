const path = require('path')
const EReactServer = require('../lib')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

var server = new EReactServer();

server.addRoute('routes/'); //just to get a graphql server example file..

const mainRoute = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js'), //Path to react app, must return a found router..
  {entry: path.resolve(process.cwd(), '../lib/utils/client-render')},// webpack client config override
  {entry: path.resolve(process.cwd(), '../lib/utils/server-render')},// webpack server config override
);

server.start();