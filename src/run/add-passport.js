import fs from 'fs-extra'
import path from 'path'
import winston from 'winston'

module.exports = async function addGraphQL () {
  try{
    let uaFolder = path.resolve(process.cwd(), './node_modules/universal-app')

    winston.info('Adding Passport..')
    fs.copy(
      path.resolve(uaFolder, 'templates','passport','route.js'), 
      path.resolve(process.cwd(), 'routes','passport.js')
    )
    fs.copy(
      path.resolve(uaFolder, 'templates','passport','passports'), 
      path.resolve(process.cwd(), 'routes','passports')
    )

  }catch(e){
    winston.error(e)
  }
  finally{
    winston.info('Passport files added..')
  }
}
