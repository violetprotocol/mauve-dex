import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import VioletIDABI from '../abis/violetid.json'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from '@violetprotocol/mauve-sdk-core'
import { VIOLET_ID_ADDRESSES } from 'constants/addresses'

export function useVioletID() {
  const { chainId, provider } = useWeb3React()
  const [violetID, setVioletID] = useState<ethers.Contract>()

  useEffect(() => {
    function getVioletIDContract() {
      if (!chainId) return

      const contract = new ethers.Contract(VIOLET_ID_ADDRESSES[chainId], VioletIDABI, provider)
      setVioletID(contract)
    }

    getVioletIDContract()
  }, [chainId, provider])

  return violetID
}
