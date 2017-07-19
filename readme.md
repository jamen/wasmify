
# wasmify

> Require WASM modules with Browserify

This is a [Browserify](https://npmjs.com/browserify) transform that enables you to require `.wasm` files.

```js
var example = require('./example.wasm')

example(imports).then(exports => {
  // Calling WASM funcion
  exports.foo()
})
```

It works even better with top-level `await`:

```js
var bar = await require('./bar.wasm')({ ...imports })

// Calling a WASM function
bar.example()
```

## Install

```sh
npm i -D wasmify
```

## Usage

Load it as a transform:

```sh
browserify -t wasmify
```

Then you can require WASM files.

Use `--extension` to require files without needing a `.wasm` extension:

```sh
browserify --extension .wasm -t wasmify
```

### How does it work?

It transforms any `.wasm` files you require into a JS module that exports something along the lines of:

```js
module.exports = require('wasmify/load')('AGFzbQEAAAABBAFgAAACCwEDZm9vA2JhcgAAAwIBAAcIAQR0ZXN0AAEKBgEEABAACw==')
```

Where the WASM module is base64 encoded and passed off to `wasmify/load`.

The `wasmify/load` module returns a function where you can pass imports and then returns a promise containing the module's exports:

```js
var foo = require('./that-file.wasm')


foo(imports).then(exports => {
  // ...
})
```

Combine these with `async`/`await` for even better use.


