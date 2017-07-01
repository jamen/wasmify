
var { extname, dirname } = require('path')
var toArrayBuffer = require('buffer-to-arraybuffer')
var reduce = require('stream-reduce')
var through = require('through2')
var resolveWasmImports = require('./resolve-imports')
var resolveWasmFile = require('./resolve-file')

module.exports = function wasmify (filepath, options) {

  function transformWasmImports (contents, enc, done) {
    resolveWasmImports(contents, dirname(filepath), done)
  }

  function transformWasmFile (contents, enc, done) {
    resolveWasmFile(contents, done)
  }

  if (extname(filepath) === '.json') return through()
  if (extname(filepath) === '.wasm') return collect(transformWasmFile) 
  else return collect(transformWasmImports)
}

function collect (fn) {
  return reduce(function (chunk, contents) {
    if (!contents) return chunk
    return Buffer.concat([contents, chunk])
  }, Buffer.alloc(0))
  .pipe(through(fn))
}
