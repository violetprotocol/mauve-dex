import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import styled from 'styled-components/macro'

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

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

export default function VioletRegisterButton() {
  const { chainId, account, connector } = useWeb3React()

  const switchNetwork = async () => {
    if (!connector.provider) return
    try {
      await connector.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      })
    } catch (switchError) {
      // 4902 error code indicates the chain is missing on the wallet
      if (switchError.code === 4902) {
        try {
          await connector.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13881',
                rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
                chainName: 'Polygon Mumbai',
                nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
                iconUrls: ['https://polygonscan.com/images/brandassets/PolygonScan-logo-circle.jpg'],
              },
            ],
          })
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  const register = async (chainId: number, account: string) => {
    const environment = process.env.REACT_APP_VIOLET_ENV
    const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID
    if (!environment || !clientId) {
      throw new Error('Invalid environment')
    }
    // If on local or development environment, switch to test network (Polygon Mumbai)
    if (environment.toString() == 'local' || environment.toString() == 'development') {
      await switchNetwork()
      chainId = 80001
    }
    const baseApiUrl = baseUrlByEnvironment(environment.toString())
    const authorizationRedirectUrl = `${baseApiUrl}/api/onchain/mint`

    const content = JSON.stringify({ accountId: `eip155:${chainId}:${account}` });
    const contentLength = content.length;
    const headers = new Headers({ 'Content-Type': 'application/json', 'Content-Length': `${contentLength}` })
    fetch(authorizationRedirectUrl, {
      method: 'POST',
      headers,
      body: content,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((e) => alert(e.message))
  }

  if (!account || !chainId) {
    return <ResponsiveButtonPrimary disabled={true}>Connect to use Violet</ResponsiveButtonPrimary>
  }

  return (
    <ResponsiveButtonPrimary onClick={() => register(chainId, account)}>
      Register with Violet
    </ResponsiveButtonPrimary>
  )
}
