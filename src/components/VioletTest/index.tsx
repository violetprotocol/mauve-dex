import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { useVioletSDK } from 'hooks/useVioletSDK'
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
  if (!environment || !clientId) {
    throw new Error('Invalid environment')
  }

  const { chainId, account, connector } = useWeb3React()
  const { authorize } = useVioletSDK()

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

  const triggerTransactionAuthorization = async (account: string) => {
    // If on local or development environment, switch to test network (Polygon Mumbai)
    if (environment.toString() === 'local' || environment.toString() === 'development') {
      await switchNetwork()
    }

    if (!chainId) return

    const response = await authorize({
      transaction: {
        data: '0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000',
        functionSignature: '0x50d41df3',
        targetContract: getHumanBoundContractAddressByNetworkId(chainId),
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
    <ResponsiveButtonPrimary onClick={() => triggerTransactionAuthorization(account)}>
      Transaction Authorization
    </ResponsiveButtonPrimary>
  )
}
