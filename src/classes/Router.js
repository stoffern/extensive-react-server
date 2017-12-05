import fs from 'fs'
import path from 'path'
import KoaRouter from 'koa-router'
import KoaStatic from 'koa-static-server'

export default class Router {
  constructor(props, parent) {
    this.parent = parent;
    this.api = new KoaRouter();
  }

  addRouteFile(file){
    let route = require(file)
    route(this.api, this.parent.app, this.parent.parent.config)
    this.parent.logger.info('[Route] added: '+ file)
  }

  async addRoutes(routeArray){
    if (!routeArray.isArray()){
      this.parent.logger.warn('[Route] addRoutes() - the function should contain a array!')
      return
    }
    routeArray.map(route => this.addRoute(route))
  }

  addStaticFile(filePath, servePath){
    if (!filePath || filePath.length == 0){
      this.parent.logger.warn('[Router] addStaticFile() - called without a valid file/string.')
      return
    } 

    try{
      let isFile = fs.lstatSync(filePath).isFile()
      if( !isFile ){
        this.parent.logger.warn('[Router] addStaticFile() - path:'+ filePath +' - is not a file')
        return
      }else{
        this.parent.app.use(KoaStatic({rootDir: filePath, rootPath: servePath}))
      }
    }


  }

  addStaticFolder(filePath, servePath){
    if (!filePath || filePath.length == 0){
      this.parent.logger.warn('[Router] addStaticFolder() - called without a valid file/string.')
      return
    } 

    try{
      let isFile = fs.lstatSync(filePath).isFile()
      let isDirectory = fs.lstatSync(filePath).isDirectory()
      if( !isFile && !isDirectory ){
        this.parent.logger.warn('[Route] addStaticFolder() - path:'+ filePath +' - does not exist')
        return
      }else{
        if (isFile){
          this.addStaticFile(filePath)
        }else{
          this.parent.app.use(KoaStatic({rootDir: filePath, rootPath: servePath}))
          //host folder
        }
      }
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


}
