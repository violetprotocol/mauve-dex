'use client'

import { AuthorizeProps, buildAuthorizationUrl } from '@violetprotocol/sdk'
// import { useIFrameExecutor as _useIFrameExecutor } from '@violetprotocol/sdk-web3-react'
import { forwardRef, RefObject, useEffect, useRef } from 'react'
import styled from 'styled-components/macro'

const StyledIframe = styled.iframe`
  border: none;
`

// const deadline = useTransactionDeadline()
// const swapCall: Call | null = useSwapCallArguments({
//   trade,
//   allowedSlippage,
//   recipientAddressOrName,
//   signatureData,
//   deadline,
// })
// const environment = process.env.REACT_APP_VIOLET_ENV!
// const violetRef = useIFrameExecutor()
// const apiUrl = baseUrlByEnvironment(environment.toString())
// <VioletEmbeddedAuthorization ref={violetRef} call={swapCall} />

// TODO: Move this to @violetprotocol/sdk-web3-react and replace the original useIFrameExecutor
// eslint-disable-next-line import/no-unused-modules
export const useIFrameExecutor = () => {
  const iframeRef = useRef<any>()
  const sourceRef = useRef<any>()
  const targetRef = useRef<any>()

  useEffect(() => {
    sourceRef.current = window
    targetRef.current = iframeRef.current?.contentWindow
  }, [])

  _useIFrameExecutor({ sourceRef, targetRef })

  return iframeRef
}

interface VioletEmbeddedAuthorizationProps {
  apiUrl: string
  authz: AuthorizeProps
}

// TODO: Move this to
// eslint-disable-next-line import/no-unused-modules
export const VioletEmbeddedAuthorization = forwardRef<HTMLIFrameElement, VioletEmbeddedAuthorizationProps>(
  function VioletEmbeddedAuthorization({ apiUrl, authz }, ref) {
    const url = buildAuthorizationUrl({
      ...authz,
      apiUrl,
    })

    return <IFrame ref={ref} authnorizationUrl={url} />
  }
)

interface IFrameProps {
  authnorizationUrl: string
}

const IFrame = forwardRef<HTMLIFrameElement, IFrameProps>(function IFrame({ authnorizationUrl }, ref) {
  return <StyledIframe ref={ref} src={authnorizationUrl} width="386px" height="220px" />
})

///////

import { useIFrameTransport } from '@violetprotocol/sdk'
import { useWeb3React } from '@web3-react/core'

interface UseIFrameExecutorProps {
  sourceRef: RefObject<any>
  targetRef: RefObject<any>
}

/**
 * This should be used in the parent window to execute requests from the child window.
 *
 * @param sourceRef - the parent `window` to which the child posts messages as requests
 * @param targetRef - the child `window` (iframe) to which the parent posts messages as replies
 */
function _useIFrameExecutor({ sourceRef, targetRef }: UseIFrameExecutorProps) {
  const ref_ = useRef<any>()
  const w3 = useWeb3React()

  useEffect(() => {
    ref_.current = w3.connector
  }, [sourceRef, targetRef, w3.connector])

  useIFrameTransport({
    async requestExecutor(request) {
      console.log(`[PARENT REQUEST EXECUTOR]: `, request)
      const connector = ref_.current
      const provider = connector.customProvider || w3.connector.provider
      return provider.request(request)
    },
    sourceRef,
    targetRef,
  })
}
