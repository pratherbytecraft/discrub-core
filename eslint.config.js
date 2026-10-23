import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// discrub-core is a plain TypeScript library with no React code, so the React
// hooks and refresh plugins the Vite template shipped are gone (1.0.17); they
// were never installed and stopped `eslint .` from running at all.
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'storybook-static'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // A leading underscore marks a value that is read only to be dropped (a rest-pattern sibling, an unused loop variable).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
  {
    // Tests build fixtures and mocks loosely; `any` stays an error in the library code only.
    files: ['**/*.test.ts', 'lib/__tests__/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
)
