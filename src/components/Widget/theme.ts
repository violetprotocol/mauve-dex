import { lightTheme } from 'theme/colors'

const fonts = {
  fontFamily: 'Inter custom',
}

export const LIGHT_THEME = {
  // surface
  container: lightTheme.backgroundSurface,
  interactive: lightTheme.backgroundInteractive,
  module: lightTheme.backgroundModule,
  accent: lightTheme.accentAction,
  dialog: lightTheme.backgroundBackdrop,
  outline: lightTheme.backgroundOutline,
  // text
  primary: lightTheme.textPrimary,
  secondary: lightTheme.textSecondary,
  onInteractive: lightTheme.accentTextDarkPrimary,
  // state
  success: lightTheme.accentSuccess,
  warning: lightTheme.accentWarning,
  error: lightTheme.accentCritical,

  ...fonts,
}
