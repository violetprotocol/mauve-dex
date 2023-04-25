import { BigNumber } from '@ethersproject/bignumber'
import { EATMulticallExtended, SwapRouter, Trade } from '@violetprotocol/mauve-router-sdk'
import { Currency, Percent, TradeType } from '@violetprotocol/mauve-sdk-core'
import { FeeOptions } from '@violetprotocol/mauve-v3-sdk'
import { useViolet } from '@violetprotocol/sdk'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { splitSignature } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { baseUrlByEnvironment, redirectUrlByEnvironment } from 'utils/temporary/generateEAT'

// import { useArgentWalletContract } from './useArgentWalletContract'
import useENS from './useENS'
import { SignatureData } from './useERC20Permit'

export interface SwapCall {
  address: string
  calldata: string
  value: string
  deadline?: BigNumber
}

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 * @param signatureData the signature data of the permit of the input token amount, if available
 */
export function useSwapCallArguments(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  recipientAddressOrName: string | null | undefined,
  signatureData: SignatureData | null | undefined,
  deadline: BigNumber | undefined,
  feeOptions: FeeOptions | undefined
): SwapCall[] {
  const { account, chainId, provider } = useWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  // const argentWalletContract = useArgentWalletContract()
  if (!environment || !clientId) {
    throw new Error('Invalid environment')
  }
  const { authorize } = useViolet({
    clientId,
    apiUrl: baseUrlByEnvironment(environment.toString()),
    redirectUrl: redirectUrlByEnvironment(environment.toString()),
  })
  const [violetResponse, setVioletResponse] = useState<Awaited<ReturnType<typeof authorize>>>()
  const [functionSignature, setFunctionSignature] = useState<string>()
  const [parameters, setParameters] = useState<string>()
  const [isMakingAuthorization, setIsMakingAuthorization] = useState<boolean>(false)

  useEffect(() => {
    if (violetResponse) return

    if (!account || !parameters || !functionSignature || !chainId) return

    const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

    if (!swapRouterAddress) return
    if (isMakingAuthorization) return

    setIsMakingAuthorization(true)
    authorize({
      transaction: {
        data: parameters,
        functionSignature,
        targetContract: swapRouterAddress,
      },
      address: account,
      chainId,
    }).then((response) => {
      if (response) {
        setVioletResponse(response)
      }
      setIsMakingAuthorization(false)
    })
  }, [account, authorize, chainId, functionSignature, parameters, violetResponse, isMakingAuthorization])

  return useMemo(() => {
    if (!trade || !recipient || !provider || !account || !chainId || !deadline) return []

    const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

    if (!swapRouterAddress) return []

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

    setFunctionSignature(functionSignature)
    setParameters(parameters)

    let eat
    console.log('*********************')
    console.log(violetResponse)
    if (violetResponse) {
      const [violet, error] = violetResponse
      if (violet) {
        eat = JSON.parse(atob(violet.token))
        eat.signature = splitSignature(eat.signature)
        if (!eat?.signature || !eat?.expiry) {
          // throw new Error('Failed to get EAT')
        }
      } else {
        console.log(error)
        // throw new Error('Failed to get EAT')
      }
    } else {
      // throw new Error('Failed to get EAT')
    }
    let calldata
    if (eat?.signature) {
      const { v, r, s } = eat.signature
      calldata = EATMulticallExtended.encodePostsignMulticallExtended(v, r, s, eat.expiry, calls, deadline?.toString())
    }
    if (!calldata) {
      calldata = calls[0]
    }
    return [
      {
        address: swapRouterAddress,
        calldata,
        value,
        deadline,
      },
    ]
  }, [
    account,
    allowedSlippage,
    chainId,
    deadline,
    feeOptions,
    provider,
    recipient,
    signatureData,
    trade,
    violetResponse,
  ])
}
