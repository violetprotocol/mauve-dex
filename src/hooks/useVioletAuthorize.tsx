import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize } from '@violetprotocol/sdk'
import { baseUrlByEnvironment, redirectUrlByEnvironment } from 'utils/temporary/generateEAT'

const environment = process.env.REACT_APP_VIOLET_ENV
const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID

export type Call = {
  address: string
  calls: string[]
  value: string
  functionSignature: string
  parameters: string
  deadline?: BigNumber
}

const useVioletAuthorize = ({ call, account, chainId }: { call: Call | null; account?: string; chainId?: number }) => {
  const violetCallback = async () => {
    if (!call || !account || !chainId) {
      return null
    }

    if (!environment || !clientId) {
      throw new Error('Invalid environment')
    }

    const response = await authorize({
      clientId,
      apiUrl: baseUrlByEnvironment(environment.toString()),
      redirectUrl: redirectUrlByEnvironment(environment.toString()),
      transaction: {
        data: call.parameters,
        functionSignature: call.functionSignature,
        targetContract: call.address,
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
          throw new Error('EAT malformed')
        }
      } else {
        console.error(error)

        throw new Error('Failed to parse EAT')
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
        call.calls,
        call?.deadline?.toString()
      )
    }

    if (!calldata) {
      throw new Error('Failed to get callata from EAT')
    }

    return { calldata }
  }

  return {
    violetCallback,
  }
}

export default useVioletAuthorize
