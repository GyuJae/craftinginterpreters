// eslint.config.js (ESM)
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    files: ['src/**/*.{js,ts}'],
    ignores: [
      '**/node_modules/**',
      '**/.git/**',
      '**/build/**',
      '**/*.lox',
      '**/*.c',
      '**/*.h',
      '**/*.java',
      '**/*.mjs',
      '**/*.md',
      '**/*.json',
      '**/clox/**',
      '**/lox/**',
      '**/test/**',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...eslintPluginUnicorn.configs.recommended.rules,
    },
  },
];
