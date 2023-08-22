import { TokenInfo } from '@uniswap/token-lists'

import store from '../state'
import { getMauveActiveList, UNSUPPORTED_LIST_URLS } from './lists'
import brokenTokenList from './tokenLists/broken.tokenlist.json'
import { NATIVE_CHAIN_ID } from './tokens'

export enum TOKEN_LIST_TYPES {
  MAUVE,
  UNKNOWN,
  BLOCKED,
  BROKEN,
}

class TokenSafetyLookupTable {
  dict: { [key: string]: TOKEN_LIST_TYPES } | null = null

  createMap() {
    const dict: { [key: string]: TOKEN_LIST_TYPES } = {}

    // Initialize mauve tokens first
    for (const list of getMauveActiveList()) {
      const tokenList = store.getState().lists.byUrl[list].current?.tokens

      if (tokenList) {
        for (const token of tokenList) {
          dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.MAUVE
        }
      }
    }

    // TODO: Figure out if this list is still relevant
    brokenTokenList.tokens.forEach((token) => {
      dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.BROKEN
    })

    // Initialize blocked tokens from all urls included
    UNSUPPORTED_LIST_URLS.map((url) => store.getState().lists.byUrl[url].current?.tokens)
      .filter((x): x is TokenInfo[] => !!x)
      .flat(1)
      .forEach((token) => {
        dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.BLOCKED
      })
    return dict
  }

  checkToken(address: string) {
    if (!this.dict) {
      this.dict = this.createMap()
    }
    if (address === NATIVE_CHAIN_ID.toLowerCase()) {
      return TOKEN_LIST_TYPES.MAUVE
    }
    return this.dict[address] ?? TOKEN_LIST_TYPES.UNKNOWN
  }
}

export default new TokenSafetyLookupTable()
