import { FeeAmount } from '@violetprotocol/mauve-v3-sdk'
import { ButtonRadioChecked } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { useFeeTierDistribution } from 'hooks/useFeeTierDistribution'
import { PoolState } from 'hooks/usePools'
import React from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { FEE_AMOUNT_DETAIL } from './shared'

const ResponsiveText = styled(ThemedText.DeprecatedLabel)`
  line-height: 16px;
  font-size: 14px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 12px;
    line-height: 12px;
  `};
`

interface FeeOptionProps {
  feeAmount: FeeAmount
  active: boolean
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions']
  poolState: PoolState
  onClick: () => void
}

export function FeeOption({ feeAmount, active, onClick }: FeeOptionProps) {
  return (
    <ButtonRadioChecked active={active} onClick={onClick}>
      <AutoColumn gap="sm" justify="flex-start">
        <AutoColumn justify="flex-start" gap="6px">
          <ResponsiveText>
            <>{FEE_AMOUNT_DETAIL[feeAmount].label}%</>
          </ResponsiveText>
          <ThemedText.DeprecatedMain fontWeight={400} fontSize="12px" textAlign="left">
            {FEE_AMOUNT_DETAIL[feeAmount].description}
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      </AutoColumn>
    </ButtonRadioChecked>
  )
}
