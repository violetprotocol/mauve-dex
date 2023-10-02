import { AnalyticsBrowser } from '@segment/analytics-next'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'

const AnalyticsContext = createContext<{
  analytics: AnalyticsBrowser
} | null>(null)

const AnalyticsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const writeKey = process.env.REACT_APP_SEGMENT_WRITE_KEY ?? ''

  const analytics = useMemo(() => {
    return AnalyticsBrowser.load({ writeKey })
  }, [writeKey])

  return <AnalyticsContext.Provider value={{ analytics }}>{children}</AnalyticsContext.Provider>
}

const useAnalytics = () => {
  const result = useContext(AnalyticsContext)

  if (!result) {
    throw new Error('Context used outside of its Provider!')
  }
  return result
}

export { AnalyticsProvider, useAnalytics }
