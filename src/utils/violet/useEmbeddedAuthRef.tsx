import { useIFrameExecutor } from '@violetprotocol/sdk-web3-react'
import { useEffect, useRef } from 'react'

const useEmbeddedAuthRef = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const sourceRef = useRef<Window | null>(null)
  const targetRef = useRef<any>(null)

  useEffect(() => {
    sourceRef.current = window
    targetRef.current = iframeRef.current?.contentWindow
  }, [])

  useIFrameExecutor({ sourceRef, targetRef })

  return iframeRef
}

export { useEmbeddedAuthRef }
