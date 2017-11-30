import ReactDOM from 'react-dom/server'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import { getFarceResult } from 'found/lib/server'
import RedirectException from 'found/lib/RedirectException'
import serialize from 'serialize-javascript'
import { Helmet } from 'react-helmet'

import { ServerFetcher } from './fetcher'
import { createResolver, historyMiddlewares, render } from './Router'


const renderHtml = ({ title, meta, relayPayload, app, js }) =>{
  return `
    <!doctype html>
    <html>

      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${title}
        ${meta}
        <script>window.__RELAY_PAYLOADS__ = ${relayPayload};</script>
      </head>

      <body>
        <div id="root">${app}</div>
        ${js}
      </body>

    </html>`
}


async function renderAsync(req) {

  const fetcher = new ServerFetcher(process.env.GRAPHQL_ENDPOINT, { cookie: req.headers.cookie })
  
  const { redirect, status, element } = await getFarceResult({
    url: req.url,
    historyMiddlewares,
    routeConfig: require(process.env.REACT_APP_PATH).default,
    resolver: createResolver(fetcher),
    render,
  })

  const app = ReactDOM.renderToString(element)
  const relayPayload = serialize(fetcher, { isJSON: true })
  const helmet = Helmet.renderStatic()

  return {
    app,
    helmet,
    relayPayload,
    redirect,
    status,
  }
}

export default ({ clientStats }) => async (ctx, next) => {
  let title = ''
  let meta = ''
  let relayPayload = null
  let app = ''

  try {
    //check if prefix is here
    if (process.env.ROUTE_PREFIX.length > 0 && !ctx.url.startsWith(process.env.ROUTE_PREFIX)){
      return next()
    }

    const renderResult = await renderAsync(ctx)

    if (renderResult.status !== 200) return next()

    const helmet = renderResult.helmet
    title = helmet && helmet.title && helmet.title.toString()
    meta = helmet && helmet.meta && helmet.meta.toString()
    relayPayload = renderResult.relayPayload
    app = renderResult.app
  } catch (err) {
    return next()
  }

  const chunkNames = flushChunkNames()

  const {
    js,
    scripts,
  } = flushChunks(clientStats, { chunkNames })

  ctx.status = 200
  ctx.body = renderHtml({ title, meta, relayPayload, app, js })

  next()
}
