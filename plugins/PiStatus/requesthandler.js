var os = require('os')

module.exports.systemUptime = function (req, res) {
  var uptime = os.uptime()
  var data = {
    hours: parseInt(uptime / 3600, 10),
    minutes: parseInt((uptime / 60) % 60, 10),
    seconds: uptime % 60
  }
  res.status(200).json(data)
}
