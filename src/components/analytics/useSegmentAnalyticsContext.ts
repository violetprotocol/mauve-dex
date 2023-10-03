import { useContext } from 'react'

import { AnalyticsContext } from './segmentContext'

const useAnalyticsContext = () => useContext(AnalyticsContext)

export default useAnalyticsContext
