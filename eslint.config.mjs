// eslint.config.mjs
import eslintPluginNext from 'eslint-plugin-next';
import eslintPluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: eslintPluginReact,
      next: eslintPluginNext,
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Next.js handles this automatically
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-unescaped-entities': 'warn',

      // Next.js rules
      'next/no-html-link-for-pages': 'error',
      'next/no-img-element': 'warn',

      // General
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
