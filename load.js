
var str2ab = require('string-to-arraybuffer')

module.exports = function (src) {
  return function (imports) {
    return WebAssembly.instantiate(str2ab(src), imports)
    .then(w => w.instance.exports)
  }  
}
