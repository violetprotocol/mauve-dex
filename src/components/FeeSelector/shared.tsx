import { Trans } from '@lingui/macro'
import { FeeAmount } from '@violetprotocol/mauve-v3-sdk'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import type { ReactNode } from 'react'

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: SupportedChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: '0.01',
    description: <Trans>Best for very stable pairs.</Trans>,
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
    description: <Trans>Best for stable pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.LOWER]: {
    label: '0.04',
    description: <Trans>Great for stable pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.MEDIUM]: {
    label: '0.3',
    description: <Trans>Best for most pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.HIGH]: {
    label: '1',
    description: <Trans>Best for exotic pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
}
