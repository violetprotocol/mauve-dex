import { FeeAmount } from '@violetprotocol/mauve-v3-sdk'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import type { ReactNode } from 'react'

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: SupportedChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: '0.01',
    description: <>Best for very stable pairs.</>,
    supportedChains: [
      SupportedChainId.MAINNET,
      SupportedChainId.POLYGON,
      SupportedChainId.POLYGON_MUMBAI,
      SupportedChainId.CELO,
      SupportedChainId.CELO_ALFAJORES,
      SupportedChainId.OPTIMISM,
    ],
  },
  [FeeAmount.LOW]: {
    label: '0.05',
    description: <>Best for stable pairs.</>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.LOWER]: {
    label: '0.04',
    description: <>Great for stable pairs.</>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.MEDIUM]: {
    label: '0.3',
    description: <>Best for most pairs.</>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.HIGH]: {
    label: '1',
    description: <>Best for exotic pairs.</>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
}
