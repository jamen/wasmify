
const test = require('tape')
const browserify = require('browserify')
const wasmify = require('../')

test('bundles wasm files', t => {
  t.plan(2)

  browserify(__dirname + '/fixture/wasm.js')
  .plugin(wasmify)
  .bundle(function (err, code) {
    t.error(err, 'no error')
    t.true(code, 'wasm bundle')
    // demo:
    console.log(code.toString())
  })
})
