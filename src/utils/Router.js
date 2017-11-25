import BrowserProtocol from 'farce/lib/BrowserProtocol'
import queryMiddleware from 'farce/lib/queryMiddleware'
import createBasenameMiddleware from 'farce/lib/createBasenameMiddleware'
import createInitialFarceRouter from 'found/lib/createInitialFarceRouter'
import createRender from 'found/lib/createRender'
import { Resolver } from 'found-relay'
import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { ClientFetcher } from './fetcher'

const basenameMiddleware = createBasenameMiddleware({ basename: process.env.ROUTE_PREFIX });

export const historyMiddlewares = [queryMiddleware, basenameMiddleware]

export function createResolver(fetcher) {
  const environment = new Environment({
    network: Network.create((...args) => fetcher.fetch(...args)),
    store: new Store(new RecordSource()),
  })

  return new Resolver(environment)
}

export const render = createRender({})

export function createClientResolver() {
  const fetcher = new ClientFetcher(process.env.GRAPHQL_ENDPOINT, window.__RELAY_PAYLOADS__)
  return createResolver(fetcher)
}

export async function createClientRouter(resolver) {
  const historyProtocol = new BrowserProtocol()
  const Router = await createInitialFarceRouter({
    historyProtocol,
    historyMiddlewares,
    routeConfig: require(process.env.REACT_APP_PATH).default,
    resolver,
    render,
  })

  return Router
}
