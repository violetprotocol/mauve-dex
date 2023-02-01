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
      return 'https://staging.k8s.app.violet.co/'
    case 'development':
      return 'https://dev.k8s.app.violet.co/'
    case 'production':
      return 'https://app.violet.co/'
    default:
      throw new Error('Invalid environment')
  }
}

const redirectUrlByEnvironment = (environment: string) => {
  switch (environment) {
    case 'local':
      return 'http://localhost:3000/swap'
    case 'staging':
      return 'https://staging.k8s.mauve.markets/swap'
    case 'development':
      return 'https://dev.k8s.mauve.markets/swap'
    case 'production':
      return 'https://mauve.markets/swap'
    default:
      throw new Error('Invalid environment')
  }
}

const getHumanBoundContractAddressByNetworkId = (chainId: number) => {
  const parsedChainId = chainId.toString()
  switch (parsedChainId) {
    case '1':
      return '0x594e5550ece2c10e5d580e538871914f55884f5d'
    case '421613':
      return '0x8d39fe83ed158f1b7e21a6434e0878d6c11f02b9'
    case '42161':
      return '0x5beb956a9af054956c5c6c0afac7b109236f86aa'
    case '80001':
      return '0x1888649d566908e0a4ac17978740f6a04f600a51'
    case '420':
      return '0x5e5007bdd3eb92575499e17eabdd411b42cf79c0'
    case '10':
      return '0xff439ba52825ffd65e39fd2bf519566d0cd91827'
    case '137':
      return '0x41be3a6c17cf76442d9e7b150de4870027d36f52'
    default:
      throw new Error('Not supported chainId')
  }
}

export default function VioletTestButton() {
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

  const redirectToVioletAuthentication = async (chainId: number, account: string) => {
    console.log(getHumanBoundContractAddressByNetworkId(chainId))
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
    const redirectUrl = redirectUrlByEnvironment(environment.toString())
    const txTargetContract = getHumanBoundContractAddressByNetworkId(chainId)
    const authorizationRedirectUrl = `${baseApiUrl}/api/authz/authorize?account_id=eip155:${chainId}:${account}&dapp_state=null&tx_target_contract=${txTargetContract}&tx_function_signature=0x50d41df3&tx_data=0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000&redirect_uri=${redirectUrl}&client_id=${clientId}`
    window.location.href = authorizationRedirectUrl
  }

  if (!account || !chainId) {
    return <ResponsiveButtonPrimary disabled={true}>Connect to use Violet</ResponsiveButtonPrimary>
  }

  return (
    <ResponsiveButtonPrimary onClick={() => redirectToVioletAuthentication(chainId, account)}>
      Transaction Authorization
    </ResponsiveButtonPrimary>
  )
}
