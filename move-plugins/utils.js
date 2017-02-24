module.exports.fatal = function (error) {
  console.error(`exec error: ${error}`)
  return false
}

module.exports.pass = function (message) {
  console.log(message)
  return true
}
