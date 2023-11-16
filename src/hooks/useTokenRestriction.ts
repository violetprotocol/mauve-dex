import { Contract } from '@ethersproject/contracts'
import { Currency, NativeCurrency, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { checkRestriction, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { useCallback, useEffect, useState } from 'react'

import { useAllTokensList } from './Tokens'
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
    let isPermitted
    if (restriction === TOKEN_RESTRICTION_TYPE.NONE) {
      isPermitted = true
    } else {
      try {
        // Checks if the provided address has the required status to be permitted to use token
        isPermitted = await violetIdContract?.callStatic.hasStatus(address, restriction)
      } catch (error) {
        throw new Error(`Error getting status from VioletID registry ${violetIdContract.address}: `, error)
      }
    }

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

  const fetchTokenRestrictions = useCallback(async () => {
    if (!chainId || !address || !violetIdContract || tokens.length == 0) return

    const updatedTokenWithRestrictions = await getTokenRestrictions({ chainId, address, violetIdContract, tokens })

    if (JSON.stringify(updatedTokenWithRestrictions) === JSON.stringify(tokensWithRestriction)) return

    setTokensWithRestriction(updatedTokenWithRestrictions)
  }, [chainId, address, violetIdContract, tokens, tokensWithRestriction])

  useEffect(() => {
    fetchTokenRestrictions()
  }, [fetchTokenRestrictions])

  return tokensWithRestriction
}

export function useRestrictedTokens() {
  const tokens = useAllTokensList()
  const { chainId, account } = useWeb3React()
  const [tokensWithRestriction, setTokensWithRestriction] = useState<CurrencyWithRestriction[]>([])
  const violetIdContract = useVioletID()

  const fetchTokenRestrictions = useCallback(async () => {
    if (!chainId || !account || !violetIdContract || tokens.length == 0) return

    const updatedTokenWithRestrictions = await getTokenRestrictions({
      chainId,
      address: account,
      violetIdContract,
      tokens,
    })

    if (JSON.stringify(updatedTokenWithRestrictions) === JSON.stringify(tokensWithRestriction)) return

    setTokensWithRestriction(updatedTokenWithRestrictions)
  }, [chainId, account, violetIdContract, tokens, tokensWithRestriction])

  useEffect(() => {
    fetchTokenRestrictions()
  }, [fetchTokenRestrictions])

  return tokensWithRestriction
}
