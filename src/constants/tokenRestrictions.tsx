import { SupportedChainId } from './chains'
import TokenRestrictionCache from './TokenRestrictionLookupTable'
import { OUT2 } from './tokens'

export enum TOKEN_RESTRICTION_TYPE {
  NONE = -1,
  IS_ENROLLED = 1,
  ACCREDITED_INVESTOR = 5
}

// TO-DO fetch this from backend assessment instead of maintaining a hardcoded list here
export const TOKEN_RESTRICTIONS: { [chainId in SupportedChainId]?: { [tokenAddress: string]: TOKEN_RESTRICTION_TYPE } } = {
  [SupportedChainId.OPTIMISM_GOERLI]: {
    [OUT2.address]: TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR
  }
}

export function getRestrictionCopy(restriction: TOKEN_RESTRICTION_TYPE) {
  let heading = null,
    description = null,
    action = null,
    link = null
  switch (restriction) {
    case TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR:
      heading = <>{`Accredited investor status required.`}</>
      description = <>You must undergo additional verification for the accredited investor status in order to use this token.</>
      action = <>Fill out accredited investor form</>
      link = "https://in.sumsub.com/idensic/l/#/sbx_uni_qgu29asFjKyJPMAU"
      break
  }
  return { heading, description, action, link}
}

export function checkRestriction(chainId: SupportedChainId, tokenAddress: string) {
  return TokenRestrictionCache.checkTokenRestriction(chainId, tokenAddress.toLowerCase())
}