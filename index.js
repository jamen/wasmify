
const fs = require('fs')
const spawn = require('child_process').spawn
const through = require('through2')
const temp = require('tempy').file

module.exports = function wasmify (filepath, options) {
  if (!/\.wa(t|st|sm)$/.test(filepath)) {
    return through()
  }

  let isWasm = /\.wasm$/.test(filepath) 

  function noread (buf, enc, next) {
    next()
  }

  function end () {
    const finish = (err, wasm) => {
      if (err) return this.emit('error', err)
      this.push(`module.exports=require('wasmify/load')('${wasm}')`)
      this.push(null)
    }

    fs.readFile(filepath, 'base64', (err, contents) => {
      if (isWasm) {
        finish(err, contents)
      } else {
        const temppath = temp({ extension: 'wasm' })
        const args = [filepath, '-o', temppath]
        spawn('wat2wasm', args, { stdio: 'inherit' }).on('close', () => {
          fs.readFile(temppath, 'base64', (e1, contents) => {
            fs.unlink(temppath, e2 => finish(e1 || e2, contents))
          })
        })
      }  
    })
  }

  return through(noread, end)
}

