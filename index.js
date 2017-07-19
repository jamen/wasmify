
var through = require('through2')
var reduce = require('stream-reduce')
var escodegen = require('escodegen')

var WASM_FILE = /\.wasm$/

module.exports = function wasmify (filepath, options) {
  // Transform WASM requires 
  if (WASM_FILE.test(filepath)) {
    return collect(function (contents, enc, done) {
      contents = resolveWasmFile(contents)
      done(null, Buffer.from(contents))
    })
  }

  // Pass all other files
  return through()
}

function collect (fn) {
  return reduce(function (chunk, contents) {
    if (!contents) return chunk
    return Buffer.concat([contents, chunk])
  }, Buffer.alloc(0))
  .pipe(through(fn))
}

function resolveWasmFile (wasmModule, done) {
  return escodegen.generate({
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'module' },
            property: { type: 'Identifier', name: 'exports' },
            computed: false
          },
          right: {
            type: 'CallExpression',
            callee: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [ { type: 'Literal', value: 'wasmify/load' } ]
            },
            arguments: [ { type: 'Literal', value: wasmModule.toString('base64') } ]
          }
        }
      }
    ]
  })
}


