import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize } from '@violetprotocol/sdk'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { splitSignature } from 'ethers/lib/utils'
import { SwapCall } from 'hooks/useSwapCallArguments'
import { baseUrlByEnvironment, redirectUrlByEnvironment } from 'utils/temporary/generateEAT'

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

const useSwapVioletAuthorize = ({
  swapCall,
  account,
  chainId,
}: {
  swapCall?: SwapCall
  account?: string
  chainId?: number
}) => {
  const violetCallback = async () => {
    if (!swapCall || !account || !chainId) {
      return
    }

    if (!environment || !clientId) {
      throw new Error('Invalid environment')
    }

    const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

    if (!swapRouterAddress) {
      throw new Error('Swap router address not found')
    }

    const response = await authorize({
      clientId,
      apiUrl: baseUrlByEnvironment(environment.toString()),
      redirectUrl: redirectUrlByEnvironment(environment.toString()),
      transaction: {
        data: swapCall.parameters,
        functionSignature: swapCall.functionSignature,
        targetContract: swapRouterAddress,
      },
      address: account,
      chainId,
    })

    let eat

    if (response) {
      const [violet, error] = response
      if (violet) {
        eat = JSON.parse(atob(violet.token))

        eat.signature = splitSignature(eat.signature)

        if (!eat?.signature || !eat?.expiry) {
          throw new Error('Failed to get EAT')
        }
      } else {
        console.error(error)

        throw new Error('Failed to get EAT')
      }
    } else {
      throw new Error('Failed to get EAT')
    }

    let calldata

    if (eat?.signature) {
      const { v, r, s } = eat.signature

      calldata = EATMulticallExtended.encodePostsignMulticallExtended(
        v,
        r,
        s,
        eat.expiry,
        swapCall.calls,
        swapCall?.deadline?.toString()
      )
    }

    if (!calldata) {
      throw new Error('Failed to get EAT')
    }

    return { calldata }
  }

  return {
    violetCallback,
  }
}

export default useSwapVioletAuthorize
