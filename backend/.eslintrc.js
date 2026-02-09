module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // TypeScript handles these
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Clean code preferences
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    // Keep strict by default; soften only where Express typing is weak
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',

    // Code quality
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', 'src/__tests__/'],
  overrides: [
    {
      files: ['src/common/middlewares/**/*.ts', 'src/modules/**/routes/**/*.ts', 'src/modules/**/*.routes.ts'],
      rules: {
        // Express handlers/middlewares: allow async handlers and safe coercions
        '@typescript-eslint/no-misused-promises': [
          'warn',
          { checksVoidReturn: false, checksConditionals: true },
        ],
        '@typescript-eslint/no-unsafe-assignment': 'warn',
      },
    },
  ],
};
