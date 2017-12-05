import koa from  'koa'
import fs from 'fs'
import compress from  'koa-compress'
import conditional from  'koa-conditional-get'
import cors from  'kcors'
import etags from  'koa-etag'
import helmet from  'koa-helmet'
import json from  'koa-json'
import koaConvert from 'koa-convert'
import send from 'koa-send'
import logger from  'koa-logger'
import path from 'path'
import webpack from 'webpack' 
import Ddos from 'ddos'

import Router from './Router'
import Webpack from './Webpack' 
import ReactRoute from './ReactRoute'

//
//Handle main Koa2 and webpack for app.
//
export default class Server {
  constructor(props, parent) {
    this.parent = parent;
    this.logger = parent.logger
    this.app = new koa();
    this.router = new Router({}, this);

    this.isRunning = false;
    this.SSRRoutes = []
    this.isDevMode = (this.parent.config.environment == 'development')? true:false

  }

  addReactRoute(prefix, app, wpClientCfg, wpServerCfg, options, middleware){
    if (app.length == 0){
      this.parent.logger.warn('[Route] addReactRoute() - path to <App/> is missing')
      return
    }
    
    if (!fs.lstatSync(app).isFile()){
      this.parent.logger.warn('[Route] addReactRoute() - path to <App/> does not exist')
      return
    }

    let route = new ReactRoute(prefix, app, wpClientCfg, wpServerCfg, options, middleware)

    this.SSRRoutes.push(route)
    return this.SSRRoutes[this.SSRRoutes.length-1]
  }

  async renderReactApps(){
    if (this.isDevMode) {
      const webpackDevMiddleware = require('webpack-dev-middleware')
      const webpackHotMiddleware = require('koa-webpack-hot-middleware')
      const webpackHotServerMiddleware = require('webpack-hot-server-middleware')

      await this.SSRRoutes.map( async routeObject => {
        const compiledConfigs = await routeObject.webpack.compile()
        await this.app.use(this.koaDevware(webpackDevMiddleware(compiledConfigs,{
          serverSideRender: true,
          publicPath: compiledConfigs.compilers[0].options.output.publicPath, 
          stats: { 
            colors: true,
            modules: false,
          } 
        })))
        await this.app.use(koaConvert(webpackHotMiddleware(compiledConfigs.compilers[0])))
        await this.app.use(webpackHotServerMiddleware(
          compiledConfigs, {
          createHandler: webpackHotServerMiddleware.createKoaHandler
        }))
      })

    } else {
      this.parent.logger.info('[Compile] Getting files ready, this may take a while....')
      let routes = await this.SSRRoutes.map( routeObject => 
        new Promise((resolve, reject) => {
          const {clientConfig,serverConfig} = routeObject.webpack

          routeObject.webpack.compileWithCallback((err, stats) => {

            //host static files and files only
            stats.toJson().children[0].assets.map( asset => {
              const publicPath = path.posix.join(clientConfig.output.publicPath, asset.name)
              this.app.use( async (ctx, next) => {
                if (ctx.path == publicPath){
                  await send(ctx, asset.name, { root: clientConfig.output.path })
                }else{
                  return next()
                }
              })
            })

            //render html if route matches..
            let clientStats = stats.toJson().children[0]
            let serverStats = stats.toJson().children[1]

            let serverFile
            serverStats.assets.map(file =>{
              if (path.extname(file.name) == '.js'){
                serverFile = file.name
              }
            })

            let serverRender = require(path.resolve(serverConfig.output.path, serverFile)).default
            this.app.use(serverRender({ clientStats }))
            resolve()
          })
        })
      )
      Promise.all(routes)
    }
  }

  /**
   * Start server 
   * @return {[type]} [description]
   */
  async start(){
    try{
      if (this.isDevMode)
        this.parent.logger.info('[Start] Running in development mode!')
      else
        this.parent.logger.info('[Start] Running in production mode!')

      if (this.parent.config.environment == 'development' && this.parent.config.options && this.parent.config.options.logRequests) 
        this.app.use(logger())
      
      await this.addKoaMiddleware()

      if (this.SSRRoutes.length > 0) await this.renderReactApps()
      
      this.startListen()

    }catch(e){
      this.parent.logger.error('Server start(): '+ e)
    }
  }

  /**
   * Start listening
   */
  startListen(){
    this.parent.logger.info('Starting server on http://%s:%s <===', this.parent.config.hostname, this.parent.config.port )

    //add routes
    this.app.use(this.router.api.routes())
    this.app.use(this.router.api.allowedMethods())

    //Only start once
    if (!this.isRunning){
      this.isRunning = !this.isRunning
      this.app.listen(
        this.parent.config.port,
        () => {
          this.parent.logger.info()
          this.parent.logger.info(
            '==> Server is up at http://%s:%s <===', 
            this.parent.config.hostname, 
            this.parent.config.port)
          this.parent.logger.info()
        }
      )
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
  
  async addKoaMiddleware(){
    // if (this.parent.config.options && this.parent.config.options.useDdos){
    //   let ddos = new Ddos(this.parent.config.options.ddosOptions)
    //   this.app.use(ddos.koa().bind(ddos))
    // }

    if (this.parent.config.options && this.parent.config.options.useHelmet)
      this.app.use(helmet(this.parent.config.options.helmetOptions))

    if (this.parent.config.options && this.parent.config.options.useJsonPretty)
      this.app.use(json())
    
    if (this.parent.config.options && this.parent.config.options.useCompress)
      this.app.use(compress(this.parent.config.options.compressOptions))

    if (this.parent.config.options && this.parent.config.options.useCors)
      this.app.use(cors(this.parent.config.options.corsOptions))

    if (this.parent.config.options && this.parent.config.options.useEtags){
      this.app.use(conditional())
      this.app.use(etags())
    }
  }
}
