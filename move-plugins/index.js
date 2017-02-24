var movePlugins = require('./moveplugins').movePlugins

process.exit(movePlugins('plugins', 'src/') ? 0 : 1)
