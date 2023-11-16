/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: ['@uniswap/eslint-config/react'],
  rules: {
    'prettier/prettier': 'off',
  },
  overrides: [
    {
      files: [
        'src/constants/chains.ts',
        'src/constants/locales.ts',
        'src/state/routing/utils.ts',
        'src/utils/violet/authorizeProps.ts',
        'src/utils/unwrappedToken.ts',
        'src/utils/prices.ts',
      ],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
}
