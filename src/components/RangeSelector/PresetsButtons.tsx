/* eslint-disable import/no-unused-modules */
import useAnalyticsContext from 'components/analytics/useSegmentAnalyticsContext'
import { ButtonOutlined } from 'components/Button'
import { AutoRow } from 'components/Row'
import React from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { AnalyticsEvent } from 'utils/violet/analyticsEvents'

const Button = styled(ButtonOutlined).attrs(() => ({
  padding: '8px',
  $borderRadius: '8px',
}))`
  color: ${({ theme }) => theme.textPrimary};
  flex: 1;
`

export default function PresetsButtons({ setFullRange }: { setFullRange: () => void }) {
  const { analytics } = useAnalyticsContext()
  return (
    <AutoRow gap="4px" width="auto">
      <Button
        onClick={() => {
          setFullRange()
          analytics.track(AnalyticsEvent.POOL_NEW_POSITION_FULL_RANGE_CLICKED)
        }}
      >
        <ThemedText.DeprecatedBody fontSize={12}>
          <>Full Range</>
        </ThemedText.DeprecatedBody>
      </Button>
    </AutoRow>
  )
}
