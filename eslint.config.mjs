import globals from 'globals'

export default [
  {
    ignores: ['**/dist'],
  },
  {
    languageOptions: {
      globals: { ...globals.node },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'off',

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      semi: ['error', 'never'],
      'eol-last': ['error', 'always'],

      'no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
        },
      ],

      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],

      'no-return-await': 'warn',

      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
    },
  },
]
