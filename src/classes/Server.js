import Koa from  'koa'
import Router from 'koa-better-router'
import compress from  'koa-compress'
import conditional from  'koa-conditional-get'
import cors from  'kcors'
import etags from  'koa-etag'
import fs from 'fs'
import fsExtra from 'fs-extra'
import helmet from  'koa-helmet'
import json from  'koa-json'
import koaConvert from 'koa-convert'
import koaStatic from  'koa-static-server'
import logger from  'koa-logger'
import path from 'path'
import webpack from 'webpack'

//
//Handle main Koa2 and webpack for app.
//
export default class Server {
  constructor(props, parent) {
    this.parent = parent;
    this.app = new Koa();
    this.router = new Router();
    this.router.loadMethods();

    this.isRunning = false;
    this.routesPath = path.resolve(process.cwd(), 'routes')

    this.webpackClientCfg = require(path.resolve(process.cwd(),'webpack/client.dev'))
    this.webpackServerCfg = require(path.resolve(process.cwd(),'webpack/server.dev'))

  }

  async start(){
    try{
      this.addKoaMiddleware()

      await this.handleRoutes()

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

    }catch(e){
      this.parent.logger.error('Server start(): '+ e)
    }
  }
  
  addKoaMiddleware(){
    if (this.parent.config.app && this.parent.config.app.useHelmet)
      this.app.use(helmet(this.parent.config.app.helmetOptions))

    if (this.parent.config.app && this.parent.config.app.useJsonPretty)
      this.app.use(json())
    
    if (this.parent.config.app && this.parent.config.app.useCompress)
      this.app.use(compress(this.parent.config.app.compressOptions))

    if (this.parent.config.app && this.parent.config.app.useCors)
      this.app.use(cors(this.parent.config.app.corsOptions))

    if (this.parent.config.app && this.parent.config.app.useEtags){
      this.app.use(conditional())
      this.app.use(etags())
    }
  }

  async handleRoutes(){
    //add "routes/"
    await this.addRoutesFolderOrFile(path.resolve(process.cwd(),'routes'))

    //parse "additional routes from config"
    if (this.parent.config.routes && this.parent.config.routes.routePaths){
      let {routePaths} = this.parent.config.routes
      if (!routePaths instanceof Array){
        this.parent.logger.warn('config.routes.routePaths is not a array!')
      }else{
        await routePaths.forEach(path => 
          this.addRoutesFolderOrFile(path)
        );
      }
    }
    //add router
    this.app.use(this.router.middleware())
  }

  async addRoutesFolderOrFile(p){
    try{
      let isFile = fs.lstatSync(p).isFile()
      let isDirectory = fs.lstatSync(p).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('Routes path:'+ p +' - does not exist')
        return
      }else{
        if (isFile){
          this.addRouteFile(p)
        }else{
          let files = await fs.readdirSync(p)
          files.forEach(file => this.addRouteFile(path.resolve(p, file)) );
        }
      }
    }catch(e){
      this.parent.logger.error('Server addRoutesFolderOrFile(): '+ e)
    }
  }
  addRouteFile(file){
    let route = require(file);
    route(this.router, this.parent.config);
    this.parent.logger.info('Route added: '+ file)
  }

  startListen(){
    var that = this
    that.parent.logger.info()
    that.parent.logger.verbose('Starting server on http://%s:%s <===', 
      that.parent.config.core.HOSTNAME, 
      that.parent.config.core.APP_PORT
    )
    return () => {
      //Only start once
      if (!that.isRunning){
        that.isRunning = !that.isRunning
        that.app.listen(
          that.parent.config.core.APP_PORT,
          () => {
            that.parent.logger.info()
            that.parent.logger.info(
              '==> Server is up at http://%s:%s <===', 
              that.parent.config.core.HOSTNAME, 
              that.parent.config.core.APP_PORT)
            that.parent.logger.info()
          }
        )
      }
    }
  }

  parseRoutesFolder() {
    let folderExists = fs.lstatSync(this.routesPath).isDirectory()
    if (folderExists){
      fs.readdirSync(this.routesPath).forEach(file => {
        if (file == 'index.js') return;
        var name = file.substr(0, file.indexOf('.'));
        let route = require(path.join(this.routesPath, name));
        route(this.router);
      });
    }
  }


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
