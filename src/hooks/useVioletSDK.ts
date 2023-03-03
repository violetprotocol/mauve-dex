import { useViolet } from '@violetprotocol/sdk'

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

const baseUrlByEnvironment = (environment: string) => {
  switch (environment) {
    case 'local':
      return 'http://localhost:8080'
    case 'staging':
      return 'https://staging.k8s.app.violet.co'
    case 'development':
      return 'https://dev.k8s.app.violet.co'
    case 'production':
      return 'https://app.violet.co'
    default:
      throw new Error('Invalid environment')
  }
}

const redirectUrlByEnvironment = (environment: string) => {
  switch (environment) {
    case 'local':
      return 'http://localhost:3000/#/callback'
    case 'staging':
      return 'https://staging.k8s.app.mauve.org/#/callback'
    case 'development':
      return 'https://dev.k8s.app.mauve.org/#/callback'
    case 'production':
      return 'https://app.mauve.org/#/callback'
    default:
      throw new Error('Invalid environment')
  }
}

export const useVioletSDK = () => {
  if (!environment || !clientId) {
    throw new Error('Cannot instantiat Violet SDK: Missing environment or clientId')
  }
  const { authorize } = useViolet({
    clientId,
    apiUrl: baseUrlByEnvironment(environment.toString()),
    redirectUrl: redirectUrlByEnvironment(environment.toString()),
  })

  return { authorize }
}
