import { isEnrolled } from '@violetprotocol/sdk'
import { isAddress } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'

import { baseUrlByEnvironment } from './generateEAT'

const fetchRegisteredStatus = async (ethereumAddress?: string): Promise<boolean | null> => {
  if (!process.env.REACT_APP_VIOLET_ENV) {
    throw new Error('Missing VIOLET_ENV env variable')
  }

  if (!ethereumAddress) {
    return null
  }

  const baseURL = baseUrlByEnvironment(process.env.REACT_APP_VIOLET_ENV.toString())

  try {
    const isUserRegistered = isEnrolled({ address: ethereumAddress, apiUrl: baseURL })

    return isUserRegistered
  } catch (error) {
    console.error('Error while fetching registered status from Violet:', error)

    return null
  }
}

const useIsRegisteredWithViolet = ({ ethereumAddress }: { ethereumAddress?: string }) => {
  const [isRegistered, setIsRegistered] = useState<null | boolean>(null)

  const updateUserIsRegistered = useCallback(
    () => fetchRegisteredStatus(ethereumAddress).then((value) => setIsRegistered(value)),
    [setIsRegistered, ethereumAddress]
  )

  useEffect(() => {
    if (!ethereumAddress) {
      return
    }

    if (!isAddress(ethereumAddress)) {
      console.error('Invalid address detected')
    }

    updateUserIsRegistered()
  }, [ethereumAddress, updateUserIsRegistered])

  return { isRegistered, updateUserIsRegistered }
}

export { useIsRegisteredWithViolet }
