// @ts-check
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import importHelpers from 'eslint-plugin-import-helpers'
import unusedImports from 'eslint-plugin-unused-imports'
import perfectionist from 'eslint-plugin-perfectionist'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: typescriptParser
  },
  plugins: {
    '@typescript-eslint': typescriptParser,
    prettier,
    'import-helpers': importHelpers,
    'unused-imports': unusedImports,
    perfectionist,
  },
  rules: {
    'no-useless-constructor': 'off',
    'perfectionist/sort-interfaces': 'error',
    'perfectionist/sort-jsx-props': [
      'error',
      {
        type: 'natural',
        order: 'asc',
        groups: ['multiline', 'unknown', 'shorthand']
      }
    ],
    'prettier/prettier': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'react/react-in-jsx-scope': 'off',
    'space-before-function-paren': 'off',
    'react/prop-types': 'off',
    camelcase: 'off',
    'unused-imports/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
        allowSeparatedGroups: false
      }
    ],
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: [
          ['module', '/^@ant/', '/^@fullstory/'],
          '/^@/',
          ['parent', 'sibling', 'index']
        ],
        alphabetize: { order: 'asc', ignoreCase: true }
      }
    ]
  }
})
