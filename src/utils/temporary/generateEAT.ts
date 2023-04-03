import { Signature, splitSignature } from '@ethersproject/bytes'

type EAT = { signature: Signature; expiry: number }

type GetEATForMulticallArgs = {
  callerAddress: string
  contractAddress: string
  chainId: number
  functionSigHash: string
  parameters: string
}

export const getEATForMulticall = async ({
  chainId,
  callerAddress,
  contractAddress,
  functionSigHash,
  parameters,
}: GetEATForMulticallArgs): Promise<EAT> => {
  const response = await fetch('http://localhost:8080/api/onchain/eat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: parameters,
      function_signature: functionSigHash,
      namespace: 'eip155',
      chainId,
      address: callerAddress,
      target_contract: contractAddress,
      blockchain_app: 'MAUVE',
    }),
  })

  const encodedEAT = await response.json()
  const EAT = JSON.parse(atob(encodedEAT.eat))
  EAT.signature = splitSignature(EAT.signature)
  console.log('###### Generated EAT ######: ', EAT)
  return EAT
}
