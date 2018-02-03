
const fs = require('fs')
const test = require('tape')
const open = require('open')
const browserify = require('browserify')

const wasmify = require('../')

test('bundles sample wasm file', t => {
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

test('bundles mandelbrot wasm file', t => {
  t.plan(2)

  browserify(__dirname + '/fixture/mandelbrot.js')
  .plugin(wasmify)
  .bundle(function (err, code) {
    t.error(err, 'no error')
    t.true(code, 'wasm bundle')
    fs.writeFileSync(__dirname + '/fixture/mandelbrot.bundle.js', code)
    // make sure this will be opened by browser with WebAssembly supports.
    open("file://" + __dirname + '/fixture/mandelbrot.html')
  })
})