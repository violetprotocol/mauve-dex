import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'
import 'components/analytics'
import '@violetprotocol/sdk/styles.css'

import { ApolloProvider } from '@apollo/client'
import * as Sentry from '@sentry/react'
import { createVioletClient, VioletProvider } from '@violetprotocol/sdk'
import { apolloClient } from 'graphql/data/apollo'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { MulticallUpdater } from 'lib/state/multicall'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { isSentryEnabled } from 'utils/env'
import { baseUrlByEnvironment, redirectUrlByEnvironment } from 'utils/violet/generateEAT'

import Web3Provider from './components/Web3Provider'
import App from './pages/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import LogsUpdater from './state/logs/updater'
import TransactionUpdater from './state/transactions/updater'
import ThemeProvider, { ThemedGlobalStyle } from './theme'

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

if (isSentryEnabled()) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: process.env.REACT_APP_GIT_COMMIT_HASH,
  })
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <LogsUpdater />
    </>
  )
}

const queryClient = new QueryClient()

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

if (!environment) throw new Error('REACT_APP_VIOLET_ENV is not defined')
if (!clientId) throw new Error('REACT_APP_VIOLET_CLIENT_ID is not defined')

const client = createVioletClient({
  clientId,
  apiUrl: baseUrlByEnvironment(environment.toString()),
  redirectUrl: redirectUrlByEnvironment(environment.toString()),
})

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Web3Provider>
            <VioletProvider client={client}>
              <ApolloProvider client={apolloClient}>
                <BlockNumberProvider>
                  <Updaters />
                  <ThemeProvider>
                    <ThemedGlobalStyle />
                    <App />
                  </ThemeProvider>
                </BlockNumberProvider>
              </ApolloProvider>
            </VioletProvider>
          </Web3Provider>
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
