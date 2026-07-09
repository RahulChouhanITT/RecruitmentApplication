module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint', 'prettier'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],

  ignorePatterns: ['node_modules', 'dist', 'build'],

  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },

  overrides: [
    {
      files: ['frontend/**/*.{ts,tsx,js,jsx}'],
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
};
