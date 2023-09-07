// eslint-disable-next-line no-restricted-imports
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import useENS from 'hooks/useENS'
import { ReactNode, useMemo } from 'react'

import useSendSwapTransaction from './useSendSwapTransaction'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface UseSwapCallbackReturns {
  state: SwapCallbackState
  callback?: () => Promise<TransactionResponse>
  error?: ReactNode
}
interface UseSwapCallbackArgs {
  // trade: Trade<Currency, Currency, TradeType> | undefined // trade to execute, required
  // allowedSlippage: Percent // in bips
  recipientAddressOrName: string | null | undefined // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  // signatureData: SignatureData | null | undefined
  // deadline: BigNumber | undefined
  // feeOptions?: FeeOptions
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback({ recipientAddressOrName }: UseSwapCallbackArgs): UseSwapCallbackReturns {
  const { account, chainId, provider } = useWeb3React()

  const { callback } = useSendSwapTransaction({ account, chainId, provider })

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  return useMemo(() => {
    if (!provider || !account || !chainId || !callback) {
      return { state: SwapCallbackState.INVALID, error: <Trans>Missing dependencies</Trans> }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, error: <Trans>Invalid recipient</Trans> }
      } else {
        return { state: SwapCallbackState.LOADING }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async () => callback(),
    }
  }, [provider, account, chainId, callback, recipient, recipientAddressOrName])
}
