import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { AlertTriangle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function FailedNetworkSwitchPopup({ chainId }: { chainId: SupportedChainId }) {
  const chainInfo = getChainInfo(chainId)
  const theme = useTheme()

  return (
    <RowNoFlex>
      <AutoColumn gap="sm">
        <RowNoFlex style={{ alignItems: 'center' }}>
          <div style={{ paddingRight: 13 }}>
            <AlertTriangle color={theme.accentWarning} size={24} display="flex" />
          </div>
          <ThemedText.SubHeader>
            <>Failed to switch networks</>
          </ThemedText.SubHeader>
        </RowNoFlex>

        <ThemedText.BodySmall>
          <>To use Mauve on {chainInfo.label}, switch the network in your wallet’s settings.</>
        </ThemedText.BodySmall>
      </AutoColumn>
    </RowNoFlex>
  )
}
