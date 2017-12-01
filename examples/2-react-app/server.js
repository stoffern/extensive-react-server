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
  {entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    'react-hot-loader/patch',
    path.resolve(process.cwd(), '../../src/utils/client-render')
  ]}, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
  {entry: path.resolve(process.cwd(), '../../src/utils/server-render')}, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
);

server.start(); //start server