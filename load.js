
var { decode } = require('base64-arraybuffer')

module.exports = function (src) {
  return function (imports) {
    return WebAssembly.compile(decode(src))
      .then(mod => WebAssembly.Instance(mod, imports))
      .then(ins => ins.exports)
  }  
}
