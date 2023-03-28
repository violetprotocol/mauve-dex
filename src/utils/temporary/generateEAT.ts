import { BigNumber } from '@ethersproject/bignumber'
import { Signature, splitSignature } from '@ethersproject/bytes'
import { Wallet } from '@ethersproject/wallet'
import { messages, utils } from '@violetprotocol/ethereum-access-token-helpers'

// TODO: Move this to shared types
type EAT = { signature: Signature; expiry: BigNumber }

type GetEATForMulticallArgs = {
  callerAddress: string
  contractAddress: string
  chainId: number
  functionSigHash: string
  parameters: string
}

// Change me
const VERIFIER_CONTRACT_ADDRESS = '0x5Dbe2B4648FFAF2867F8Ad07d42003F5ce4b7d2C'
const OP_GOERLI_VERIFIER_CONTRACT_ADDRESS = '0x5Dbe2B4648FFAF2867F8Ad07d42003F5ce4b7d2C'
const EXPIRY = BigNumber.from(4833857428)

const pk = process.env.REACT_APP_VIOLET_TEST_PRIVATE_KEY || ''
const signer = new Wallet(pk)

const getDomain = (chainId: number) => ({
  name: 'Ethereum Access Token',
  version: '1',
  chainId,
  verifyingContract: OP_GOERLI_VERIFIER_CONTRACT_ADDRESS.toLowerCase(),
})

const generateAccessTokenForMulticall = async (
  domain: messages.Domain,
  callerAddress: string,
  contractAddress: string,
  functionSigHash: string,
  parameters: string
) => {
  if (!signer?.address) {
    throw new Error('Signer was not instantiated properly')
  }

  const token = {
    functionCall: {
      functionSignature: functionSigHash,
      target: contractAddress,
      caller: callerAddress,
      parameters,
    },
    expiry: EXPIRY,
  }

  const signature = splitSignature(await utils.signAccessToken(signer, domain, token))
  return { signature, expiry: token.expiry }
}

export const getEATForMulticall = async ({
  callerAddress,
  contractAddress,
  chainId,
  functionSigHash,
  parameters,
}: GetEATForMulticallArgs): Promise<EAT | null> => {
  const domain = getDomain(chainId)
  const EAT = await generateAccessTokenForMulticall(domain, callerAddress, contractAddress, functionSigHash, parameters)
  console.log('###### Generated EAT ######: ', EAT)
  return EAT
}
