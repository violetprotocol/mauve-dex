import { SupportedChainId } from 'constants/chains'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import CeloLogo from '../../assets/svg/celo_logo.svg'
import MaticLogo from '../../assets/svg/matic-token-icon.svg'

type Network = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'

export function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    case SupportedChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case SupportedChainId.OPTIMISM:
      return 'optimism'
    case SupportedChainId.OPTIMISM_GOERLI:
      return 'optimism'
    case SupportedChainId.POLYGON:
      return 'polygon'
    default:
      return 'ethereum'
  }
}

export function getNativeLogoURI(chainId: SupportedChainId = SupportedChainId.MAINNET): string {
  switch (chainId) {
    case SupportedChainId.POLYGON:
    case SupportedChainId.POLYGON_MUMBAI:
      return MaticLogo
    case SupportedChainId.CELO:
    case SupportedChainId.CELO_ALFAJORES:
      return CeloLogo
    default:
      return EthereumLogo
  }
}
