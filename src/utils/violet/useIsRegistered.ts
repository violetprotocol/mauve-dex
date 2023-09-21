import { isAddress } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'

import { baseUrlByEnvironment } from './generateEAT'

const fetchRegisteredStatus = async (ethereumAddress?: string): Promise<boolean | null> => {
  if (!process.env.REACT_APP_VIOLET_ENV) {
    throw new Error('Missing VIOLET_ENV env variable')
  }
  const baseURL = baseUrlByEnvironment(process.env.REACT_APP_VIOLET_ENV.toString())
  // TODO: there's no reason why we should have to format as caip10 here
  const URL = `${baseURL}/api/onchain/user/enrolled?from=eip155:1:${ethereumAddress}`

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      console.error(`Failed to fetch registered status from Violet for ${ethereumAddress}`)
    }

    const data = await response.json()
    return data?.isUserEnrolled
  } catch (error) {
    console.error('Error while fetching registered status from Violet:', error)
    return null
  }
}

// TODO: Sth like that should be provided by Violet SDK
export const useIsRegisteredWithViolet = ({ ethereumAddress }: { ethereumAddress?: string }) => {
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
