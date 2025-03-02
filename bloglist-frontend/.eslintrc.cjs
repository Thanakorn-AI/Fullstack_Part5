module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    "vitest-globals/env": true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:vitest-globals/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    "indent": ["error", 2], // 2-space indentation
    "linebreak-style": ["error", "unix"], // Unix line endings (LF)
    "quotes": ["error", "single"], // Single quotes for strings
    "semi": ["error", "never"], // No semicolons
    "eqeqeq": ["error", "always"], // Always use ===/!==
    "no-trailing-spaces": "error", // No trailing spaces
    "object-curly-spacing": ["error", "always"], // Spaces in object literals
    "arrow-spacing": ["error", { "before": true, "after": true }], // Spaces around arrows
    "no-console": 0, // Allow console.log (optional, set to "warn" or "error" if preferred)
    "react/react-in-jsx-scope": "off", // Not needed for React 17+
    "react/prop-types": "error", // Enforce PropTypes (catch missing props)
    "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }], // Warn on unused vars
  },
};