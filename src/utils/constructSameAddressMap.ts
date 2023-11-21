import { SupportedChainId } from '../constants/chains'

const DEFAULT_NETWORKS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
  SupportedChainId.SEPOLIA,
]

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = [],
  override?: Partial<Record<SupportedChainId, string>>
): { [chainId: number]: T } {
  const addressMap = DEFAULT_NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    if (override && chainId in override) {
      memo[chainId] = override[chainId] as T
      return memo
    }
    memo[chainId] = address
    return memo
  }, {})

  return addressMap
}
