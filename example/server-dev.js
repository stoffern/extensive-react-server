const path = require('path')
const ExtensiveSrv = require('../lib')

var srv = new ExtensiveSrv();

srv.addRoute('routes/');

srv.addReactRoute(
  '',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

srv.addReactRoute(
  '/test',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

srv.start();