import fs from 'fs-extra'
import path from 'path'

module.exports = async function runAddFile () {
  try{
    let command = process.argv[3]
    if (command == undefined || command == '' ){
      console.log('Please type what module you want to add! Example: ua add graphql')
    }else{
      let libFolder = path.resolve(process.cwd(), './node_modules/universal-app/lib/run')
      await require(path.resolve(libFolder,'add-'+command+'.js'))()
    }

  }catch(e){
    console.log('Error')
    console.log(e)
  }
}
