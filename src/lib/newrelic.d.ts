export interface newRelicProvider {
  noticeError?: (...args: any[]) => void
}

declare global {
  interface Window {
    newrelic?: newRelicProvider
  }
}
