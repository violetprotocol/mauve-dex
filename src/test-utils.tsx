import { render, renderHook } from '@testing-library/react'
import { createVioletClient, VioletProvider } from '@violetprotocol/sdk'
import { AnalyticsProvider } from 'components/analytics'
import Web3Provider from 'components/Web3Provider'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import store from 'state'
import ThemeProvider from 'theme'
import { baseUrlByEnvironment, redirectUrlByEnvironment } from 'utils/violet/generateEAT'

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

const WithProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Web3Provider>
            <VioletProvider client={client}>
              <AnalyticsProvider>
                <BlockNumberProvider>
                  <ThemeProvider>{children}</ThemeProvider>
                </BlockNumberProvider>
              </AnalyticsProvider>
            </VioletProvider>
          </Web3Provider>
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  )
}

const customRender = (ui: ReactElement) => render(ui, { wrapper: WithProviders })
const customRenderHook = <Result, Props>(hook: (initialProps: Props) => Result) =>
  renderHook(hook, { wrapper: WithProviders })

export * from '@testing-library/react'
export { customRender as render }
export { customRenderHook as renderHook }
