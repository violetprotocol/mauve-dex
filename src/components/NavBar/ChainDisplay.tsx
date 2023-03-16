import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chainInfo'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { TokenWarningRedIcon } from 'nft/components/icons'
import { subhead } from 'nft/css/common.css'
import { themeVars } from 'nft/css/sprinkles.css'

export const ChainDisplay = () => {
  const { chainId } = useWeb3React()

  const info = chainId ? getChainInfo(chainId) : undefined

  useSyncChainQuery()

  if (!chainId) {
    return null
  }

  const isSupported = !!info

  return (
    <Box position="relative">
      <Row gap="8" data-testid="chain-display">
        {!isSupported ? (
          <>
            <TokenWarningRedIcon fill={themeVars.colors.textSecondary} width={24} height={24} />
            <Box as="span" className={subhead} display={{ sm: 'none', xxl: 'flex' }} style={{ lineHeight: '20px' }}>
              Unsupported
            </Box>
          </>
        ) : (
          <>
            <img src={info.logoUrl} alt={info.label} width={20} height={20} />
            <Box as="span" className={subhead} display={{ sm: 'none', xxl: 'flex' }} style={{ lineHeight: '20px' }}>
              {info.label}
            </Box>
          </>
        )}
      </Row>
    </Box>
  )
}
