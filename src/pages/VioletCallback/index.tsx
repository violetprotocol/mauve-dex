import { VIOLET_AUTHORIZATION_JSON } from '@violetprotocol/sdk'
import { useEffect } from 'react'

const VioletCallback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    const params: Record<string, string | number> = {}

    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    if (params['tx_id']) {
      localStorage.setItem(VIOLET_AUTHORIZATION_JSON, JSON.stringify(params))

      window.close()

      return
    }

    window.location.href = '/#/swap'
  }, [])

  return null
}

export default VioletCallback
