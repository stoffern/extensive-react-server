import ReactDOM from 'react-dom/server'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import { getFarceResult } from 'found/lib/server'
import RedirectException from 'found/lib/RedirectException'
import serialize from 'serialize-javascript'
import { Helmet } from 'react-helmet'

import { ServerFetcher } from './fetcher'
import { createResolver, historyMiddlewares, render } from './Router'


const renderHtml = ({ element, clientStats, relayPayload }) => {

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
        <div id="root">${app}</div>
        ${cssHash}
        ${js}
      </body>

    </html>`
}

export default ({ clientStats }) => async (ctx, next) => {

  try {

    if (process.env.ROUTE_PREFIX.length > 0 && !ctx.url.startsWith(process.env.ROUTE_PREFIX)){
      return next()
    }

    var fetcher = new ServerFetcher(process.env.GRAPHQL_ENDPOINT, { cookie: ctx.headers.cookie })
    var { redirect, status, element } = await getFarceResult({
      url: ctx.url,
      historyMiddlewares,
      routeConfig: require(process.env.REACT_APP_PATH).default,
      resolver: createResolver(fetcher),
      render,
    })

    var relayPayload = serialize(fetcher, { isJSON: true })

    if (status !== 200) return next()

  } catch (err) {
    return next()
  }

  ctx.status = 200
  ctx.body = renderHtml({ element, clientStats, relayPayload })

  next()
}
