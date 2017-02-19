const app = require('./app').app

test('exports express instance', function () {
  expect(app).toBeInstanceOf(Function)
})
