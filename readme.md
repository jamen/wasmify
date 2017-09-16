
# wasmify

> Import WebAssembly (and code that compiles to it) with Browserify

Use this [Browserify plugin](https://browserify.org/) to import code such as C, C++, Rust, Wat, or just standalone `.wasm` binaries.  The built-in configs include

 - `wasmify.emscripten` for using C/C++ with [Emscripten](https://github.com/kripken/emscripten)
 - `wasmify.wabt` for using WAT with [WebAssembly Binary Toolkit](https://github.com/kripken/emscripten)
 - Others? [Submit an issue](https://github.com/jamen/wasmify).

You can also create your own configs.  See [Configurations](#configurations) and [`config/`](config/) for more details.

## Install

```sh
npm i -D wasmify
```

Note: In order for built-in configs to work, you must install and build their parent projects.

## Usage

You can run `wasmify` with or without a config.  Without one, you will only be able to require `.wasm` binaries.  With one, you are able to require source code files and have them be compiled for you.

First load the plugin.  Here is an example using the Emscripten config:

```
browserify -p [ wasmify -c emscripten ]
```

### `wasm()`

The base of the plugin lets you require `.wasm` files.  They get embed as base64.

```js
var createSample = require('./sample.wasm')

var sample = createSample()

sample.main()
```

### `wasm(wabt)`

For compiling WAT files you can use the [WebAssembly Binary Toolkit](https://github.com/webassembly/wabt) config by: 

 - Passing the `-c wabt` flag in command line
 - Passing `wasmify.wabt` into the options

To use the modules would look like this:

```js
var createSample = require('./sample.wat')

var sample = createSample()

sample.main()
```

### `wasm(emscripten)`

For compiling C/C++ files, you can can use the [Emscripten](https://github.com/kripken/emscripten) config:

 - Passing `-c emscripten` flag in command line
 - Passing `wasmify.emscripten` into the options

Using it would appear as:

```js
var main = require('./sample.cc')._main

// Calling C/C++ functoin
main(3)
```

### Configurations

The configuration objects are expressed as:

```js
{
  compile(code, id): Promise<wasm>,
  load(wasm): any
}
```

The `compile` function is responsible for turning a source file into WebAssembly.  For example, spawning the command of a compiler and getting the results.

The `load` function gets embed in the bundle, and is responsible for returning the exports for a WebAssembly import.  By default this is simply:

```js
init(imports) -> exports
```

Which looks like:

```js
import createFoo from './source.ex'

var { ...exports } = createFoo({ ...imports })
```
