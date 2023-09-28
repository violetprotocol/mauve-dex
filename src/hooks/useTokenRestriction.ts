import { Contract } from '@ethersproject/contracts'
import { Currency, NativeCurrency, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { checkRestriction, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { useEffect, useState } from 'react'

import { useVioletID } from './useVioletID'

export interface CurrencyWithRestriction {
  currency: Currency
  restriction: TOKEN_RESTRICTION_TYPE
  isPermitted: boolean
}

const getTokenRestrictions = async ({
  chainId,
  address,
  violetIdContract,
  tokens,
}: {
  chainId: SupportedChainId
  address: string
  violetIdContract: Contract
  tokens: Currency[]
}) => {
  const promises = (tokens as Currency[]).map(async (token) => {
    if (!token) return

    const isNative = token.isNative
    // Checks if the token has any usage restrictions
    const restriction = checkRestriction(
      chainId,
      isNative ? (token as NativeCurrency).wrapped.address : (token as Token).address
    )

    if (!restriction) return
    // Checks if the provided address has the required status to be permitted to use token
    const isPermitted =
      restriction === TOKEN_RESTRICTION_TYPE.NONE
        ? true
        : <boolean>await violetIdContract?.callStatic.hasStatus(address, restriction)

    return { currency: token, restriction, isPermitted }
  })

  function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined
  }

  const tokensRestriction = (await Promise.all(promises)).filter(notEmpty)

  return tokensRestriction
}

export function useTokenRestriction(address: string | null | undefined, tokens: Currency[]) {
  const { chainId } = useWeb3React()
  const [tokensWithRestriction, setTokensWithRestriction] = useState<CurrencyWithRestriction[]>([])
  const violetIdContract = useVioletID()

  // useMemo(async () => {
  //   if (!chainId || !address || !violetIdContract || !tokens || tokens.length == 0) return

  //   const tokenRestrictions = await getTokenRestrictions({ chainId, address, violetIdContract, tokens})
  //   setTokensWithRestriction(tokenRestrictions)
  // }, [tokens])

  // Doesn't infinite loop
  // useEffect(() => {
  //   console.log(tokens)
  // }, [tokens])

  useEffect(() => {
    if (!chainId || !address || !violetIdContract || !tokens || tokens.length == 0) return
    // console.log(keccak256(Buffer.from(JSON.stringify(tokens))))

    getTokenRestrictions({ chainId, address, violetIdContract, tokens }).then((tokenRestrictions) => {
      // console.log(tokenRestrictions)
      setTokensWithRestriction(tokenRestrictions)
    })
  }, [chainId, address, tokens, violetIdContract])

  return tokensWithRestriction
}
