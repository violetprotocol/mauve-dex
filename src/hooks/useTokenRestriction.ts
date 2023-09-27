import { Currency, NativeCurrency, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { checkRestriction, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { useEffect, useState } from 'react'

import { useVioletID } from './useVioletID'

export interface CurrencyWithRestriction {
  currency: Currency
  restriction: TOKEN_RESTRICTION_TYPE
  isPermitted: boolean
}

export function useTokenRestriction(address: string | null | undefined, tokens: Currency[]) {
  const { chainId } = useWeb3React()
  const [tokensWithRestriction, setTokensWithRestriction] = useState<CurrencyWithRestriction[]>([])
  const violetIdContract = useVioletID()

  useEffect(() => {
    const getTokenRestrictions = async () => {
      if (!chainId || !address || !violetIdContract || !tokens) return

      const promises = (tokens as Currency[]).map(async (token) => {
        const isNative = token.isNative
        const restriction = checkRestriction(
          chainId,
          isNative ? (token as NativeCurrency).wrapped.address : (token as Token).address
        )

        if (!restriction) return
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
      setTokensWithRestriction(tokensRestriction)
    }

    getTokenRestrictions()
  }, [chainId, violetIdContract, address, tokens])

  return tokensWithRestriction
}
