import UniversalApp from '../'

function run () {
  console.log('Starting server')
  UniversalApp.start()
}
module.exports = () => run()