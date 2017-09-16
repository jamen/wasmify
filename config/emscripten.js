
const temp = require('tempy').file
const spawn = require('execa')
const promisify = require('util-promisify')
const fs = require('fs')

const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

module.exports = {
  compile (code, id) {
    if (/.(c|cc|cpp)$/.test(id)) {
      const temppath = temp({ extension: 'wasm' })
      return spawn('emcc', [id, '-Os', '-s', 'BINARYEN=1', '-s', 'SIDE_MODULE=1', '-o', temppath])
        .then(results => read(temppath, 'base64'))
        .then(contents => unlink(temppath).then(() => contents))
    }    
  },
  // From https://gist.github.com/kripken/59c67556dc03bb6d57052fedef1e61ab
  load (buf) {
    var module = new WebAssembly.Module(buf)
    var instance = new WebAssembly.Instance(module, {
      env: {
        memoryBase: 0,
        tableBase: 0,
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        _puts: console.log
      }
    })
    instance.exports.__post_instantiate()
    return instance.exports 
  }
}
