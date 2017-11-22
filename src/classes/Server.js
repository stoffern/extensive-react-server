import Koa from  'koa'
import fs from 'fs'
import compress from  'koa-compress'
import conditional from  'koa-conditional-get'
import cors from  'kcors'
import etags from  'koa-etag'
import helmet from  'koa-helmet'
import json from  'koa-json'
import koaConvert from 'koa-convert'
import KoaRouter from 'koa-router'
import KoaServe from 'koa-better-serve'
import logger from  'koa-logger'
import path from 'path'
import Webpack from './Webpack' 
import webpack from 'webpack' 

//
//Handle main Koa2 and webpack for app.
//
export default class Server {
  constructor(props, parent) {
    this.parent = parent;
    this.app = new Koa();
    this.router = new KoaRouter();
    this.routerPre = new KoaRouter();

    this.isRunning = false;
    this.SSRRoutes = []
    this.isDevMode = (this.parent.config.environment == 'development')? true:false

  }

  async addRoutes(routeArray){
    if (!routeArray.isArray()){
      this.parent.logger.warn('[Route] addRoutes() - the function should contain a array!')
      return
    }
    routeArray.map(route => this.addRoute(route))
  }

  async addRoute(route){
    if (!route || route.length == 0){
      this.parent.logger.warn('[Route] addRoute() - called without a valid file/string.')
      return
    } 
    route = path.resolve(process.cwd(), route)
    try{
      let isFile = fs.lstatSync(route).isFile()
      let isDirectory = fs.lstatSync(route).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('[Route] addRoute() - path:'+ route +' - does not exist')
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
      this.parent.logger.warn('[Route] addRoutesFolderOrFile() - '+ e)
    }
  }

  addRouteFile(file){
    let route = require(file)
    route(this.router, this.app, this.parent.config)
    this.parent.logger.info('[Route] added: '+ file)
  }

  addRouteSSR(prefix, app, wpClientCfg, wpServerCfg, options, middleware){

    if (app.length == 0){
      this.parent.logger.warn('[Route] addRouteSSR() - path to <App/> is missing')
      return
    }
    
    if (!fs.lstatSync(app).isFile()){
      this.parent.logger.warn('[Route] addRouteSSR() - path to <App/> does not exist')
      return
    }

    let webpack = new Webpack({isDevMode: this.isDevMode}, this.parent)
    webpack.updateClientConfig(wpClientCfg)
    webpack.updateServerConfig(wpServerCfg)


    if (prefix.length > 0){
      let publicPath = path.posix.join('/', prefix, webpack.clientConfig.output.publicPath)
      webpack.updateClientConfig({output: {publicPath: publicPath} })
    }

    webpack.addVariable({
      'process.env': {
        REACT_APP_PATH: JSON.stringify(app),
        ROUTE_PREFIX: JSON.stringify(path.posix.join('/', prefix)),
      }
    })

    this.SSRRoutes.push({
      webpack: webpack,
      app: app,
      middleware: middleware,
    })
    return this.SSRRoutes[this.SSRRoutes.length-1]
  }

  async composeSSR(){

    if (this.isDevMode) {
      const webpackDevMiddleware = require('webpack-dev-middleware')
      const webpackHotMiddleware = require('koa-webpack-hot-middleware')
      const webpackHotServerMiddleware = require('webpack-hot-server-middleware')

      await this.SSRRoutes.map( async ssrRoute => {
        const compiledConfigs = await ssrRoute.webpack.compile()

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
          chunkName: 'asdff',
          createHandler: webpackHotServerMiddleware.createKoaHandler
        }))
      })
      this.startListen()()

    } else {
      
      await this.SSRRoutes.map( async ssrRoute => {
        let {clientConfig,serverConfig} = ssrRoute.webpack
        console.log(serverConfig.output)
        await webpack([clientConfig, serverConfig]).run( (err, stats) => {
          //host static files
          // stats.toJson().children[0].assets.map( asset => {
          //   this.app.use(KoaServe(path.resolve(process.cwd(), clientConfig.output.path, asset.name), path.join(clientConfig.output.publicPath, asset.name)))
          // })

          // // //render html if route matches..
          // let clientStats = stats.toJson().children[0]
          // console.log(path.resolve(serverConfig.output.path, serverConfig.name+'.js'))
          // let serverRender = require(path.resolve(serverConfig.output.path, serverConfig.name+'.js')).default
          // this.app.use(serverRender({ clientStats }))

        })
      })
      this.startListen()()
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

      if (this.parent.config.environment == 'development' && this.parent.config.options && this.parent.config.options.logRequests) this.app.use(logger())
      
      this.app.use(this.routerPre.routes());

      /**
       * add koa middleware based on configs
       */
      await this.addKoaMiddleware()

      /**
       * Add serverside render pages
       */
      if (this.SSRRoutes.length > 0) await this.composeSSR()

    }catch(e){
      this.parent.logger.error('Server start(): '+ e)
    }
  }

  /**
   * Start listening
   */
  startListen(){
    //this is that :)
    var that = this
    //add routes
    that.app.use(that.router.middleware())
    return () => {
      that.parent.logger.info('Starting server on http://%s:%s <===', that.parent.config.hostname, that.parent.config.port )
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
  
  async addKoaMiddleware(){
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
