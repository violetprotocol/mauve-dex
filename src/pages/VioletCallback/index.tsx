import { VIOLET_AUTHORIZE_KEY } from '@violetprotocol/sdk'
import { useEffect } from 'react'

const VioletCallback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    const params: Record<string, string | number> = {}

    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    if (params['tx_id']) {
      localStorage.setItem(VIOLET_AUTHORIZE_KEY, JSON.stringify(params))

      window.close()

      return
    }

    window.location.href = '/#/swap'
  }, [])

  return null
}

export default VioletCallback
