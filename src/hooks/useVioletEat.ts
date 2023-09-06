import { AuthorizeProps } from '@violetprotocol/sdk'
import create from 'zustand'

import { Call, VioletTxAuthorizationPayload } from './useVioletAuthorize'

export type EatPayload = { status: 'idle' } | { status: 'authorizing' } | IssuedEATPayload | FailedEATPayload

type FailedEATPayload = {
  status: 'failed'
  data: {
    code: string
    txId?: string
  }
}
export type IssuedEATPayload = {
  status: 'issued'
  data: {
    token: string
    txId: string
    signature: any
    expiry: number
  }
}

type VioletEatProps = {
  call?: Call
  setCall: (call: Call) => void
  authorizeProps?: AuthorizeProps
  setAuthorizeProps: (props: Required<VioletTxAuthorizationPayload>) => void
  eatPayload: EatPayload
  setEatPayload: (payload: EatPayload) => void
  onIssued: (issuedPayload: IssuedEATPayload['data']) => void
  onFailed: (failedEATPayload: FailedEATPayload['data']) => void
}

// eslint-disable-next-line import/no-unused-modules
export const useVioletEAT = create<VioletEatProps>((set, get) => ({
  setCall: (call) => {
    const eatStatus = get().eatPayload.status
    if (eatStatus !== 'authorizing' && eatStatus !== 'issued') {
      console.log('setting call BEFORE AUTH')
      set({ call })
    }
  },
  eatPayload: { status: 'idle' },
  setAuthorizeProps: (authorizeArgs) => {
    if (get()?.eatPayload?.status === 'authorizing' && !get().authorizeProps) {
      console.log('setting all tx details when fetching EAT', authorizeArgs)
      set({ authorizeProps: VioletTxAuthorizationPayload.toAuthorizeProps(authorizeArgs) })
      set({ call: authorizeArgs.call })
    }
  },
  setEatPayload: (eatPayload) => {
    set({ eatPayload })
  },
  onIssued: (issuedPayload: IssuedEATPayload['data']) => {
    console.log('onIssued', issuedPayload)
    set({ eatPayload: { data: issuedPayload, status: 'issued' } })
  },
  onFailed: (failedEATPayload: FailedEATPayload['data']) => {
    set({ eatPayload: { data: failedEATPayload, status: 'failed' } })
  },
}))
