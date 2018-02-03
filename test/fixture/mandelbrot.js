const mandelbrot = require('./mandelbrot.wasm')

const imports = {
  env: {
   abortStackOverflow: () => { throw new Error('overflow'); },
   table: new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
   tableBase: 0,
   memory: new WebAssembly.Memory({ initial: 512 }),
   memoryBase: 1024,
   STACKTOP: 0,
   STACK_MAX: memory.buffer.byteLength,
  }
}

mandelbrot(imports)
  .then(({module, instance}) => {
    console.log(instance.exports._mandelbrot)
  })
  .catch((err) => {
    console.log(err.message)
  })