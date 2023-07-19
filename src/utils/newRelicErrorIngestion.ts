interface NewRelicError {
  error?: Error
  errorString?: string
}

export function logErrorWithNewRelic(newRelicError: NewRelicError): void {
  const environment = process.env.REACT_APP_VIOLET_ENV

  let constructedCustomError
  if (newRelicError.error && newRelicError.errorString) {
    constructedCustomError = new Error(newRelicError.error.message + newRelicError.errorString)
  } else if (!newRelicError.error && newRelicError.errorString) {
    constructedCustomError = new Error(newRelicError.errorString)
  } else if (newRelicError.error && !newRelicError.errorString) {
    constructedCustomError = newRelicError.error
  } else if (!newRelicError.error && !newRelicError.errorString) {
    return
  }
  if (window.newrelic?.noticeError !== undefined && environment != 'local') {
    window.newrelic.noticeError(constructedCustomError)
  }
}
