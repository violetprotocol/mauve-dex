import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, Percent, TradeType } from '@violetprotocol/mauve-sdk-core'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { useState } from 'react'
import { ChevronDown } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import GasEstimateTooltip from './GasEstimateTooltip'
import TradePrice from './TradePrice'

const Wrapper = styled(Row)`
  width: 100%;
  justify-content: center;
  border-radius: inherit;
  padding: 8px 12px;
  margin-top: 0;
  min-height: 32px;
  display: flex;
  flex-direction: column;
`

const SwapDetailsWrapper = styled.div`
  padding-top: ${({ theme }) => theme.grids.md};
  display: flex;
  flex-direction: column;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const StyledPolling = styled.div`
  display: flex;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-left: 10px;
  align-items: center;
  color: ${({ theme }) => theme.textPrimary};
  transition: 250ms ease color;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `}
`

const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.backgroundInteractive};
  transition: 250ms ease background-color;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.textPrimary};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`

interface SwapDetailsInlineProps {
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  syncing: boolean
  loading: boolean
  allowedSlippage: Percent
}

export default function SwapDetailsDropdown({ trade, syncing, loading, allowedSlippage }: SwapDetailsInlineProps) {
  const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Wrapper>
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={SwapEventName.SWAP_DETAILS_EXPANDED}
        element={InterfaceElementName.SWAP_DETAILS_DROPDOWN}
        shouldLogImpression={!showDetails}
      >
        <StyledHeaderRow
          data-testid="swap-details-header-row"
          onClick={() => setShowDetails(!showDetails)}
          disabled={!trade}
          open={showDetails}
        >
          <RowFixed>
            {Boolean(loading || syncing) && (
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
            )}
            {trade ? (
              <LoadingOpacityContainer $loading={syncing} data-testid="trade-price-container">
                <TradePrice price={trade.executionPrice} />
              </LoadingOpacityContainer>
            ) : loading || syncing ? (
              <ThemedText.DeprecatedMain fontSize={14}>
                <>Fetching best price...</>
              </ThemedText.DeprecatedMain>
            ) : null}
          </RowFixed>
          <RowFixed gap="xs">
            {!showDetails && <GasEstimateTooltip trade={trade} loading={syncing || loading} />}
            <RotatingArrow
              stroke={trade ? theme.textTertiary : theme.backgroundSurface}
              open={Boolean(trade && showDetails)}
            />
          </RowFixed>
        </StyledHeaderRow>
      </TraceEvent>
      {trade && (
        <AnimatedDropdown open={showDetails}>
          <SwapDetailsWrapper>
            <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} syncing={syncing} />
          </SwapDetailsWrapper>
        </AnimatedDropdown>
      )}
    </Wrapper>
  )
}
