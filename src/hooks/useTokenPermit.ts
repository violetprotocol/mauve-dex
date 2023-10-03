import { Currency } from '@violetprotocol/mauve-sdk-core'
import { checkRestriction, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { useEffect, useState } from 'react'

import { getVioletIDContract } from './useVioletID'

export const useTokenPermit = (
  account: string | undefined,
  chainId: number | undefined,
  currency: Currency | null | undefined
) => {
  const [isPermitted, setIsPermitted] = useState(false)
  const [restriction, setRestriction] = useState<TOKEN_RESTRICTION_TYPE>(TOKEN_RESTRICTION_TYPE.NONE)

  useEffect(() => {
    const getStatus = async () => {
      if (!account || !chainId || !currency) return

      const restriction = checkRestriction(chainId, currency.isNative ? currency.wrapped.address : currency.address)
      if (restriction === TOKEN_RESTRICTION_TYPE.NONE) {
        setIsPermitted(true)
      } else {
        const violetIdContract = getVioletIDContract(chainId)
        const hasStatus = await violetIdContract.callStatic.hasStatus(account, restriction)

        setIsPermitted(hasStatus)
      }

      setRestriction(restriction)
    }

    getStatus()
  }, [account, chainId, currency])

  return { isPermitted, restriction }
}
