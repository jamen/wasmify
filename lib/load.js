
module.exports = function (buffers, callback) {
  Promise.all(buffers.map(buf => {
    return WebAssembly.instantiate(buf)
  })).then(results => {
    callback(null, results.map(res => res.instance.exports))
  }, err => {
    callback(err)
  })
}
