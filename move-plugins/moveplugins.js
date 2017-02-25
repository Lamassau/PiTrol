module.exports.movePlugins = function (src, dest) {
  var exec = require('child_process').exec
  console.log(`Moving ${src} to ${dest}`)
  exec(`rm -rf ${dest}${src}`, function (error) {
    if (error) {
      console.error(`exec error: ${error}`)
    } else {
      exec(`cp -r ${src} ${dest}`, function (error, stdout, stderr) {
        if (error) {
          console.error(`exec error: ${error}`)
        }
      })
    }
  })
}
