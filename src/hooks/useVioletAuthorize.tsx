import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize } from '@violetprotocol/sdk'
import { useCallback } from 'react'
import { logErrorWithNewRelic } from 'utils/newRelicErrorIngestion'
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
        logErrorWithNewRelic({ errorString: 'Violet EAT malformed' })
        return null
      }
    } else {
      console.error(error)
      logErrorWithNewRelic({ errorString: 'Violet EAT not retrieved' })
      // @TODO Add a separate function to handle error codes with custom messages
      // when we handle more than one
      if (error?.code === 'ENROLLMENT_PENDING') {
        throw new Error(`Your business enrollment is pending, we will contact you soon!`)
      }
      return null
    }
  } else {
    console.error('No response from Violet while fetching an EAT')
    logErrorWithNewRelic({ errorString: 'No response from Violet while fetching an EAT' })
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
    logErrorWithNewRelic({ errorString: 'Failed to get calldata from violet EAT' })
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
