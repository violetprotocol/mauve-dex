// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
export function swapErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined

  if (error.code) {
    switch (error.code) {
      case 4001:
        return t`Transaction rejected`
    }
  }

  // NOTE: This should've been handled in error.code === 4001 case, but for some reason wasn't
  if (error.reason === 'user rejected transaction') {
    return t`Transaction rejected`
  }

  while (error) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }
  console.log(error)
  console.log(reason)

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)

  switch (reason) {
    case 'user rejected transaction':
      return 'Transaction Rejected.'
    case 'AccessToken: VF':
      return 'The Ethereum Access Token retrieved from Violet was incorrect for this transaction.'
    case 'TransferHelper: TRANSFER_FROM_FAILED':
      return t`The input token cannot be transferred. There may be an issue with the input token.`
    case 'Too little received':
    case 'Too much requested':
    case 'STF':
      return t`This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Mauve.`
    case 'TF':
      return t`The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and rebase tokens are incompatible with Mauve.`
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        return t`An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note: fee on transfer and rebase tokens are incompatible with Mauve.`
      }
      return t`Unknown error${
        reason ? `: "${reason}"` : ''
      }. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Mauve.`
  }
}
