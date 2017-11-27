const path = require('path')
const EReactServer = require('../src')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

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

mainRoute.webpack.addVariable({BODYMOVIN_EXPRESSION_SUPPORT: true})


mainRoute.webpack.addModule({
    test: /\.scss$/,
    exclude: /node_modules/,
    use: [{
      loader: "style-loader"
    },{
      loader: "css-loader" // translates CSS into CommonJS
    },{
      loader: "sass-loader" // compiles Sass to CSS
    }]
})
mainRoute.webpack.addPlugin(
  new StatsWriterPlugin('stats.json', {
    chunkModules: true,
    modules: true,
    chunks: true,
    exclude: [/node_modules[\\\/]react/],
  })
)
mainRoute.webpack.addPlugin(extractSass)

server.start();