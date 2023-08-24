import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize, AuthorizeProps, AuthorizeResponse, EAT } from '@violetprotocol/sdk'
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

// eslint-disable-next-line import/no-unused-modules
export type VioletTxAuthorizationPayload = {
  call: Call | null
  account?: string
  chainId?: number
}

// eslint-disable-next-line import/no-unused-modules
export const VioletTxAuthorizationPayload = {
  toAuthorizeProps({ call, account: address, chainId }: Required<VioletTxAuthorizationPayload>): AuthorizeProps {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const environment = process.env.REACT_APP_VIOLET_ENV!

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID!

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { parameters: data, functionSignature, address: targetContract } = call!

    return {
      clientId,
      apiUrl: baseUrlByEnvironment(environment.toString()),
      redirectUrl: redirectUrlByEnvironment(environment.toString()),
      transaction: {
        data,
        functionSignature,
        targetContract,
      },
      address,
      chainId,
    }
  },
}

const generateCalldata = ({ eat, call }: { eat: EAT; call: Call }) => {
  const { v, r, s } = eat.signature

  return EATMulticallExtended.encodePostsignMulticallExtended(
    v,
    r,
    s,
    eat.expiry,
    call.calls,
    call?.deadline?.toString()
  )
}

const parseVioletAuthorizeResponse = ({
  response,
  call,
}: {
  response: AuthorizeResponse | void
  call: Call
}): { calldata: string } | null => {
  let eat

  if (response) {
    const [violet, error] = response
    if (violet) {
      eat = JSON.parse(atob(violet.rawEAT))

      eat.signature = splitSignature(eat.signature)

      if (!eat?.signature || !eat?.expiry) {
        console.error('EAT malformed')
        logErrorWithNewRelic({ errorString: 'Violet EAT malformed' })
        return null
      }
    } else {
      console.error(error)
      logErrorWithNewRelic({
        errorString: `Violet EAT not retrieved, errorCode: ${error?.code}`,
      })
      handleErrorCodes(error?.code)
      return null
    }
  } else {
    console.error('No response from Violet while fetching an EAT')
    logErrorWithNewRelic({
      errorString: 'No response from Violet while fetching an EAT',
    })
    return null
  }

  let calldata

  if (eat?.signature) {
    calldata = generateCalldata({ eat, call })
  }

  if (!calldata) {
    console.error('Failed to get callata from EAT')
    logErrorWithNewRelic({
      errorString: 'Failed to get calldata from violet EAT',
    })
    return null
  }

  return { calldata }
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

  const response = await authorize(VioletTxAuthorizationPayload.toAuthorizeProps({ call, account, chainId }))

  return parseVioletAuthorizeResponse({ response, call })
}

const handleErrorCodes = (errorCode?: string) => {
  switch (errorCode) {
    case 'USER_CANCELLED':
      throw new Error(`
          You must complete the enrollment with Violet before using Mauve.
      `)
    case 'FAILED_GEOLOCATION':
      throw new Error(`
          You have failed geolocation, please turn off your VPN or any software
          that changes your location in case you are in an authorized zone and
          try again.
      `)
    case 'ADDRESS_LOCATION_FAILED':
      throw new Error(`
          The address you provided doesn't match your current location.
      `)
    case 'UNKNOWN_WALLET_ADDRESS':
      throw new Error(`
          Violet did not recognize your wallet address, make sure you are
          connected with the correct wallet and try again.
      `)
    case 'ENROLLMENT_PENDING':
      throw new Error(`
          Your enrollment is pending, please wait from an email from the Violet
          team and try again.
      `)
    case 'AUTHENTICATION_FAILED':
      throw new Error(`
          Authentication has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `)
    case 'AUTHENTICATION_FAILED_AFTER_ENROLLMENT':
      throw new Error(`
          Thank you for your patience, you are now registered with Violet. 
          Authentication has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `)
    case 'ENROLLMENT_FAILED':
      throw new Error(`
          Enrollment has failed, please try again. If the issue persists, contact
          the Violet team on our Discord.
      `)
    case 'AUTHORIZATION_FAILED':
      throw new Error(`
          Authorization has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `)
    case 'AUTHORIZATION_FAILED_AFTER_ENROLLMENT':
      throw new Error(`
          Thank you for your patience, you are now registered with Violet. 
          Authorization has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `)
    case 'USER_ALREADY_EXISTS':
      throw new Error(`
          Our system detected that you already have an account with Violet. If
          you think this is an error, please contact us.
      `)
    case 'UNAUTHORIZED_COUNTRY':
      throw new Error(`
          Thank you for your patience, you are now registered with Violet. Unfortunately
          we currently do not support US customers, and so we weren't able to create your
          mauve transaction.
      `)
    case 'UNAUTHORIZED_COUNTRY_AFTER_ENROLLMENT':
      throw new Error(`
          Unfortunately we currently do not support US customers, and so we weren't able to create your
          mauve transaction.
      `)
    case 'COMPLIANCE_FAILED':
      throw new Error(`
          There was an issue with the application, please contact support at compliance@violet.co
      `)
    case 'COMPLIANCE_FAILED_AFTER_ENROLLMENT':
      throw new Error(`
          Thank you for your patience, you are now registered with Violet. 
          There was an issue with the application, please contact support at compliance@violet.co
      `)
    case 'SOMETHING_WENT_WRONG':
      throw new Error(`
          Something went wrong while authorizing your transaction; Please try
          again, and if the issue persists contact the Violet team on our
          Discord.
      `)
  }
  return
}

export type VioletCallback = () => Promise<{ calldata: string } | null>

const useVioletAuthorize = ({ call, account, chainId }: VioletTxAuthorizationPayload) => {
  const violetCallback = useCallback(async () => {
    return await getVioletAuthorizedCall({ call, account, chainId })
  }, [call, account, chainId])

  return {
    violetCallback,
  }
}

// eslint-disable-next-line import/no-unused-modules
export default useVioletAuthorize
