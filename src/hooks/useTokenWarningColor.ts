import { WARNING_LEVEL } from 'constants/tokenSafety'
import { useTheme } from 'styled-components/macro'

export const useTokenWarningTextColor = (level: WARNING_LEVEL) => {
  const theme = useTheme()

  switch (level) {
    case WARNING_LEVEL.MEDIUM:
      return theme.tw.yellow[500]
    case WARNING_LEVEL.UNKNOWN:
      return theme.tw.red[500]
    case WARNING_LEVEL.BLOCKED:
      return theme.tw.navy[300]
  }
}

export const useTokenWarningColor = (level: WARNING_LEVEL) => {
  const theme = useTheme()

  switch (level) {
    case WARNING_LEVEL.MEDIUM:
      return theme.tw.yellow[100]
    case WARNING_LEVEL.UNKNOWN:
      return theme.tw.red[100]
    case WARNING_LEVEL.BLOCKED:
      return theme.tw.neutral[100]
  }
}
