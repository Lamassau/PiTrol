'use strict'

require('babel-register')

const app = require('./app').app

const PORT = process.env.PORT || 9000

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))
