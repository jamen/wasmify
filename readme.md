
# wasmify

> Require WebAssembly modules with Browserify.

Use this [Browserify plugin](https://browserify.org/) to import [WebAssembly binaries](http://webassembly.org/).

## Install

```sh
$ npm i -D wasmify
```

## Usage

Simply load the plugin:

```sh
$ browserify -p wasmify
```

Which allows you to import `.wasm` files in your source:

```js
const sampleModule = require('./sample.wasm')

sampleModule(imports).then(sample => {
  sample.main(12, 34)
})
```

### Sync modules

Small modules (< 4KB) can be imported synchronously through a `sync` option.

```js
b.plugin(wasmify, {
  sync: [
    'sample.wasm'
    // ...
  ]
})
```

This means that the exports can be accessed immediately.

```js
const sampleModule = require('sample.wasm')

const sample = sampleModule(imports)

sample.main(12, 34)
```
