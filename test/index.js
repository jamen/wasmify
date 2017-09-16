
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
    // console.log(result.code)
  })
})

test('bundles with wabt config', t => {
  t.plan(3)
  
  browserify(__dirname + '/fixture/wat.js')
  .plugin(wasmify, wasmify.wabt)  
  .bundle(function (err, code) {
    t.error(err, 'no error')

    code = code.toString()
    var funcdef = code.indexOf('function _loadWasmModule')
    var wasmimport = code.indexOf('_loadWasmModule(\'AG')
    
    t.not(-1, funcdef, 'found wasm load definition')
    t.not(-1, wasmimport, 'found wasm load call')

    // demo:
    // console.log(code)
  })
})

test('bundles with emscripten config', t => {
  t.plan(3)
  
  browserify(__dirname + '/fixture/cc.js')
  .plugin(wasmify, wasmify.emscripten)  
  .bundle(function (err, code) {
    t.error(err, 'no error')
    
    code = code.toString()
    var funcdef = code.indexOf('function _loadWasmModule')
    var wasmimport = code.indexOf('_loadWasmModule(\'AG')
    
    t.not(-1, funcdef, 'found wasm load definition')
    t.not(-1, wasmimport, 'found wasm load call')

    // demo:
    // console.log(code)
  })
})
