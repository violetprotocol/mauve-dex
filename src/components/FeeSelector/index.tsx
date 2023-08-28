import { Trans } from '@lingui/macro'
import { Currency } from '@violetprotocol/mauve-sdk-core'
import { FeeAmount } from '@violetprotocol/mauve-v3-sdk'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { PoolState, usePools } from 'hooks/usePools'
import usePrevious from 'hooks/usePrevious'
import { DynamicSection } from 'pages/AddLiquidity/styled'
import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { FEE_AMOUNT_DETAIL } from './shared'

const pulse = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color};
  }

  70% {
    box-shadow: 0 0 0 2px ${color};
  }

  100% {
    box-shadow: 0 0 0 0 ${color};
  }
`
const FocusedOutlineCard = styled(Card)<{ pulsing: boolean }>`
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  animation: ${({ pulsing, theme }) => pulsing && pulse(theme.accentAction)} 0.6s linear;
  align-self: center;
`

export default function FeeSelector({
  disabled = false,
  feeAmount,
  handleFeePoolSelect,
  currencyA,
  currencyB,
}: {
  disabled?: boolean
  feeAmount?: FeeAmount
  handleFeePoolSelect: (feeAmount: FeeAmount) => void
  currencyA?: Currency | undefined
  currencyB?: Currency | undefined
}) {
  // get pool data on-chain for latest states
  const pools = usePools([
    [currencyA, currencyB, FeeAmount.LOWEST],
    [currencyA, currencyB, FeeAmount.LOW],
    [currencyA, currencyB, FeeAmount.MEDIUM],
    [currencyA, currencyB, FeeAmount.HIGH],
  ])

  const [feeAmountToUse, setFeeAmountToUse] = useState<FeeAmount | null>(null)
  const [pulsing, setPulsing] = useState(false)

  const previousFeeAmount = usePrevious(feeAmount)

  useEffect(() => {
    if (!feeAmount) {
      const initializedPool = pools.find(([state]) => state == PoolState.EXISTS)
      const feeToUse = initializedPool && initializedPool[1]?.fee
      if (feeToUse) {
        setFeeAmountToUse(feeToUse)
      } else {
        console.log('No initialized pool for this pair.')
      }
    }
    return () => {
      setFeeAmountToUse(null)
    }
  }, [feeAmount, currencyA, currencyB, pools])

  useEffect(() => {
    if (feeAmountToUse && feeAmountToUse != previousFeeAmount) {
      handleFeePoolSelect(feeAmountToUse)
    }
  }, [feeAmountToUse, handleFeePoolSelect, previousFeeAmount])

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setPulsing(true)
    }
  }, [previousFeeAmount, feeAmount])

  return (
    <AutoColumn gap="16px">
      <DynamicSection gap="md" disabled={disabled}>
        <FocusedOutlineCard pulsing={pulsing} onAnimationEnd={() => setPulsing(false)}>
          <RowBetween>
            <AutoColumn id="add-liquidity-selected-fee">
              {!feeAmount ? (
                <ThemedText.DeprecatedLabel>
                  <Trans>No pool available for this pair</Trans>
                </ThemedText.DeprecatedLabel>
              ) : (
                <>
                  <ThemedText.DeprecatedLabel className="selected-fee-label">
                    <Trans>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</Trans>
                    <ThemedText.DeprecatedMain fontWeight={400} fontSize="12px" textAlign="left">
                      <Trans>The % you will earn in fees.</Trans>
                    </ThemedText.DeprecatedMain>
                  </ThemedText.DeprecatedLabel>
                </>
              )}
            </AutoColumn>
          </RowBetween>
        </FocusedOutlineCard>
      </DynamicSection>
    </AutoColumn>
  )
}
