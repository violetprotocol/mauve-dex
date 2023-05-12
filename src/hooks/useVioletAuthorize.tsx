import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { EATMulticallExtended } from '@violetprotocol/mauve-router-sdk'
import { authorize } from '@violetprotocol/sdk'
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
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

export enum CallTargetContract {
  NON_FUNGIBLE_POSITION_MANAGER,
  SWAP_ROUTER,
}

const getTargetContractAddress = ({
  targetContract,
  chainId,
}: {
  targetContract: CallTargetContract
  chainId: number
}): string | null => {
  if (!chainId) {
    return null
  }

  if (targetContract == CallTargetContract.NON_FUNGIBLE_POSITION_MANAGER) {
    return NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  } else if (targetContract == CallTargetContract.SWAP_ROUTER) {
    return SWAP_ROUTER_ADDRESSES[chainId]
  } else {
    throw new Error(`Expected targetContract to be a known CallTargetContract but got ${targetContract}`)
  }
}

const useVioletAuthorize = ({
  call,
  account,
  chainId,
  targetContract,
}: {
  call: Call | null
  account?: string
  chainId?: number
  targetContract: CallTargetContract
}) => {
  const violetCallback = async () => {
    if (!call || !account || !chainId) {
      return null
    }

    if (!environment || !clientId) {
      throw new Error('Invalid environment')
    }

    const targetContractAddress = getTargetContractAddress({ targetContract, chainId })

    if (!targetContractAddress) {
      throw new Error('Address of target contract not found')
    }

    const response = await authorize({
      clientId,
      apiUrl: baseUrlByEnvironment(environment.toString()),
      redirectUrl: redirectUrlByEnvironment(environment.toString()),
      transaction: {
        data: call.parameters,
        functionSignature: call.functionSignature,
        targetContract: targetContractAddress,
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
