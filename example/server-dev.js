import path from 'path'
import ExtensiveSrv from '../src'

var srv = new ExtensiveSrv();

srv.addRoute('routes/');

srv.addRouteSSR(
  '',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {
    entry: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
      'react-hot-loader/patch',
      path.resolve(process.cwd(), '../src/utils/client-render'),
    ]
  },
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);
srv.addRouteSSR(
  '/test',
  path.resolve(process.cwd(), 'app/Routes.js'),
  {
    entry: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
      'react-hot-loader/patch',
      path.resolve(process.cwd(), '../src/utils/client-render'),
    ]
  },
  {entry: path.resolve(process.cwd(), '../src/utils/server-render')},
);

srv.start();