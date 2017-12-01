const path = require('path')
const webpack = require('webpack')
const EReactServer = require('../../src')

var server = new EReactServer(); // create a new instance

const route = server.addReactRoute(
  '', //Route prefix
  path.resolve(process.cwd(), 'app/Routes.js') // path to app file
);

//adds a variable webpack.Define()
route.webpack.addVariable({MYVAR: 'variable'})

// adds multiple variables
route.webpack.addVariables([{MYVAR2: 'variable'}, {MYVAR3: 'another'}])

//read more about strategy and how here: https://github.com/survivejs/webpack-merge#mergestrategy-field-prependappendreplaceconfiguration-configuration
route.webpack.updateConfigWithStrategy({'plugins':'append'}, {plugins: [new webpack.DefinePlugin({SOME_VARIABLE: 'test'})]})

//see docs for more functions & snacks

server.start(); //start server