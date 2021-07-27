module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'next',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['eslint-plugin-import', 'eslint-plugin-react', 'eslint-plugin-jsdoc', 'eslint-plugin-prefer-arrow'],
  rules: {
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'jsx-quotes': ['error', 'prefer-double'],
    'react-native/no-inline-styles': 0,
    'space-before-function-paren': 0,
    'react-hooks/exhaustive-deps': 0,
    'no-duplicate-imports': 'off',
    'react/display-name': 0,
    'prettier/prettier': 0,
    camelcase: 0,
    'max-len': [
      1,
      {
        code: 120,
      },
    ],
    'no-use-before-define': 0,
    'default-param-last': 0,
    'multiline-ternary': 0,
    'key-spacing': ['error'],
    'object-curly-spacing': ['error', 'always'],
    'jsx-a11y/alt-text': ['warn'],
    'jsx-a11y/no-noninteractive-element-interactions': ['warn'],
    'jsx-a11y/click-events-have-key-events': ['warn'],
    'import/no-unresolved': ['warn'],
    'jsx-a11y/no-static-element-interactions': ['warn'],
    'jsx-a11y/anchor-is-valid': ['warn'],
    semi: ['error', 'never'],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
  },
}
