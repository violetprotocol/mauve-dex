import { BigNumber } from '@ethersproject/bignumber'
import { Signature } from '@ethersproject/bytes'
import { Wallet } from '@ethersproject/wallet'

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

const pk = process.env.REACT_APP_VIOLET_EAT_SIGNER_TEST_PRIVATE_KEY || ''
const signer = pk ? new Wallet(pk) : null

const getDomain = (chainId: number) => ({
  name: 'Ethereum Access Token',
  version: '1',
  chainId,
  verifyingContract: OP_GOERLI_VERIFIER_CONTRACT_ADDRESS.toLowerCase(),
})

// eslint-disable-next-line import/no-unused-modules
export const getEATForMulticall = async ({
  chainId,
  callerAddress,
  contractAddress,
  functionSigHash,
  parameters,
}: GetEATForMulticallArgs): Promise<EAT> => {
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

  const data = await response.json()
  const EAT = data.data

  console.log('###### Generated EAT ######: ', EAT)
  return EAT
}
