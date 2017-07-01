
# wasmify (WIP)

> Require WASM modules from Browserify 

```js
var foo = require('./foo')
var bar = require('./bar.wasm')

console.log(
  foo.hello() + bar.world()
)
```

## Roadmap

The project is experimental, so here is a roadmap (that will expand) to see whats done:

 - [x] Import WASM modules
 - [ ] Exports using WASM imports
 - [ ] [Test on the suite](https://github.com/WebAssembly/testsuite)

## Install

```sh
npm i wasmify
```

**Note:** Do not install as a `devDependency` because it is used at runtime.

## Usage

Just load it as a transform:

```sh
browserify -t wasmify
```

Then you can require WASM files.

You can also publish WASM modules to npm and require them here.

Use `--extension` to require files without a `.wasm` extension:

```sh
browserify --extension .wasm -t wasmify
```

### How this work?

It transforms the required `.wasm` files into JS files that export an `ArrayBuffer` from a base64 encoded string.

When the `.wasm` files are imported, those `ArrayBuffer`s are received, and passed into `wasmify/lib/load` where they are instantiated in parallel to give you the exports.

For example, give the source:

```js
var import1 = require('foo')
var import2 = require('bar')
var wasm1 = require('baz')
var wasm2 = require('qux')

console.log(import1.hello() + wasm2.world())
// ...
```

This transforms into:

```js
var import1 = require('foo')
var import2 = require('bar')
require('wasmify/lib/load')([
  require('node_modules/baz/index.wasm'),
  require('node_modules/qux/lib/qux.wasm')
], function (wasmExports) {
  var wasm1 = wasmExports[0]
  var wasm2 = wasmExports[1]

  console.log(import1.hello(), wasm2.world())
  // ...
})
```

