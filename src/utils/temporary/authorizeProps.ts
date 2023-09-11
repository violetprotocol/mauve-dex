import { AuthorizeProps } from '@violetprotocol/sdk'
import { VioletTxAuthorizationPayload } from 'hooks/useVioletAuthorize'

import { baseUrlByEnvironment, redirectUrlByEnvironment } from './generateEAT'

// eslint-disable-next-line import/no-unused-modules
export const getVioletAuthzPayloadFromCall = ({
  call,
  account: address,
  chainId,
}: Required<VioletTxAuthorizationPayload>): AuthorizeProps => {
  if (!call) {
    throw new Error('Missing call parameter to construct Tx Auth payload')
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const environment = process.env.REACT_APP_VIOLET_ENV!

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const clientId = process.env.REACT_APP_VIOLET_CLIENT_ID!

  const { parameters: data, functionSignature, address: targetContract } = call

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
}
