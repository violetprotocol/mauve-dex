import { render, renderHook } from '@testing-library/react'
import Web3Provider from 'components/Web3Provider'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import store from 'state'
import ThemeProvider from 'theme'

const queryClient = new QueryClient()

const WithProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Web3Provider>
            <BlockNumberProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </BlockNumberProvider>
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
