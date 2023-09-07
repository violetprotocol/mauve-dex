import { Trade } from '@violetprotocol/mauve-router-sdk'
import { Currency, Percent, TradeType } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SwapCallbackState, useSwapCallback as useLibSwapCallBack } from 'lib/hooks/swap/useSwapCallback'
import { ReactNode, useEffect, useMemo } from 'react'

import { useTransactionAdder } from '../state/transactions/hooks'
import { TransactionType } from '../state/transactions/types'
import { currencyId } from '../utils/currencyId'
import useENS from './useENS'
import { SignatureData } from './useERC20Permit'
import { useSwapCallArguments } from './useSwapCallArguments'
import useTransactionDeadline from './useTransactionDeadline'
import { Call } from './useVioletAuthorize'
import { useVioletEAT } from './useVioletSwapEAT'

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: Percent, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  signatureData: SignatureData | undefined | null
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: ReactNode | null } {
  const { setTxData, trade: storedTrade } = useVioletEAT()

  const { account } = useWeb3React()

  const deadline = useTransactionDeadline()

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const {
    state,
    callback: libCallback,
    error,
  } = useLibSwapCallBack({
    recipientAddressOrName: recipient,
  })

  const swapCall: Call | null = useSwapCallArguments({
    trade,
    allowedSlippage,
    recipientAddressOrName,
    signatureData,
    deadline,
  })

  useEffect(() => {
    if (swapCall) {
      setTxData(swapCall, trade)
    }
  }, [swapCall, setTxData, trade])
  const swapCallback = libCallback

  const callback = useMemo(() => {
    if (!storedTrade || !swapCallback) return null
    return () =>
      swapCallback().then((response) => {
        addTransaction(
          response,
          storedTrade.tradeType === TradeType.EXACT_INPUT
            ? {
                type: TransactionType.SWAP,
                tradeType: TradeType.EXACT_INPUT,
                inputCurrencyId: currencyId(storedTrade.inputAmount.currency),
                inputCurrencyAmountRaw: storedTrade.inputAmount.quotient.toString(),
                expectedOutputCurrencyAmountRaw: storedTrade.outputAmount.quotient.toString(),
                outputCurrencyId: currencyId(storedTrade.outputAmount.currency),
                minimumOutputCurrencyAmountRaw: storedTrade.minimumAmountOut(allowedSlippage).quotient.toString(),
              }
            : {
                type: TransactionType.SWAP,
                tradeType: TradeType.EXACT_OUTPUT,
                inputCurrencyId: currencyId(storedTrade.inputAmount.currency),
                maximumInputCurrencyAmountRaw: storedTrade.maximumAmountIn(allowedSlippage).quotient.toString(),
                outputCurrencyId: currencyId(storedTrade.outputAmount.currency),
                outputCurrencyAmountRaw: storedTrade.outputAmount.quotient.toString(),
                expectedInputCurrencyAmountRaw: storedTrade.inputAmount.quotient.toString(),
              }
        )
        return response.hash
      })
  }, [addTransaction, allowedSlippage, swapCallback, storedTrade])

  return {
    state,
    callback,
    error,
  }
}
