import { Currency, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { useMemo } from 'react'
import { isL2ChainId } from 'utils/chains'

import { useAllLists, useCombinedActiveList } from '../state/lists/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { TokenAddressMap, useUnsupportedTokenList } from './../state/lists/hooks'
import { useRestrictedTokens } from './useTokenRestriction'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap): { [address: string]: Token } {
  const { chainId } = useWeb3React()
  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    return Object.keys(tokenMap[chainId] ?? {}).reduce<{ [address: string]: Token }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})
  }, [chainId, tokenMap])
}

export function useAllTokens(): { [address: string]: Token } {
  const allTokens = useCombinedActiveList()
  const tokensFromMap = useTokensFromMap(allTokens)
  const userAddedTokens = useUserAddedTokens()
  return useMemo(() => {
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...tokensFromMap }
        )
    )
  }, [tokensFromMap, userAddedTokens])
}

export function useAllTokensList(): Token[] {
  const allTokens = useAllTokens()
  return useMemo(() => {
    return Object.values(allTokens)
  }, [allTokens])
}

type BridgeInfo = Record<
  SupportedChainId,
  {
    tokenAddress: string
    originBridgeAddress: string
    destBridgeAddress: string
  }
>

export function useUnsupportedTokens(): { [address: string]: Token } {
  const { chainId } = useWeb3React()
  const listsByUrl = useAllLists()
  const unsupportedTokensMap = useUnsupportedTokenList()
  const unsupportedTokens = useTokensFromMap(unsupportedTokensMap)

  // checks the default L2 lists to see if `bridgeInfo` has an L1 address value that is unsupported
  const l2InferredBlockedTokens: typeof unsupportedTokens = useMemo(() => {
    if (!chainId || !isL2ChainId(chainId)) {
      return {}
    }

    if (!listsByUrl) {
      return {}
    }

    const listUrl = getChainInfo(chainId).defaultListUrl

    const { current: list } = listsByUrl[listUrl]
    if (!list) {
      return {}
    }

    const unsupportedSet = new Set(Object.keys(unsupportedTokens))

    return list.tokens.reduce((acc, tokenInfo) => {
      const bridgeInfo = tokenInfo.extensions?.bridgeInfo as unknown as BridgeInfo
      if (
        bridgeInfo &&
        bridgeInfo[SupportedChainId.MAINNET] &&
        bridgeInfo[SupportedChainId.MAINNET].tokenAddress &&
        unsupportedSet.has(bridgeInfo[SupportedChainId.MAINNET].tokenAddress)
      ) {
        const address = bridgeInfo[SupportedChainId.MAINNET].tokenAddress
        // don't rely on decimals--it's possible that a token could be bridged w/ different decimals on the L2
        return { ...acc, [address]: new Token(SupportedChainId.MAINNET, address, tokenInfo.decimals) }
      }
      return acc
    }, {})
  }, [chainId, listsByUrl, unsupportedTokens])

  return { ...unsupportedTokens, ...l2InferredBlockedTokens }
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currency.equals(token))
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(tokenAddress?: string | null): Token | null | undefined {
  const tokens = useAllTokens()
  return useTokenFromMapOrNetwork(tokens, tokenAddress)
}

export function useCurrency(currencyId?: string | null): Currency | null | undefined {
  const tokens = useAllTokens()
  return useCurrencyFromMap(tokens, currencyId)
}

export function useTokensToExclude(): string[] | undefined {
  const tokensWithRestriction = useRestrictedTokens()

  return useMemo(() => {
    return tokensWithRestriction
      .filter((t) => !t.isPermitted)
      .map((t) => (t.currency.isNative ? t.currency.wrapped.address : t.currency.address))
  }, [tokensWithRestriction])
}
