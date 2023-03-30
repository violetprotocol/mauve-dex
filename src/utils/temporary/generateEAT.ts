import { Signature, splitSignature } from '@ethersproject/bytes'
import { BigNumber } from 'ethers';

// TODO: Move this to shared types
type EAT = { signature: Signature; expiry: number }

type GetEATForMulticallArgs = {
  callerAddress: string
  contractAddress: string
  chainId: number
  functionSigHash: string
  parameters: string
}

// eslint-disable-next-line import/no-unused-modules
export const getEATForMulticall = async ({
  chainId,
  callerAddress,
  contractAddress,
  functionSigHash,
  parameters,
}: GetEATForMulticallArgs): Promise<EAT> => {
  previousCall({
    chainId,
    callerAddress,
    contractAddress,
    functionSigHash,
    parameters,
  })

  const response = await fetch('http://localhost:8080/api/onchain/tmp-mint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: parameters,
      function_signature: functionSigHash,
      namespace: 'eip155',
      chainId,
      address: callerAddress,
      target_contract: contractAddress,
    }),
  })

  const encodedEAT = await response.text()
  const EAT = JSON.parse(atob(encodedEAT))
  EAT.signature = splitSignature(EAT.signature)
  console.log('###### Generated EAT ######: ', EAT)
  return EAT
}

function previousCall({
  chainId,
  callerAddress,
  contractAddress,
  functionSigHash,
  parameters,
}: GetEATForMulticallArgs) {
  // Change me
const OP_GOERLI_VERIFIER_CONTRACT_ADDRESS = '0x5Dbe2B4648FFAF2867F8Ad07d42003F5ce4b7d2C'
const EXPIRY = BigNumber.from(4833857428)

const getDomain = (chainId: number) => ({
  name: 'Ethereum Access Token',
  version: '1',
  chainId,
  verifyingContract: OP_GOERLI_VERIFIER_CONTRACT_ADDRESS.toLowerCase(),
})
  const domain = getDomain(chainId)
  const token = {
    functionCall: {
      functionSignature: functionSigHash,
      target: contractAddress,
      caller: callerAddress,
      parameters,
    },
    expiry: EXPIRY,
  }
  console.log("CORRECT ARGS:", JSON.stringify({domain, token}, null, "  "))
}