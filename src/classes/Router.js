import fs from 'fs'
import path from 'path'
import KoaRouter from 'koa-better-router'

export default class Router {
  constructor(props, parent) {
    this.parent = parent;
    this.api = new KoaRouter();
    this.api.loadMethods();
  }

  parseRoutesFolder() {
    let folderExists = fs.lstatSync(this.routesPath).isDirectory()
    if (folderExists){
      fs.readdirSync(this.routesPath).forEach(file => {
        if (file == 'index.js') return;
        var name = file.substr(0, file.indexOf('.'));
        let route = require(path.join(this.routesPath, name));
        route(this.api);
      });
    }
  }

  async addRoutes(routeArray){
    if (!routeArray.isArray()){
      this.parent.logger.warn('[Router] addRoutes() - the function .addRoutes() should contain a array!')
      return
    }
    routeArray.map(route => this.addRoute(route))
  }

  async addRoute(route){
    if (!route || route.length == 0){
      this.parent.logger.warn('[Router] addRoute() - called without a valid file/string.')
      return
    } 
    route = path.resolve(process.cwd(), route)
    try{
      let isFile = fs.lstatSync(route).isFile()
      let isDirectory = fs.lstatSync(route).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('[Router] addRoute() - path:'+ route +' - does not exist')
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
      this.parent.logger.warn('[Router] addRoutesFolderOrFile() - '+ e)
    }
  }


  async addPath(path){
    try{
      let isFile = fs.lstatSync(path).isFile()
      let isDirectory = fs.lstatSync(path).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('[Router] addPath() - Path:'+ path +' - must be a file or folder')
        return
      }else{
        if (isFile)
          this.addStaticFile(path)
        else
          this.addStaticFolder(path)
      }
    }catch(e){
      this.parent.logger.warn('[Router] addPath(): '+ e)
    }

  }
  async addStaticFile(file){

  }
  async addStaticFolder(folder){

  }

  addRouteFile(file){
    let route = require(file);
    route(this.api, this.parent.server, this.parent.config);
    this.parent.logger.info('[Router] added: '+ file)
  }

}
