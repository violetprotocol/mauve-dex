import type { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { SwapEventName } from '@uniswap/analytics-events'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { useVioletEAT } from 'hooks/useVioletSwapEAT'
import { formatSwapSignedAnalyticsEventProperties } from 'lib/utils/analytics'
import { useMemo } from 'react'
import isZero from 'utils/isZero'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

class InvalidSwapError extends Error {}

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction({
  account,
  chainId,
  provider,
}: {
  account?: string | null
  chainId?: number
  provider?: JsonRpcProvider
}): { callback: null | (() => Promise<TransactionResponse>) } {
  const { eatPayload, call, trade } = useVioletEAT()
  return useMemo(() => {
    if (!trade || !provider || !account || !chainId) {
      return { callback: null }
    }

    return {
      callback: async function onSwap(): Promise<TransactionResponse> {
        if (eatPayload?.status === 'failed') {
          throw new Error(eatPayload.data.message)
        }
        if (!eatPayload || !call || eatPayload.status !== 'issued') {
          throw new Error(`Unexpected error. Please close this window and try again.`)
        }
        const { signature, expiry } = eatPayload.data

        const { v, r, s } = signature

        const calldata = EATMulticallExtended.encodePostsignMulticallExtended(
          v,
          r,
          s,
          expiry,
          call.calls,
          call?.deadline?.toString()
        )

        const swapCallEncodedWithEAT = {
          ...call,
          calldata,
        }
        const { address, value } = swapCallEncodedWithEAT

        const tx =
          !value || isZero(value)
            ? { from: account, to: address, data: calldata }
            : {
                from: account,
                to: address,
                data: calldata,
                value,
              }

        return provider
          .estimateGas(tx)
          .then((gasLimit) => {
            return provider.getSigner().sendTransaction({
              from: account,
              to: address,
              data: calldata,
              // let the wallet try if we can't estimate the gas
              gasLimit,
              ...(value && !isZero(value) ? { value } : {}),
            })
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
                `Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
              )
            }
            return response
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error(`Transaction rejected`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, address, calldata, value)

              if (error instanceof InvalidSwapError) {
                throw error
              } else {
                throw new Error(`${swapErrorToUserReadableMessage(error)}`)
              }
            }
          })
      },
    }
  }, [account, chainId, provider, trade, call, eatPayload])
}
