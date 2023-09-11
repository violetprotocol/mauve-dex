export function isDevelopmentEnv(): boolean {
  return process.env.REACT_APP_VIOLET_ENV === 'development' || process.env.REACT_APP_VIOLET_ENV === 'local'
}

export function isTestEnv(): boolean {
  return process.env.REACT_APP_VIOLET_ENV === 'test'
}

export function isStagingEnv(): boolean {
  return process.env.REACT_APP_VIOLET_ENV === 'staging'
}

export function isProductionEnv(): boolean {
  return process.env.REACT_APP_VIOLET_ENV === 'production'
}

export function isSentryEnabled(): boolean {
  return process.env.REACT_APP_SENTRY_ENABLED === 'true'
}
