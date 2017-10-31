var path = require('path');

module.exports = {
  clientDir : path.resolve(process.cwd()),
  projectName : path.basename(path.resolve(process.cwd())),
  ua : path.resolve(__dirname, '..'),
}