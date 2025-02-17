import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import parserTs from '@typescript-eslint/parser'


const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules', '.next']
  },
  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '*.js'],
    languageOptions: {
      parser: parserTs,
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/linebreak-style': 'error',
      '@stylistic/eol-last': 'error',
    }
  }
]

export default eslintConfig
