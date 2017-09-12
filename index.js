
const fs = require('fs')
const through = require('through2')

module.exports = function wasmify (filepath, options) {
  // Skip non-wasm files
  if (!/\.wasm$/.test(filepath)) {
    console.log('skipped boi', filepath)
    return through()
  }

  const thru = through({ encoding: 'binary' }, write, end)

  function write (buf, enc, next) {
    next()
  }

  function end () {
    fs.readFile(filepath, 'base64', (err, contents) => {
      const jsFile = wasmToJS(contents)
      console.log(jsFile.toString())
      this.push(jsFile)
      this.push(null)
    })
  }

  function wasmToJS (wasm) {
    return Buffer.from(`
      module.exports=require('wasmify/load')('${wasm}')
    `.trim(), 'binary')
  } 

  return thru
}
