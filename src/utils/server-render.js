import ReactDOM from 'react-dom/server'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import { getFarceResult } from 'found/lib/server'
import RedirectException from 'found/lib/RedirectException'
import serialize from 'serialize-javascript'
import { ServerStyleSheet } from 'styled-components'
import { Helmet } from 'react-helmet'
import dotenv from 'dotenv'

import { ServerFetcher } from './fetcher'
import { createResolver, historyMiddlewares, render } from './Router'
import Routes, { paths } from '../../../../app/Routes'

dotenv.config()

const renderHtml = ({ title, meta, styleTags, relayPayload, app, js }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${title}
    ${meta}
    ${styleTags}
    <script>window.__RELAY_PAYLOADS__ = ${relayPayload};</script>

    <!-- <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'> --!>
  </head>
  <body>
    <div id="root">${app}</div>
    ${js}
  </body>
</html>`


async function renderAsync(req) {
  const fetcher = new ServerFetcher(process.env.GRAPHQL_ENDPOINT, { cookie: req.headers.cookie })
  const { redirect, status, element } = await getFarceResult({
    url: req.url,
    historyMiddlewares,
    routeConfig: Routes,
    resolver: createResolver(fetcher),
    render,
  })

  const locale = req.cookies && req.cookies.locale
  // const elementwithIntl = withIntl(, locale)x
  const sheet = new ServerStyleSheet()
  const app = ReactDOM.renderToString(sheet.collectStyles(element))
  const relayPayload = serialize(fetcher, { isJSON: true })
  const styleTags = sheet.getStyleTags()
  const helmet = Helmet.renderStatic()

  return {
    app,
    helmet,
    relayPayload,
    styleTags,
    redirect,
    status,
  }
}

export default ({ clientStats }) => async (ctx, next) => {
  let title = ''
  let meta = ''
  let styleTags = ''
  let relayPayload = null
  let app = ''

  try {
    const renderResult = await renderAsync(ctx)

    if (renderResult.status !== 200) return next()

    const helmet = renderResult.helmet
    title = helmet && helmet.title && helmet.title.toString()
    meta = helmet && helmet.meta && helmet.meta.toString()
    styleTags = renderResult.styleTags
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
  ctx.body = renderHtml({ title, meta, styleTags, relayPayload, app, js })

  next()
}
