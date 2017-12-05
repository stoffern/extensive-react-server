const path = require('path')
const EReactServer = require('../../src')

var server = new EReactServer(); // create a new instance

server.addRoute('routes'); //add routes folder containing graphql

const route = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js'), //Path to react app, must return a found router..

  // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
  {entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    'react-hot-loader/patch',
    path.resolve(process.cwd(), '../../src/utils/client-render')
  ]},
  {entry: path.resolve(process.cwd(), '../../src/utils/server-render')},
  // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
);

route.webpack.setGraphqlEnpoint('http://localhost:3000/graphql')

server.start(); //start server