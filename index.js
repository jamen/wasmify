
const fs = require('fs')
const spawn = require('child_process').spawn
const through = require('through2')
const temp = require('tempy').file
const wrap = require('browserify-wrap')

module.exports = wasmify
// Built-in configs
wasmify.emscripten = require('./config/emscripten')
wasmify.wabt = require('./config/wabt')

function wasmify (b, options) {
  options = Object.assign({}, options)
  options.config = options.config || options.c

  // Generate optoins from config name
  if (options.config) {
    Object.assign(options, wasmify[options.config])
  }

  // Default to simple universal load
  if (!options.load) options.load = wasmify.wabt.load

  // Turn it into a string for embedding in client code
  options.load = options.load.toString()

  // Fix quirk where "foo () { }" method syntax breaks the expression
  if (
    /^([^\ ]+)(\s*)\(.*\)(\s*)\{/.test(options.load) &&
    !/^function(\s*)\(/.test(options.load)
  ) {
    options.load = 'function ' + options.load
  }

  // Add global wasm loader, used by the wasm imports 
  b.plugin(wrap, {
    prefix: `\
      function _loadWasmModule (src) {
        var len = src.length
        var trailing = src[len-2] == '=' ? 2 : src[len-1] == '=' ? 1 : 0 
        var buf = new Uint8Array((len * 3/4) - trailing)

        var _table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        var table = new Uint8Array(130)
        for (var c = 0; c < _table.length; c++) table[_table.charCodeAt(c)] = c
        
        for (var i = 0, b = 0; i < len; i+=4) {
          var second = table[src.charCodeAt(i+1)]
          var third = table[src.charCodeAt(i+2)]
          buf[b++] = (table[src.charCodeAt(i)] << 2) | (second >> 4)
          buf[b++] = ((second & 15) << 4) | (third >> 2)
          buf[b++] = ((third & 3) << 6) | (table[src.charCodeAt(i+3)] & 63)
        }

        return (${options.load})(buf)
      }
    `.trim()
  })

  // Transform wasm or source files
  b.transform(function (id) {
    function write () {
      fs.readFile(id, (err, code) => {
        const compileWasm = (err, wasm) => {
          if (err) {
            return this.emit('error', err)
          }

          if (wasm) {
            this.push(`module.exports=_loadWasmModule('${wasm}')`)
          } else {
            this.push(code.toString())
          }

          this.push(null)
        }

        if (err) return compileWasm(err)

        if (/\.wasm$/.test(id)) {
          compileWasm(null, code.toString('base64'))
        } else if (options.compile) {
          Promise.resolve(options.compile(code, id))
            .then(wasm => compileWasm(null, wasm))
            .catch(err => compileWasm(err))
        } else {
          this.push(code)
          this.push(null)
        }
      })
    }

    // Used to skip read stream
    const _skip = (a, b, next) => next()

    return through(_skip, write)
  })

  return b
}

