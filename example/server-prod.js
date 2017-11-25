import path from 'path'
import ExtensiveSrv from '../src'

var srv = new ExtensiveSrv({
  environment: 'production'
});

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