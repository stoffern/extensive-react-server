import path from 'path'
import UniversalApp from '../src'
import Source from './app/Routes.js'
import clientConfig from './webpack/client.dev.js'
import serverConfig from './webpack/server.dev.js'

var app = new UniversalApp({
  environment: 'development',
  hostname: 'localhost',
  port: 3000,

  server:{
    useJsonPretty: true, // Disables pretty-printing
    useEtags: false, // ETag support for Koa responses using etag. (https://github.com/jshttp/etag)

    useHelmet: true,
    helmetOptions:{
      noCache: true,  // Sets the `Cache-Control` headers to prevent caching
      frameguard: {
        action: 'deny' // Set the `X-Frame-Options' header to be `DENY`
      }
    },
    useCompress: true,
    compressOptions:{
      threshold: 2048 // Sets the threshold to Gzip responses at 2k (2048 bytes)
    },

    useCors: true,
    corsOptions:{
      origin: '*' // Set the `Access-Control-Allow-Origin` header to be `*`
    },
  }
});


app.addRoute('routes/');

app.addRouteSSR('', path.resolve(process.cwd(), 'app/Routes.js'));

app.start();