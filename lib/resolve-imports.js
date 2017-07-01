
var acorn = require('acorn')
var escodegen = require('escodegen')
var esvalid = require('esvalid')
var walk = require('estree-walker').walk
var resolveModule = require('resolve').sync
var { isAbsolute, resolve, extname } = require('path')

module.exports = transform

function transform (code, dir, done) {
  code = code.toString()
  var root = acorn.parse(code, { sourceType: 'module' })
  var stopped = false

  // Verify that there is no random WASM imports in the tree
  // This way the user isn't caught off gaurd
  walk(root, {
    enter: function (node, parent) {
      if (stopped) return this.skip()
      if (parent === root) return
      if (node.type !== 'VariableDeclaration') return
      for (var i = 0; i < node.declarations.length; i++) {
        var dec = node.declarations[i]
        var init = dec.init
        if (isRequire(init) && resolveWasmPath(init.arguments[0].value, dir)) {
          stopped = true
          done(new Error('Can only handle WASM imports at the base and top'))
        }
      }
    }    
  })

  if (stopped) return

  // Sort body nodes
  var body = root.body
  var wasmIds = []
  var imports = []
  var rest = []
  for (var i = 0; i < body.length; i++) {
    var node = body[i]
    if (node.type === 'VariableDeclaration') {
      for (var d = 0; d < node.declarations.length; d++) {
        var dec = node.declarations[d]
        if (isRequire(dec.init)) {
          var path = resolveWasmPath(dec.init.arguments[0].value, dir)
          if (path) wasmIds.push(dec.id)
          imports.push(dec)
        } else {
          rest.push({
            type: 'VariableDeclaration',
            declarations: [dec],
            kind: node.kind || 'var'
          })
        }
      }
    } else {
      rest.push(node)
    }
  }

  if (wasmIds.length) {
    root = acorn.parse(`
    ${ escodegen.generate({ type: 'Program', body: imports }) }
    require('wasmify/lib/load')([
      ${ wasmIds.map(node => node.name).join(',') }
    ], function (_wasmImportErr, _wasmExports) {
      if (_wasmImportErr) throw _wasmImportErr
      ${ wasmIds.map((node, i) =>
          `${node.name} = _wasmExports[${i}]`) }
      ${ escodegen.generate({ type: 'Program', body: rest }) }
    })
    `)
  }

  // Create new program node
  var res = escodegen.generate(root)

  done(null, Buffer.from(res))
}

function isRequire (node) {
  return node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] !== undefined &&
    node.arguments[0].type === 'Literal'
}

function resolveWasmPath (path, dir) {
  try {
    path = resolveModule(path, {
      extensions: [ '.wasm' ],
      basedir: dir
    })

    return extname(path) === '.wasm' ? path : null
  } catch (e) {
    return null
  }
}

