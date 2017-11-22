const path = require('path')
const ExtensiveSrv = require('../lib')

var srv = new ExtensiveSrv();

srv.addRoute('routes/');

srv.addRouteSSR(
  '',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

srv.addRouteSSR(
  '/test',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

srv.start();