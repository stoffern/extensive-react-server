const path = require('path')
const EReactServer = require('../../src')

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


//
// Adding a custom HTML
//
mainRoute.webpack.setHTML( ({ element, clientStats, relayPayload }) => {
  const ReactDOM = require('react-dom/server')
  const Helmet = require('react-helmet').default
  const flushChunks = require('webpack-flush-chunks').flushChunks
  const flushChunkNames = require('react-universal-component/server').flushChunkNames
  const app = ReactDOM.renderToString(element)

  const { js, styles, cssHash } = flushChunks(clientStats, {
    chunkNames: flushChunkNames()
  })

  const helmet = Helmet.renderStatic()
  let title = helmet && helmet.title && helmet.title.toString()
  let meta = helmet && helmet.meta && helmet.meta.toString()

  return `
    <!doctype html>
    <html>

      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${title}
        ${meta}
        ${styles}
        <script>window.__RELAY_PAYLOADS__ = ${relayPayload};</script>
      </head>

      <body>
        <div>Custom HTML</div>
        <div id="root">${app}</div>
        ${cssHash}
        ${js}
      </body>

    </html>`
})

server.start(); //start server