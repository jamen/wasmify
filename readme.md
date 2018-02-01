
# wasmify

> Require WebAssembly modules with Browserify.

Use this [Browserify plugin](https://browserify.org/) to import [WebAssembly binaries](http://webassembly.org/).

## Install

```sh
$ npm i -D wasmify
```

###

Simply load the plugin:

```sh
$ browserify -p wasmify
```

Which allows you to import `.wasm` files in your source:

```js
const sampleModule = require('./sample.wasm')

sampleModule
.then(mod => WebAssembly.initialize(mod, imports))
.then(sample => {
  sample.main(12, 34)
})
```
