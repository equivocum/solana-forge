/**
 * Integration test for architectural boundary enforcement.
 * 
 * This test verifies that the ESLint rule correctly prevents
 * direct imports from validator/native modules in client code.
 */

import { describe, it, expect } from 'vitest'
import { RuleTester } from 'eslint'
import rule from '../../packages/frontend/eslint-plugin-solana-learn/rules/no-direct-validator-import'

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
})

describe('Architectural Boundary: No Direct Validator Import', () => {
  ruleTester.run('no-direct-validator-import', rule, {
    valid: [
      // Valid imports from frontend services
      {
        code: `import { SimulationEngine } from './services/simulation'`
      },
      {
        code: `import { RpcService } from './services/rpc'`
      },
      {
        code: `import { Keypair } from '@noble/ed25519'`
      },
      // Dynamic import of allowed modules
      {
        code: `const mod = import('./services/simulation')`
      }
    ],

    invalid: [
      // Direct import from native package
      {
        code: `import { SimulationNative } from '@solana-learn/native'`,
        errors: [{ messageId: 'noDirectValidatorImport' }]
      },
      // Direct import from native path
      {
        code: `import { validator } from 'packages/native/src/lib'`,
        errors: [{ messageId: 'noDirectValidatorImport' }]
      },
      // Dynamic import of native module
      {
        code: `const native = import('@solana-learn/native')`,
        errors: [{ messageId: 'noDirectValidatorImport' }]
      },
      // Import of .node file
      {
        code: `import binding from './binding.node'`,
        errors: [{ messageId: 'noDirectValidatorImport' }]
      }
    ]
  })

  it('should export a valid ESLint rule', () => {
    expect(rule).toBeDefined()
    expect(rule.meta).toBeDefined()
    expect(rule.create).toBeInstanceOf(Function)
  })
})
