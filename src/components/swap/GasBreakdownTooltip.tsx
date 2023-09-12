import { Currency, CurrencyAmount, Token, TradeType } from '@violetprotocol/mauve-sdk-core'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { ReactNode } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Container = styled(AutoColumn)`
  padding: 4px;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-width: 0;
  margin: 0;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const GasCostItem = ({
  title,
  amount,
  itemValue,
}: {
  title: ReactNode
  itemValue?: React.ReactNode
  amount?: CurrencyAmount<Token>
}) => {
  return (
    <Row justify="space-between">
      <ThemedText.SubHeaderSmall>{title}</ThemedText.SubHeaderSmall>
      <ThemedText.SubHeaderSmall color="neutral1">{itemValue ?? amount?.toFixed(2)}</ThemedText.SubHeaderSmall>
    </Row>
  )
}

export function GasBreakdownTooltip({
  trade,
  hideFees = false,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hideFees?: boolean
}) {
  const swapEstimate = trade.gasUseEstimateUSD
  return (
    <Container gap="md">
      {!hideFees && (
        <>
          <AutoColumn gap="sm">{swapEstimate && <GasCostItem title={<>Swap</>} amount={swapEstimate} />}</AutoColumn>
          <Divider />
        </>
      )}

      <ThemedText.BodySmall color="neutral2">
        <>Network Fees are paid to the Ethereum network to secure transactions.</>
      </ThemedText.BodySmall>
    </Container>
  )
}
