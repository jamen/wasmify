
const temp = require('tempy').file
const spawn = require('execa')
const promisify = require('util-promisify')
const fs = require('fs')

const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

module.exports = {
  compile (code, id) {
    if (/.wa(t|st)$/.test(id)) {
      const temppath = temp({ extension: 'wasm' })
      return spawn('wat2wasm', [id, '-o', temppath])
        .then(results => read(temppath, 'base64'))
        .then(contents => unlink(temppath).then(() => contents))
    }
  },
  load (buf) {
    return imports => {
      var module = WebAssembly.Module(buf)
      var instance = WebAssembly.Instance(module, imports)
      return instance.exports
    }
  }
}


