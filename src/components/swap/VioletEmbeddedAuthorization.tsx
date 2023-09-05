'use client'

import { splitSignature } from '@ethersproject/bytes'
import {
  AuthorizeProps,
  AuthorizeVioletResponse,
  buildAuthorizationUrl,
  VIOLET_AUTHORIZATION_CHANNEL,
} from '@violetprotocol/sdk'
// import { useIFrameExecutor as _useIFrameExecutor } from '@violetprotocol/sdk-web3-react'
import { forwardRef, RefObject, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'
const StyledIframe = styled.iframe`
  border: none;
`

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
  onIssued: (data: any) => void
  onFailed: (error: any) => void
  call: Call
}

enum VioletEvent {
  INACTIVE = 'INACTIVE',
  LISTENING = 'LISTENING',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
}

const useListenVioletEvents = (call: Call) => {
  const [payload, setPayload] = useState<{ event: VioletEvent; data: { [key: string]: any } }>({
    event: VioletEvent.INACTIVE,
    data: {},
  })

  useEffect(() => {
    const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL)
    setPayload({ event: VioletEvent.LISTENING, data: {} })

    const listener = (event: MessageEvent<AuthorizeVioletResponse>) => {
      if (!event.isTrusted) {
        setPayload({ event: VioletEvent.LISTENING, data: { code: 'EVENT_NOT_TRUSTED' } })

        return
      }

      if ('error_code' in event.data) {
        setPayload({
          event: VioletEvent.ERROR,
          data: { code: event.data.error_code.toUpperCase(), txId: event.data.tx_id },
        })

        return
      }

      if ('token' in event.data) {
        const eat = event.data.token
        const parsedEAT = JSON.parse(atob(eat))

        if (!parsedEAT?.signature || !parsedEAT?.expiry) {
          setPayload({ event: VioletEvent.ERROR, data: { code: 'EAT_PARSING_FAILED', txId: event.data.tx_id } })

          return
        }

        const signature = splitSignature(parsedEAT.signature)

        setPayload({
          event: VioletEvent.COMPLETED,
          data: {
            token: event.data.token,
            txId: event.data.tx_id,
            signature,
            expiry: parsedEAT.expiry,
            call,
          },
        })

        return
      }

      throw new Error('UNKNOWN_ERROR_VIOLET_EMBEDDED_AUTHORIZATION')
    }

    channel.addEventListener('message', listener, {
      once: true,
    })
  }, [call])

  return payload
}

// TODO: Move this to
// eslint-disable-next-line import/no-unused-modules
export const VioletEmbeddedAuthorization = forwardRef<HTMLIFrameElement, VioletEmbeddedAuthorizationProps>(
  function VioletEmbeddedAuthorizationDipslayName({ apiUrl, authz, onIssued, onFailed, call }, ref) {
    const payload = useListenVioletEvents(call)

    useEffect(() => {
      if (payload.event === VioletEvent.COMPLETED) {
        onIssued({ ...payload.data })
      }

      if (payload.event === VioletEvent.ERROR) {
        onFailed({ ...payload.data })
      }
    }, [payload, onIssued, onFailed])

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
import { Call } from 'hooks/useVioletAuthorize'

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
