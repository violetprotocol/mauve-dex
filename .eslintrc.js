/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: '@uniswap/eslint-config/react',
  overrides: [
    {
      files: [
        'src/constants/chains.ts',
        'src/constants/locales.ts',
        'src/state/routing/utils.ts',
        'src/utils/violet/authorizeProps.ts',
        'src/utils/unwrappedToken.ts',
        'src/utils/prices.ts',
        'src/components/AccountDetails/Transaction.tsx',
        'src/components/AccountDetails/TransactionSummary.tsx',
        'src/components/AccountDetails/index.tsx',
        'src/components/AccountDetailsV2/LogoView.tsx',
        'src/components/AccountDetailsV2/TransactionBody.tsx',
      ],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
}
