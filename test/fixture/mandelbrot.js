const mandelbrot = require('./mandelbrot.wasm')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const WIDTH = 1200
const HEIGHT = 800

ctx.scale(2, 2)
const config = {
  x: -0.7436447860,
  y: 0.1318252536,
  d: 0.00029336,
  iterations: 10000
}

const memory = new WebAssembly.Memory({ initial: 512 })

const imports = {
  env: {
   abortStackOverflow: () => { throw new Error('overflow'); },
   table: new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
   tableBase: 0,
   memory: memory,
   memoryBase: 1024,
   STACKTOP: 0,
   STACK_MAX: memory.buffer.byteLength,
  }
}

mandelbrot(imports)
  .then(({module, instance}) => {
    instance.exports._mandelbrot(config.iterations, config.x, config.y, config.d)
    const imgData = ctx.createImageData(WIDTH, HEIGHT)
    const offset = instance.exports._getImage()
    const linearMemory = new Uint8Array(imports.env.memory.buffer, offset, WIDTH * HEIGHT * 4)

    for (let i = 0; i < linearMemory.length; i++) {
      imgData.data[i] = linearMemory[i]
    }
    ctx.putImageData(imgData, 0, 0)
  })
  .catch((err) => {
    console.log(err.message)
  })