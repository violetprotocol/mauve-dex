import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { VIOLET_ID_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { RPC_URLS } from 'constants/networks'
import { useMemo } from 'react'

import VioletIDABI from '../abis/violetid.json'

export function useVioletID() {
  const { chainId, provider } = useWeb3React()

  return useMemo(() => {
    if (!chainId) return

    const contract = new Contract(VIOLET_ID_ADDRESSES[chainId], VioletIDABI, provider)
    return contract
  }, [chainId, provider])
}

export function getVioletIDContract(chainId: number) {
  const rpcUrls = RPC_URLS[chainId as SupportedChainId]
  const provider = new JsonRpcProvider(rpcUrls[0])

  return new Contract(VIOLET_ID_ADDRESSES[chainId], VioletIDABI, provider)
}
