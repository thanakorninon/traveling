module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Possible errors
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // Best practices
    'eqeqeq': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Variables
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    
    // Stylistic issues
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // ES6
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'template-curly-spacing': 'error'
  },
  globals: {
    // Google Maps API globals
    'google': 'readonly',
    
    // Chart.js globals
    'Chart': 'readonly',
    
    // App globals
    'travelApp': 'writable',
    'searchManager': 'writable'
  }
}; 