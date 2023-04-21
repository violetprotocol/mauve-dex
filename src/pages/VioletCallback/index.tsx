import { VIOLET_AUTHORIZATION_CHANNEL } from '@violetprotocol/sdk'
import { useEffect } from 'react'

const VioletCallback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    const params: { [key: string]: string } = {}

    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL)

    channel.postMessage(params)

    window.close()
  }, [])

  return null
}

export default VioletCallback
