import { BigNumber } from '@ethersproject/bignumber'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize, EAT } from '@violetprotocol/sdk'
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

export type VioletTxAuthorizationPayload = {
  call: Call | null
  account?: string
  chainId?: number
}

export const getVioletAuthorizedCall = async ({
  call,
  account,
  chainId,
}: VioletTxAuthorizationPayload): Promise<{ calldata: string; eat: EAT } | null> => {
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

  if (!response) {
    console.error('No response from Violet while fetching an EAT')
    logErrorWithNewRelic({ errorString: 'No response from Violet while fetching an EAT' })
    return null
  }

  const [violet, error] = response

  if (!violet) {
    console.error(error)
    logErrorWithNewRelic({ errorString: `Violet EAT not retrieved, errorCode: ${error?.code}` })
    throw new Error(handleErrorCodes(error?.code))
  }

  const eat = violet.eat

  if (!eat?.signature || !eat?.expiry) {
    console.error('EAT malformed')
    logErrorWithNewRelic({ errorString: 'Violet EAT malformed' })
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

  return { calldata, eat }
}

export const handleErrorCodes = (errorCode?: string) => {
  switch (errorCode) {
    case 'USER_CANCELLED':
      return `
          You must complete the enrollment with Violet before using Mauve.
      `
    case 'FAILED_GEOLOCATION':
      return `
          You have failed geolocation, please turn off your VPN or any software
          that changes your location in case you are in an authorized zone and
          try again.
      `
    case 'ADDRESS_LOCATION_FAILED':
      return `
          The address you provided doesn't match your current location.
      `
    case 'UNKNOWN_WALLET_ADDRESS':
      return `
          Violet did not recognize your wallet address, make sure you are
          connected with the correct wallet and try again.
      `
    case 'ENROLLMENT_PENDING':
      return `
          Your enrollment is pending, please wait from an email from the Violet
          team and try again.
      `
    case 'AUTHENTICATION_FAILED':
      return `
          Authentication has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `
    case 'AUTHENTICATION_FAILED_AFTER_ENROLLMENT':
      return `
          Thank you for your patience, you are now registered with Violet.
          Authentication has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `
    case 'ENROLLMENT_FAILED':
      return `
          Enrollment has failed, please try again. If the issue persists, contact
          the Violet team on our Discord.
      `
    case 'AUTHORIZATION_FAILED':
      return `
          Authorization has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `
    case 'AUTHORIZATION_FAILED_AFTER_ENROLLMENT':
      return `
          Thank you for your patience, you are now registered with Violet.
          Authorization has failed, please try again. If the issue persists,
          contact the Violet team on our Discord.
      `
    case 'USER_ALREADY_EXISTS':
      return `
          Our system detected that you already have an account with Violet. If
          you think this is an error, please contact us.
      `
    case 'UNAUTHORIZED_COUNTRY':
      return `
          Unfortunately we currently do not support US customers, and so we weren't able to create your
          Mauve transaction.
      `
    case 'UNAUTHORIZED_COUNTRY_AFTER_ENROLLMENT':
      return `
          Thank you for your patience, you are now registered with Violet. Unfortunately
          we currently do not support US customers, and so we weren't able to create your
          Mauve transaction.
      `
    case 'COMPLIANCE_FAILED':
      return `
          There was an issue with the application, please contact support at compliance@violet.co
      `
    case 'COMPLIANCE_FAILED_AFTER_ENROLLMENT':
      return `
          Thank you for your patience, you are now registered with Violet.
          There was an issue with the application, please contact support at compliance@violet.co
      `
    case 'SOMETHING_WENT_WRONG':
      return `
          Something went wrong while authorizing your transaction; Please try
          again, and if the issue persists contact the Violet team on our
          Discord.
      `
    default:
      return `
          Something went wrong while authorizing your transaction; Please try
          again, and if the issue persists contact the Violet team on our
          Discord.
      `
  }
}
