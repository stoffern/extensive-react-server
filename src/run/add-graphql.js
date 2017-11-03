import fs from 'fs-extra'
import path from 'path'
import winston from 'winston'

module.exports = async function addGraphQL () {
  try{
    let uaFolder = path.resolve(process.cwd(), './node_modules/universal-app')

    winston.info('Adding GraphQL..')
    fs.copy(
      path.resolve(uaFolder, 'templates','graphql','route.js'), 
      path.resolve(process.cwd(), 'routes','graphql.js')
    )
    fs.copy(
      path.resolve(uaFolder, 'templates','graphql','config.js'), 
      path.resolve(process.cwd(), 'config','graphql.js')
    )
    fs.copy(
      path.resolve(uaFolder, 'templates','graphql','schema.js'), 
      path.resolve(process.cwd(), 'graphql','schema.js')
    )

  }catch(e){
    winston.error(e)
  }
  finally{
    winston.info('GraphQL files added..')
  }
}
