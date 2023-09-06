import { useEffect, useState } from 'react'

// Temporary switch to simulate different responses from Violet
const IS_ALREADY_ENROLLED = false

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// TODO: Sth like that should be provided by Violet SDK
export const useIsRegisteredWithViolet = ({ ethereumAddress }: { ethereumAddress?: string }) => {
  const [isRegistered, setIsRegistered] = useState<null | boolean>(null)

  const fetchStatus = async () => {
    await sleep(1000)

    return IS_ALREADY_ENROLLED
  }

  useEffect(() => {
    if (ethereumAddress) {
      fetchStatus().then((value) => setIsRegistered(value))
    }
  }, [ethereumAddress])

  return { isRegistered }
}
