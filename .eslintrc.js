/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: '@uniswap/eslint-config/react',
  overrides: [
    {
      files: ['src/constants/chains.ts', 'src/constants/locales.ts', 'src/state/routing/utils.ts'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
}
