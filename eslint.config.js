import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Ignore build artifacts, generated files, and dependencies
  {
    ignores: [
      'dist',
      'docs/.docusaurus/**',
      'docs/build/**',
      'node_modules/**',
      'memoryGame/**',
      'public/vendor/**',
    ],
  },
  // Base config for JavaScript files
  js.configs.recommended,
  // TypeScript config for .ts and .tsx files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
  // Config for Docusaurus files (allows require)
  {
    files: ['docs/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Config for ESM JavaScript files (like eslint.config.js, generate-notice.js)
  {
    files: ['*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'warn',
      'no-irregular-whitespace': 'warn',
    },
  },
  // Config for JavaScript files in src (browser context)
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        console: 'readonly',
        fetch: 'readonly',
        semanticAnalysis: 'readonly',
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'warn',
      'no-irregular-whitespace': 'warn',
    },
  },
  // Config for CommonJS/Node.js files
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
    },
  },
)
