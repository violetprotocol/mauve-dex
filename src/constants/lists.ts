import { isDevelopmentEnv, isProductionEnv, isStagingEnv } from 'utils/env'

const MAUVE_TESTNETS_LIST_URL =
  'https://raw.githubusercontent.com/violetprotocol/mauve-token-list/main/mauve.tokenlist.testnets.json'
const MAUVE_MAINNETS_LIST_URL =
  'https://raw.githubusercontent.com/violetprotocol/mauve-token-list/main/mauve.tokenlist.mainnets.json'
const AAVE_LIST = 'tokenlist.aave.eth'
const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'
const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const KLEROS_LIST = 't2crtokens.eth'
const ROLL_LIST = 'https://app.tryroll.com/tokens.json'
const WRAPPED_LIST = 'wrapped.tokensoft.eth'

export const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
export const ARBITRUM_LIST = 'https://bridge.arbitrum.io/token-list-42161.json'
export const CELO_LIST = 'https://celo-org.github.io/celo-token-list/celo.tokenlist.json'

export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST /* , UNI_UNSUPPORTED_LIST */]

// default lists to be 'active' aka searched across
export const getMauveActiveList = () => {
  if (isDevelopmentEnv()) return [MAUVE_TESTNETS_LIST_URL]
  if (isStagingEnv()) return [MAUVE_MAINNETS_LIST_URL, MAUVE_TESTNETS_LIST_URL]
  if (isProductionEnv()) return [MAUVE_MAINNETS_LIST_URL]
  return [MAUVE_TESTNETS_LIST_URL]
}
const DEFAULT_INACTIVE_LIST_URLS: string[] = [
  // UNI_EXTENDED_LIST,
  COMPOUND_LIST,
  AAVE_LIST,
  KLEROS_LIST,
  WRAPPED_LIST,
  ROLL_LIST,
  ARBITRUM_LIST,
  OPTIMISM_LIST,
  CELO_LIST,
  ...UNSUPPORTED_LIST_URLS,
]

export const DEFAULT_LIST_OF_LISTS: string[] = [...getMauveActiveList(), ...DEFAULT_INACTIVE_LIST_URLS]
