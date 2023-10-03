import { Currency } from '@violetprotocol/mauve-sdk-core'
import { FeeAmount } from '@violetprotocol/mauve-v3-sdk'
import { useWeb3React } from '@web3-react/core'
// import { sendEvent } from 'components/analytics'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { useFeeTierDistribution } from 'hooks/useFeeTierDistribution'
import { PoolState, usePools } from 'hooks/usePools'
import usePrevious from 'hooks/usePrevious'
import { DynamicSection } from 'pages/AddLiquidity/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { FeeOption } from './FeeOption'
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

const Select = styled.div`
  align-items: flex-start;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 8px;
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
  const { chainId } = useWeb3React()

  const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(currencyA, currencyB)

  // get pool data on-chain for latest states
  const pools = usePools([
    [currencyA, currencyB, FeeAmount.LOWEST],
    [currencyA, currencyB, FeeAmount.LOWER],
    [currencyA, currencyB, FeeAmount.LOW],
    [currencyA, currencyB, FeeAmount.MEDIUM],
    [currencyA, currencyB, FeeAmount.HIGH],
  ])

  const poolsByFeeTier: Record<FeeAmount, PoolState> = useMemo(
    () =>
      pools.reduce(
        (acc, [curPoolState, curPool]) => {
          acc = {
            ...acc,
            ...{ [curPool?.fee as FeeAmount]: curPoolState },
          }
          return acc
        },
        {
          // default all states to NOT_EXISTS
          [FeeAmount.LOWEST]: PoolState.NOT_EXISTS,
          [FeeAmount.LOWER]: PoolState.NOT_EXISTS,
          [FeeAmount.LOW]: PoolState.NOT_EXISTS,
          [FeeAmount.MEDIUM]: PoolState.NOT_EXISTS,
          [FeeAmount.HIGH]: PoolState.NOT_EXISTS,
        }
      ),
    [pools]
  )

  // onlyInitializedFeeTier is undefined when no fee tiers exist, null when more than 1 fee tier exists
  const [onlyInitializedFeeTier, setOnlyInitializedFeeTier] = useState<FeeAmount | undefined | null>(undefined)
  const [pulsing, setPulsing] = useState(false)

  const previousFeeAmount = usePrevious(feeAmount)

  const handleFeePoolSelectWithEvent = useCallback(
    (fee: FeeAmount) => {
      // sendEvent({
      //   category: 'FeePoolSelect',
      //   action: 'Manual',
      // })
      handleFeePoolSelect(fee)
    },
    [handleFeePoolSelect]
  )

  useEffect(() => {
    const initializedPools = pools.filter(([state]) => state == PoolState.EXISTS)

    // Only one initialized pool for this pair
    if (initializedPools.length == 1) {
      const [, pool] = initializedPools[0]
      setOnlyInitializedFeeTier(pool?.fee)
    } else {
      setOnlyInitializedFeeTier(null)
    }

    return () => {
      setOnlyInitializedFeeTier(undefined)
    }
  }, [pools])

  useEffect(() => {
    if (feeAmount || isLoading || isError) {
      return
    }

    if (onlyInitializedFeeTier) {
      handleFeePoolSelect(onlyInitializedFeeTier)
    }
  }, [feeAmount, isLoading, isError, largestUsageFeeTier, onlyInitializedFeeTier, handleFeePoolSelect])

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setPulsing(true)
      if (poolsByFeeTier[feeAmount] != PoolState.EXISTS) {
        // No pool exists for the the fee tier in the URL so we
        // effectively remove it from the URL
        // @ts-ignore
        handleFeePoolSelect('')
      }
    }
  }, [previousFeeAmount, feeAmount, handleFeePoolSelect, poolsByFeeTier])

  return (
    <AutoColumn gap="16px">
      <DynamicSection gap="md" disabled={disabled}>
        {!feeAmount && onlyInitializedFeeTier === undefined && (
          <FocusedOutlineCard pulsing={pulsing} onAnimationEnd={() => setPulsing(false)}>
            <RowBetween>
              <AutoColumn id="add-liquidity-selected-fee">
                <>
                  <ThemedText.DeprecatedLabel>
                    <>No pools exist for this pair yet</>
                  </ThemedText.DeprecatedLabel>
                </>
              </AutoColumn>
            </RowBetween>
          </FocusedOutlineCard>
        )}

        {chainId && (
          <Select>
            {[FeeAmount.LOWEST, FeeAmount.LOWER, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map(
              (_feeAmount, i) => {
                const { supportedChains } = FEE_AMOUNT_DETAIL[_feeAmount]
                if (supportedChains.includes(chainId) && poolsByFeeTier[_feeAmount] == PoolState.EXISTS) {
                  return (
                    <FeeOption
                      feeAmount={_feeAmount}
                      active={feeAmount === _feeAmount}
                      onClick={() => handleFeePoolSelectWithEvent(_feeAmount)}
                      distributions={distributions}
                      poolState={poolsByFeeTier[_feeAmount]}
                      key={i}
                    />
                  )
                }
                return <></>
              }
            )}
          </Select>
        )}
      </DynamicSection>
    </AutoColumn>
  )
}
