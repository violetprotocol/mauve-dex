import { useViolet } from '@violetprotocol/sdk'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import styled from 'styled-components/macro'

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

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

const getMauvePositionManagerContractAddressByNetworkId = (chainId: number) => {
  const parsedChainId = chainId.toString()
  switch (parsedChainId) {
    case '1':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '421613':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '42161':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '80001':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '420':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '10':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    case '137':
      return '0x0eae7acE48BCE9ff53333e1A7c4045e7EAb93894'
    default:
      throw new Error('Not supported chainId')
  }
}

export default function VioletTestButton() {
  if (!environment || !clientId) {
    throw new Error('Invalid environment')
  }

  const { chainId, account, connector } = useWeb3React()
  const { authorize } = useViolet({
    clientId,
    apiUrl: baseUrlByEnvironment(environment.toString()),
    redirectUrl: redirectUrlByEnvironment(environment.toString()),
  })

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

  const redirectToVioletAuthentication = async (account: string) => {
    // If on local or development environment, switch to test network (Polygon Mumbai)
    if (environment.toString() === 'local' || environment.toString() === 'development') {
      await switchNetwork()
    }

    if (!chainId) return

    const response = await authorize({
      transaction: {
        data: '0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000',
        functionSignature: '0x50d41df3',
        targetContract: getMauvePositionManagerContractAddressByNetworkId(chainId),
      },
      address: account,
      chainId,
    })

    if (!response) return

    const [violet, error] = response

    console.log(violet, error)
  }

  if (!account || !chainId) {
    return <ResponsiveButtonPrimary disabled={true}>Connect to use Violet</ResponsiveButtonPrimary>
  }

  return (
    <ResponsiveButtonPrimary onClick={() => redirectToVioletAuthentication(account)}>
      Transaction Authorization
    </ResponsiveButtonPrimary>
  )
}
