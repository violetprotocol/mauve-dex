import { SupportedChainId } from './chains'
import TokenRestrictionCache from './TokenRestrictionLookupTable'
import {EURS, OUT2 } from './tokens'

export enum TOKEN_RESTRICTION_TYPE {
  NONE = -1,
  IS_ENROLLED = 1,
  IS_US = 3,
  ACCREDITED_INVESTOR = 5,
}

// TO-DO fetch this from backend assessment instead of maintaining a hardcoded list here
export const TOKEN_RESTRICTIONS: {
  [chainId in SupportedChainId]?: { [tokenAddress: string]: TOKEN_RESTRICTION_TYPE }
} = {
  [SupportedChainId.OPTIMISM_GOERLI]: {
    [OUT2.address]: TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR,
  },
  [SupportedChainId.SEPOLIA]: {
    [EURS.address]: TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR,
  },
  [SupportedChainId.MAINNET]: {

  },
}

if (!process.env.REACT_APP_SUMSUB_ACCREDITED_INVESTOR_FORM_URL) {
  throw new Error('Missing env variable for SumSub accredited investor form URL')
}

export function getRestrictionCopy(restriction: TOKEN_RESTRICTION_TYPE) {
  let heading = null,
    description = null,
    action = null,
    link = null
  switch (restriction) {
    case TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR:
      heading = <>Accredited investor status required.</>
      description = (
        <>You must undergo additional verification for the accredited investor status in order to use this token.</>
      )
      action = <>Fill out accredited investor form</>
      link = process.env.REACT_APP_SUMSUB_ACCREDITED_INVESTOR_FORM_URL
      break
  }
  return { heading, description, action, link }
}

export function checkRestriction(chainId: SupportedChainId, tokenAddress: string) {
  return TokenRestrictionCache.checkTokenRestriction(chainId, tokenAddress.toLowerCase())
}
