import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize } from '@violetprotocol/sdk'
import { useCallback } from 'react'
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

type VioletTxAuthorizationPayload = {
  call: Call | null
  account?: string
  chainId?: number
}

export const getVioletAuthorizedCall = async ({
  call,
  account,
  chainId,
}: VioletTxAuthorizationPayload): Promise<{ calldata: string } | null> => {
  if (!call || !account || !chainId) {
    return null
  }

  if (!environment || !clientId) {
    console.error('Invalid environment')
    return null
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
        console.error('EAT malformed')
        if (window.newrelic?.noticeError !== undefined && environment != 'local') {
          const error = new Error('Violet EAT malformed')
          window.newrelic.noticeError(error)
        }
        return null
      }
    } else {
      console.error(error)
      if (window.newrelic?.noticeError !== undefined && environment != 'local') {
        const error = new Error('Violet EAT not retrieved')
        window.newrelic.noticeError(error)
      }
      return null
    }
  } else {
    console.error('No response from Violet while fetching an EAT')
    if (window.newrelic?.noticeError !== undefined && environment != 'local') {
      const error = new Error('No response from Violet while fetching an EAT')
      window.newrelic.noticeError(error)
    }
    return null
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
    console.error('Failed to get callata from EAT')
    if (window.newrelic?.noticeError !== undefined && environment != 'local') {
      const error = new Error('Failed to get callata from violet EAT')
      window.newrelic.noticeError(error)
    }
    return null
  }

  return { calldata }
}

const useVioletAuthorize = ({ call, account, chainId }: VioletTxAuthorizationPayload) => {
  const violetCallback = useCallback(async () => {
    return await getVioletAuthorizedCall({ call, account, chainId })
  }, [call, account, chainId])

  return {
    violetCallback,
  }
}

export default useVioletAuthorize
