import { Currency, TradeType } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowFixed } from 'components/Row'
import { MouseoverTooltip, TooltipSize } from 'components/Tooltip'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { ReactComponent as Gas } from '../../assets/images/gas-icon.svg'
import { GasBreakdownTooltip } from './GasBreakdownTooltip'

const StyledGasIcon = styled(Gas)`
  height: 16px;
  width: 16px;
  // We apply the following to all children of the SVG in order to override the default color
  & > * {
    fill: ${({ theme }) => theme.textTertiary};
  }
`

export default function GasEstimateTooltip({
  trade,
  loading,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined | null // dollar amount in active chain's stablecoin
  loading: boolean
}) {
  const { chainId } = useWeb3React()

  if (!trade || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)) {
    return null
  }

  const formattedGasPriceString = trade?.gasUseEstimateUSD
    ? trade.gasUseEstimateUSD.toFixed(2) === '0.00'
      ? '<$0.01'
      : '$' + trade.gasUseEstimateUSD.toFixed(2)
    : undefined

  return (
    <MouseoverTooltip size={TooltipSize.Small} text={<GasBreakdownTooltip trade={trade} />} placement="right">
      <LoadingOpacityContainer $loading={loading}>
        <RowFixed gap="xs">
          <StyledGasIcon />

          <ThemedText.BodySmall color="neutral2">
            <Row gap="xs">
              <div> {formattedGasPriceString ?? null}</div>
            </Row>
          </ThemedText.BodySmall>
        </RowFixed>
      </LoadingOpacityContainer>
    </MouseoverTooltip>
  )
}
