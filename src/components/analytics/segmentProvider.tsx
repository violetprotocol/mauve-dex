/* eslint-disable import/no-unused-modules */
import { AnalyticsBrowser } from '@segment/analytics-next'
import React, { useMemo } from 'react'

import { AnalyticsContext, AnalyticsContextProps } from './segmentContext'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const writeKey = process.env.REACT_APP_SEGMENT_WRITE_KEY ?? ''

  const value: AnalyticsContextProps = useMemo(() => ({ analytics: AnalyticsBrowser.load({ writeKey }) }), [writeKey])

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}
