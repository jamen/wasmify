
# wasmify

> Bundle WebAssembly modules with Browserify.

Use this [Browserify transform](https://npmjs.com/browserify) to import [WebAssembly](http://webassembly.org) modules.  All of the `.wasm` files (binary format) are embed in your bundle as base64 strings and compiled for you.  Additionally, `.wat` or `.wast` files (text format) are compiled with [WABT's `wat2wasm` command](https://github.com/webassembly/wabt) before being embed (see also [`webassemby-binary-toolkit`](https://npmjs.com/webassembly-binary-toolkit)).

<!-- TODO: Link to other packages easliy used with this package -->

## Install

```sh
npm i -D wasmify
```

**Note:** Needs [WABT](https://github.com/webassembly/wabt) for compiling `.wat` and `.wast` files. 

## Usage

Load the transform into Browserify (or another tool).  For example:

```js
browserify app.js -t wasmify > out.js
```

Then take a WebAssembly module, like this one:

```wat
(module
  (func (export "pi") (result f32)
    (f32.const 3.1415926535)
  )
)
```

And import it inside JS code:

```js
const test = require('./test.wat')

// Call signature for module:
// init(imports?) -> Promise<exports?>

test().then(exports => {
  exports.pi()
  // 3.1415...
})
```

Your bundle will contain the WebAssembly as a base64 strings.

You can also use the first parameter as a way to write imports:

```js
test({
  foo: { ... },
  bar: { ... }
}).then(exports => {
  // ...
})
```

Another trick is passing `--extension` to `browserify` so you can import the modules without extensions.

```
browserify app.js -t wasmify --extension .wat > out.js
```

