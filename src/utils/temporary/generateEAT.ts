import { BigNumber } from '@ethersproject/bignumber'
import { Signature, splitSignature } from '@ethersproject/bytes'
import { Wallet } from '@ethersproject/wallet'
import { messages, utils } from '@violetprotocol/ethereum-access-token-helpers'
import { Interface } from 'ethers/lib/utils'

// TODO: Move this to shared types
type EAT = { signature: Signature; expiry: BigNumber }

type GetEATForMulticallArgs = {
  callerAddress: string
  contractAddress: string
  contractInterface: Interface
  chainId: number
  withDeadline: boolean
  parameters: any[]
}

// Change me
const VERIFIER_CONTRACT_ADDRESS = '0x5Dbe2B4648FFAF2867F8Ad07d42003F5ce4b7d2C'
const EXPIRY = BigNumber.from(4833857428)

const pk = process.env.REACT_APP_VIOLET_TEST_PRIVATE_KEY || ''
const signer = new Wallet(pk)

const getDomain = (chainId: number) => ({
  name: 'Ethereum Access Token',
  version: '1',
  chainId,
  verifyingContract: VERIFIER_CONTRACT_ADDRESS,
})

const generateAccessTokenForMulticall = async (
  domain: messages.Domain,
  callerAddress: string,
  contractAddress: string,
  contractInterface: Interface,
  functionSignatureAsString: string,
  parameters: any[]
) => {
  if (!signer?.address) {
    throw new Error('Signer was not instantiated properly')
  }

  const token = {
    functionCall: {
      functionSignature: contractInterface.getSighash(functionSignatureAsString),
      target: contractAddress,
      caller: callerAddress,
      parameters: utils.packParameters(contractInterface, functionSignatureAsString, parameters),
    },
    expiry: EXPIRY,
  }

  const signature = splitSignature(await utils.signAccessToken(signer, domain, token))
  return { signature, expiry: token.expiry }
}

export const getEATForMulticall = async ({
  callerAddress,
  contractAddress,
  contractInterface,
  chainId,
  withDeadline,
  parameters,
}: GetEATForMulticallArgs): Promise<EAT | null> => {
  const domain = getDomain(chainId)
  const functionSignatureAsString = withDeadline
    ? 'multicall(uint8,bytes32,bytes32,uint256,uint256,bytes[])'
    : 'multicall(uint8,bytes32,bytes32,uint256,bytes[])'
  try {
    const EAT = await generateAccessTokenForMulticall(
      domain,
      callerAddress,
      contractAddress,
      contractInterface,
      functionSignatureAsString,
      parameters
    )
    console.log('###### Generated EAT ######: ', EAT)
    return EAT
  } catch (error) {
    console.error('Error generating an EAT: ', error)
  }

  return null
}
