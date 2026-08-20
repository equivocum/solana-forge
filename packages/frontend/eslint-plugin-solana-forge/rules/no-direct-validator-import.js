/**
 * ESLint rule to enforce architectural boundaries:
 * Client (frontend) cannot directly import from Validator (native) modules.
 * 
 * This ensures the RPC/Validator separation per Constitution Principle VI.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct imports from validator/native modules in client code',
      category: 'Architectural Boundaries',
      recommended: true
    },
    messages: {
      noDirectValidatorImport: 
        'Direct import from validator/native module is forbidden. ' +
        'Use the RPC simulation layer (packages/frontend/src/services/rpc.ts) instead. ' +
        'See Constitution Principle VI: RPC/Validator Separation.'
    },
    schema: []
  },

  create(context) {
    const forbiddenPatterns = [
      /^@solana-forge\/native/,
      /packages\/native\//,
      /\.node$/ // Native module files
    ]

    return {
      ImportDeclaration(node) {
        const source = node.source.value
        if (typeof source !== 'string') return

        for (const pattern of forbiddenPatterns) {
          if (pattern.test(source)) {
            context.report({
              node,
              messageId: 'noDirectValidatorImport'
            })
            return
          }
        }
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
          const source = node.source.value
          for (const pattern of forbiddenPatterns) {
            if (pattern.test(source)) {
              context.report({
                node,
                messageId: 'noDirectValidatorImport'
              })
              return
            }
          }
        }
      }
    }
  }
}
