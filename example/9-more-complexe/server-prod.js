const path = require('path')
const EReactServer = require('../lib')

var server = new EReactServer({
  environment: 'production'
});

server.addRoute('routes/');

server.addReactRoute(
  '',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

server.addReactRoute(
  '/test',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {entry: path.resolve(process.cwd(), '../src/utils/client-render')},
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

server.start();