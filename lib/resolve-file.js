
var escodegen = require('escodegen')

module.exports = function (contents, done) {
  done(null, Buffer.from(escodegen.generate({
    type: 'Program',
    body: [
      {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'buf' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [ { type: 'Literal', value: 'wasmify/lib/to-buffer' } ]
            }
          }
        ],
      },
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'module' },
            property: { type: 'Identifier', name: 'exports' },
            computed: false
          },
          right: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'buf' },
            arguments: [ { type: 'Literal', value: contents.toString('base64') } ]
          }
        }
      }
    ]
  })))
}

