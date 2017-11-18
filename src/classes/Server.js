import Koa from  'koa'
import compress from  'koa-compress'
import conditional from  'koa-conditional-get'
import cors from  'kcors'
import etags from  'koa-etag'
import helmet from  'koa-helmet'
import json from  'koa-json'
import koaConvert from 'koa-convert'
import koaStatic from  'koa-static-server'
import KoaRouter from 'koa-better-router'
import KoaServe from 'koa-better-serve'
import logger from  'koa-logger'
import path from 'path'
import webpack from 'webpack'
import Router from './Router'
import Webpack from './Webpack'

//
//Handle main Koa2 and webpack for app.
//
export default class Server {
  constructor(props, parent) {
    this.parent = parent;
    this.app = new Koa();
    this.router = new KoaRouter();
    this.router.loadMethods();

    this.isRunning = false;
    this.routesPath = path.resolve(process.cwd(), 'routes')

    this.webpackClientCfg = require(path.resolve(process.cwd(),'webpack/client.dev'))
    this.webpackServerCfg = require(path.resolve(process.cwd(),'webpack/server.dev'))

    this.SSRRoutes = []
  }

  async addRoutes(routeArray){
    if (!routeArray.isArray()){
      this.parent.logger.warn('[Server] addRoutes() - the function .addRoutes() should contain a array!')
      return
    }
    routeArray.map(route => this.addRoute(route))
  }

  async addRoute(route){
    if (!route || route.length == 0){
      this.parent.logger.warn('[Server] addRoute() - called without a valid file/string.')
      return
    } 
    route = path.resolve(process.cwd(), route)
    try{
      let isFile = fs.lstatSync(route).isFile()
      let isDirectory = fs.lstatSync(route).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('[Server] addRoute() - path:'+ route +' - does not exist')
        return
      }else{
        if (isFile){
          this.addRouteFile(route)
        }else{
          let files = await fs.readdirSync(route)
          files.forEach(file => this.addRouteFile(path.resolve(route, file)) );
        }
      }
    }catch(e){
      this.parent.logger.warn('[Server] addRoutesFolderOrFile() - '+ e)
    }
  }

  addRouteFile(file){
    let route = require(file)
    route(this.router, this.app, this.parent.config)
    this.parent.logger.info('[Server] added: '+ file)
  }
  addRouteSSR(prefix, app, options, middleware){
    let webpack = new Webpack();

  }
  composeSSR(){
    if (this.parent.config.environment == 'development') {
      this.app.use(logger())
      this.parent.logger.info('Running in development mode..')

      const webpackDevMiddleware = require('webpack-dev-middleware')
      const webpackHotMiddleware = require('koa-webpack-hot-middleware')
      const webpackHotServerMiddleware = require('webpack-hot-server-middleware')
      this.parent.logger.info('Webpack files loaded!')

      const publicPath = this.webpackClientCfg.output.publicPath
      const compiler = webpack([this.webpackClientCfg, this.webpackServerCfg])
      const clientCompiler = compiler.compilers[0]

      this.app.use(this.koaDevware(webpackDevMiddleware(compiler, { 
        publicPath, 
        stats: { 
          colors: true,
          modules: false,
        } 
      })))
      this.app.use(koaConvert(webpackHotMiddleware(clientCompiler)))
      this.app.use(webpackHotServerMiddleware(compiler, {
        createHandler: webpackHotServerMiddleware.createKoaHandler,
      }))

      compiler.plugin('done', this.startListen() )

    } else {
      
      this.parent.logger.info('Running in production mode..')
      const publicPath = this.webpackClientCfg.output.publicPath
      const outputPath = this.webpackClientCfg.output.path

      webpack([this.webpackClientCfg, this.webpackServerCfg]).run((err, stats) => {
        const clientStats = stats.toJson().children[0]
        const serverRender = require('../../../../build/ssr/main.js').default

        this.app.use(koaStatic({rootDir: outputPath, rootPath: publicPath}))
        this.app.use(serverRender({ clientStats }))

        this.startListen()()
      })
    }
  }

  async start(){
    try{

      if (this.parent.config.environment == 'development') this.app.use(logger())

      this.addKoaMiddleware()
      this.composeSSR()

    }catch(e){
      this.parent.logger.error('Server start(): '+ e)
    }
  }
  
  addKoaMiddleware(){
    if (this.parent.config.server && this.parent.config.server.useHelmet)
      this.app.use(helmet(this.parent.config.server.helmetOptions))

    if (this.parent.config.server && this.parent.config.server.useJsonPretty)
      this.app.use(json())
    
    if (this.parent.config.server && this.parent.config.server.useCompress)
      this.app.use(compress(this.parent.config.server.compressOptions))

    if (this.parent.config.server && this.parent.config.server.useCors)
      this.app.use(cors(this.parent.config.server.corsOptions))

    if (this.parent.config.server && this.parent.config.server.useEtags){
      this.app.use(conditional())
      this.app.use(etags())
    }
  }

  /**
   * Start Koa
   */
  startListen(){
    //this is that :)
    var that = this
    //add routes
    that.app.use(that.router.middleware())

    that.parent.logger.info('Starting server on http://%s:%s <===', that.parent.config.hostname, that.parent.config.port )
    
    return () => {
      //Only start once
      if (!that.isRunning){
        that.isRunning = !that.isRunning
        that.app.listen(
          that.parent.config.port,
          () => {
            that.parent.logger.info()
            that.parent.logger.info(
              '==> Server is up at http://%s:%s <===', 
              that.parent.config.hostname, 
              that.parent.config.port)
            that.parent.logger.info()
          }
        )
      }
    }
  }

  /**
   * Handle Koa Development middleware after compile is complete
   * @param  {webpackmiddleware} dev
   * @param  {webpackcompiler} compiler
   * @return {function} Function to be called
   */
  koaDevware(dev, compiler) {
    const waitMiddleware = () =>
      new Promise((resolve, reject) => {
        dev.waitUntilValid(() => resolve(true));
        compiler.plugin('failed', error => reject(error));
      });

    return async (ctx, next) => {
      await waitMiddleware();
      await dev(
        ctx.req,
        {
          end(content) {
            ctx.body = content;
          },
          setHeader: ctx.set.bind(ctx),
          locals: ctx.state,
        },
        next
      );
    };
  }
}
