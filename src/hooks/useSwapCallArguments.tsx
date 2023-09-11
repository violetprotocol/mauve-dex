import { BigNumber } from '@ethersproject/bignumber'
import { SwapRouter, Trade } from '@violetprotocol/mauve-router-sdk'
import { Currency, Percent, TradeType } from '@violetprotocol/mauve-sdk-core'
import { FeeOptions } from '@violetprotocol/mauve-v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'

import useENS from './useENS'
import { SignatureData } from './useERC20Permit'

interface SwapCall {
  address: string
  calls: string[]
  value: string
  deadline?: BigNumber
  functionSignature: string
  parameters: string
}

interface SwapCallArgumentsInputs {
  trade?: Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  recipientAddressOrName?: string | null
  signatureData?: SignatureData | null
  deadline?: BigNumber
  feeOptions?: FeeOptions
}

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 * @param signatureData the signature data of the permit of the input token amount, if available
 * @param deadline the deadline of the swap, if available
 * @param feeOptions the fee options of the swap, if available
 */
export function useSwapCallArguments({
  trade,
  allowedSlippage,
  recipientAddressOrName,
  signatureData,
  deadline,
  feeOptions,
}: SwapCallArgumentsInputs): SwapCall | null {
  const { account, chainId, provider } = useWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)

  const recipient = recipientAddressOrName === null ? account : recipientAddress

  if (!environment || !clientId) {
    throw new Error('Invalid environment')
  }

  return useMemo(() => {
    if (!trade || !recipient || !provider || !account || !chainId || !deadline) {
      return null
    }

    const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

    if (!swapRouterAddress) {
      return null
    }

    const { value, calls, functionSignature, parameters } = SwapRouter.swapCallParameters(trade, {
      fee: feeOptions,
      recipient,
      slippageTolerance: allowedSlippage,
      ...(signatureData
        ? {
            inputTokenPermit:
              'allowed' in signatureData
                ? {
                    expiry: signatureData.deadline,
                    nonce: signatureData.nonce,
                    s: signatureData.s,
                    r: signatureData.r,
                    v: signatureData.v as any,
                  }
                : {
                    deadline: signatureData.deadline,
                    amount: signatureData.amount,
                    s: signatureData.s,
                    r: signatureData.r,
                    v: signatureData.v as any,
                  },
          }
        : {}),

      deadlineOrPreviousBlockhash: deadline.toString(),
    })

    return {
      address: swapRouterAddress,
      calls,
      value,
      deadline,
      functionSignature,
      parameters,
    }
  }, [account, allowedSlippage, chainId, deadline, feeOptions, provider, recipient, signatureData, trade])
}
