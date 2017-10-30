import Koa from  'koa'
import koaConvert from 'koa-convert'
import koaStatic from  'koa-static-server'
import helmet from  'koa-helmet'
import webpack from 'webpack'
import path from 'path'


export default class Server {
  constructor(props, parent) {
    this.parent = parent;
    this.app = new Koa();

    this.isRunning = false;
    this.routesPath = path.resolve(process.cwd(), 'routes')

    this.webpackClientCfg = require('../../../webpack/client.dev')
    this.webpackServerCfg = require('../../../webpack/server.dev')

  }

  async start(){
    try{
      this.app.use(helmet())
      // app.use(compression())
      // app.use(cookieParser())

      if (this.parent.config.environment == 'development') {
        this.parent.logger.verbose('Running in development mode..')

        const webpackDevMiddleware = require('webpack-dev-middleware')
        const webpackHotMiddleware = require('koa-webpack-hot-middleware')
        const webpackHotServerMiddleware = require('webpack-hot-server-middleware')
        this.parent.logger.verbose('Webpack files loaded!')

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
        
        this.parent.logger.verbose('Running in production mode..')
        const publicPath = this.webpackClientCfg.output.publicPath
        const outputPath = this.webpackClientCfg.output.path

        webpack([this.webpackClientCfg, this.webpackServerCfg]).run((err, stats) => {
          const clientStats = stats.toJson().children[0]
          const serverRender = require('../../../build/ssr/main.js').default

          this.app.use(koaStatic({rootDir: outputPath, rootPath: publicPath}))
          this.app.use(serverRender({ clientStats }))

          this.startListen()()
        })
      }

    }catch(e){
      this.parent.logger.error(e)
    }
  }

  startListen(){
    this.parent.logger.verbose('Starting server on http://%s:%s <===', 
      this.parent.config.core.HOSTNAME, 
      this.parent.config.core.APP_PORT
    )
    var that = this
    return () => {
      //Only start once
      if (!that.isRunning){
        that.isRunning = !that.isRunning
        that.app.listen(
          that.parent.config.core.APP_PORT,
          () => {
            that.parent.logger.info(
              '==> Server is up at http://%s:%s <===', 
              that.parent.config.core.HOSTNAME, 
              that.parent.config.core.APP_PORT)
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
