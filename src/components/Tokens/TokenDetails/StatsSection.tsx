import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { MouseoverTooltip } from 'components/Tooltip'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'

import { TokenSortMethod } from '../state'
import { HEADER_DESCRIPTIONS } from '../TokenTable/TokenRow'

export const StatWrapper = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  min-width: 168px;
  flex: 1;
  padding: 24px 0px;
`
const TokenStatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`
export const StatPair = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`

const Header = styled(ThemedText.MediumHeader)`
  font-size: 28px !important;
`

const StatPrice = styled.div`
  margin-top: 4px;
  font-size: 28px;
  color: ${({ theme }) => theme.textPrimary};
`
const NoData = styled.div`
  color: ${({ theme }) => theme.textTertiary};
`
export const StatsWrapper = styled.div`
  gap: 16px;
  ${textFadeIn}
`

type NumericStat = number | undefined | null

function Stat({ value, title, description }: { value: NumericStat; title: ReactNode; description?: ReactNode }) {
  return (
    <StatWrapper>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <StatPrice>{formatNumber(value, NumberType.FiatTokenStats)}</StatPrice>
    </StatWrapper>
  )
}

type StatsSectionProps = {
  priceLow52W?: NumericStat
  priceHigh52W?: NumericStat
  TVL?: NumericStat
  volume24H?: NumericStat
}
export default function StatsSection(props: StatsSectionProps) {
  const { priceLow52W, priceHigh52W, TVL, volume24H } = props
  if (TVL || volume24H || priceLow52W || priceHigh52W) {
    return (
      <StatsWrapper data-testid="token-details-stats">
        <Header>
          <>Stats</>
        </Header>
        <TokenStatsSection>
          <StatPair>
            <Stat value={TVL} description={HEADER_DESCRIPTIONS[TokenSortMethod.TOTAL_VALUE_LOCKED]} title={<>TVL</>} />
            <Stat
              value={volume24H}
              description={
                <>24H volume is the amount of the asset that has been traded on Mauve during the past 24 hours.</>
              }
              title={<>24H volume</>}
            />
          </StatPair>
          <StatPair>
            <Stat value={priceLow52W} title={<>52W low</>} />
            <Stat value={priceHigh52W} title={<>52W high</>} />
          </StatPair>
        </TokenStatsSection>
      </StatsWrapper>
    )
  } else {
    return <NoData>No stats available</NoData>
  }
}
