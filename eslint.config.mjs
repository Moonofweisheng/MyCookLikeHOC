import uni from '@uni-helper/eslint-config'

export default uni(
  {
    unocss: true,
    rules: {
      'no-console': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'antfu/if-newline': 'off',
      'import/consistent-type-specifier-style': 'off',
      'node/prefer-global/process': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'style/eol-last': 'off',
      'unused-imports/no-unused-vars': 'off',
      'yaml/plain-scalar': 'off',
    },
    ignores: [
      '.github/**/*',
      '.trae/**/*',
      'cook-book/**/*.md',
      '**/*.md',
    ],
  },
)
