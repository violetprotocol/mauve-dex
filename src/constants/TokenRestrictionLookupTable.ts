import { SupportedChainId } from './chains'
import { TOKEN_RESTRICTIONS, TOKEN_RESTRICTION_TYPE } from './tokenRestrictions'

class TokenRestrictionLookupTable {
  dict: { [chainId: number]: { [key: string]: TOKEN_RESTRICTION_TYPE }  | null }  | null  = null

  createMap() {
    const dict: { [chainId: number]: { [key: string]: TOKEN_RESTRICTION_TYPE }  | null }  | null  = {}

    for (const chain of Object.keys(TOKEN_RESTRICTIONS).map(t => parseInt(t))) {
      const tokens = Object.keys(TOKEN_RESTRICTIONS[chain as SupportedChainId]?? {})
      for (const token of tokens) {
        if (!dict[chain]) dict[chain] = {}
        dict[chain]![token.toLowerCase()] = TOKEN_RESTRICTIONS[chain as SupportedChainId]![token]
      }
    }

    return dict
  }

  checkTokenRestriction(chainId: SupportedChainId, tokenAddress: string): TOKEN_RESTRICTION_TYPE {
    if (!this.dict) {
      this.dict = this.createMap()
    }
    const restrictionsForChain = this.dict[chainId]
    if (restrictionsForChain) return restrictionsForChain[tokenAddress] ?? TOKEN_RESTRICTION_TYPE.NONE
    return TOKEN_RESTRICTION_TYPE.NONE
  }
}

export default new TokenRestrictionLookupTable()
