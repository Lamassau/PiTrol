const utils = require('./utils')
const fatal = utils.fatal
const pass = utils.pass

module.exports.movePlugins = function (src, dest) {
  var exec = require('child_process').exec
  exec(`rm -rf ${dest}${src}`, (error) => { if (error) fatal(error) })
  exec(`cp -r ${src} ${dest}`, (error) => { if (error) fatal(error) })
  return pass(`Plugins have been moved from ${src} to ${dest}`)
}
