import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { VIOLET_ID_ADDRESSES } from 'constants/addresses'
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
