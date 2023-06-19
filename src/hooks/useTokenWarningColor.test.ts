import { WARNING_LEVEL } from 'constants/tokenSafety'
import { renderHook } from 'test-utils'
import { lightTheme, tw } from 'theme/colors'

import { useTokenWarningColor, useTokenWarningTextColor } from './useTokenWarningColor'

describe('Token Warning Colors', () => {
  describe('useTokenWarningColor', () => {
    it('medium', () => {
      const { result } = renderHook(() => useTokenWarningColor(WARNING_LEVEL.MEDIUM))
      expect(result.current).toEqual(tw.yellow[100])
    })

    it('strong', () => {
      const { result } = renderHook(() => useTokenWarningColor(WARNING_LEVEL.UNKNOWN))
      expect(result.current).toEqual(lightTheme.accentFailureSoft)
    })

    it('blocked', () => {
      const { result } = renderHook(() => useTokenWarningColor(WARNING_LEVEL.BLOCKED))
      expect(result.current).toEqual(tw.neutral[100])
    })
  })

  describe('useTokenWarningTextColor', () => {
    it('medium', () => {
      const { result } = renderHook(() => useTokenWarningTextColor(WARNING_LEVEL.MEDIUM))
      expect(result.current).toEqual(tw.yellow[500])
    })

    it('strong', () => {
      const { result } = renderHook(() => useTokenWarningTextColor(WARNING_LEVEL.UNKNOWN))
      expect(result.current).toEqual(lightTheme.accentFailure)
    })

    it('blocked', () => {
      const { result } = renderHook(() => useTokenWarningTextColor(WARNING_LEVEL.BLOCKED))
      expect(result.current).toEqual(lightTheme.textSecondary)
    })
  })
})
