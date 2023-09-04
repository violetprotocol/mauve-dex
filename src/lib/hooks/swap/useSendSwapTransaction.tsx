import { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { SwapEventName } from '@uniswap/analytics-events'
import { Trade } from '@violetprotocol/mauve-router-sdk'
import { Currency, TradeType } from '@violetprotocol/mauve-sdk-core'
import { SwapCall } from 'hooks/useSwapCallArguments'
import { formatSwapSignedAnalyticsEventProperties } from 'lib/utils/analytics'
import { useMemo } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import isZero from 'utils/isZero'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

interface SwapCallEstimate {
  call: SwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall
  error: Error
}

class InvalidSwapError extends Error {}

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction({
  account,
  chainId,
  provider,
  trade,
  swapCall,
  violetCallback,
}: {
  account?: string | null
  chainId?: number
  provider?: JsonRpcProvider
  trade?: Trade<Currency, Currency, TradeType> // trade to execute, required
  swapCall: SwapCall | null
  violetCallback: () => Promise<{ calldata: string } | null>
}): { callback: null | (() => Promise<TransactionResponse>) } {
  return useMemo(() => {
    if (!trade || !provider || !account || !chainId || !violetCallback) {
      return { callback: null }
    }

    if (!swapCall) {
      return { callback: null }
    }

    return {
      callback: async function onSwap(): Promise<TransactionResponse> {
        const violetResponse = await violetCallback()

        if (!violetResponse) {
          throw new Error(t`Unexpected error. Could not get proper response from Violet.`)
        }

        const swapCallEncodedWithEAT = {
          ...swapCall,
          calldata: violetResponse.calldata,
        }

        const { address, value, calldata } = swapCallEncodedWithEAT
        console.log('!!!!!!!!!!!', calldata)

        const tx =
          !value || isZero(value)
            ? { from: account, to: address, data: calldata }
            : {
                from: account,
                to: address,
                data: calldata,
                value,
              }

        const estimatedCall: SwapCallEstimate | SuccessfulCall | FailedCall = await provider
          .estimateGas(tx)
          .then((gasEstimate) => {
            return {
              call: swapCallEncodedWithEAT,
              gasEstimate,
            }
          })
          .catch((gasError) => {
            console.debug('Gas estimate failed, trying eth_call to extract error', swapCallEncodedWithEAT)

            return provider
              .call(tx)
              .then((result) => {
                console.debug(
                  'Unexpected successful call after failed estimate gas',
                  swapCallEncodedWithEAT,
                  gasError,
                  result
                )
                return {
                  call: swapCallEncodedWithEAT,
                  error: <Trans>Unexpected issue with estimating the gas. Please try again.</Trans>,
                }
              })
              .catch((callError) => {
                console.debug('Call threw error', swapCallEncodedWithEAT, callError)
                return {
                  call: swapCallEncodedWithEAT,
                  error: swapErrorToUserReadableMessage(callError),
                }
              })
          })

        if ('error' in estimatedCall) {
          throw new Error(t`Unexpected error. Could not estimate gas for the swap.`)
        }

        return provider
          .getSigner()
          .sendTransaction({
            from: account,
            to: address,
            data: calldata,
            // let the wallet try if we can't estimate the gas
            ...('gasEstimate' in estimatedCall ? { gasLimit: calculateGasMargin(estimatedCall.gasEstimate) } : {}),
            ...(value && !isZero(value) ? { value } : {}),
          })
          .then((response) => {
            sendAnalyticsEvent(
              SwapEventName.SWAP_SIGNED,
              formatSwapSignedAnalyticsEventProperties({
                trade,
                txHash: response.hash,
              })
            )
            if (calldata !== response.data) {
              sendAnalyticsEvent(SwapEventName.SWAP_MODIFIED_IN_WALLET, {
                txHash: response.hash,
              })
              throw new InvalidSwapError(
                t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
              )
            }
            return response
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error(t`Transaction rejected`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, address, calldata, value)

              if (error instanceof InvalidSwapError) {
                throw error
              } else {
                throw new Error(t`Swap failed: ${swapErrorToUserReadableMessage(error)}`)
              }
            }
          })
      },
    }
  }, [account, chainId, provider, swapCall, trade, violetCallback])
}
