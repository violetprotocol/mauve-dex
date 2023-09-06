import { AuthorizeProps } from '@violetprotocol/sdk'
import { getVioletAuthzPayloadFromCall } from 'utils/temporary/authorizeProps'
import create from 'zustand'

import { Call } from './useVioletAuthorize'

type EatPayload = { status: 'idle' } | { status: 'authorizing' } | IssuedEATPayload | FailedEATPayload

type FailedEATPayload = {
  status: 'failed'
  data: {
    code: string
    txId?: string
  }
}
type IssuedEATPayload = {
  status: 'issued'
  data: {
    token: string
    txId: string
    signature: any
    expiry: number
  }
}

type VioletEatProps = {
  call: Call | null
  setCall: (call: Call) => void
  authorizeProps?: AuthorizeProps
  setAuthorizeProps: (props: { account: string; chainId: number }) => void
  eatPayload: EatPayload
  getIssuedEat: () => IssuedEATPayload | undefined
  setEatPayload: (payload: EatPayload) => void
  onIssued: (issuedPayload: IssuedEATPayload['data']) => void
  onFailed: (failedEATPayload: FailedEATPayload['data']) => void
}

export const useVioletEAT = create<VioletEatProps>((set, get) => ({
  call: null,
  eatPayload: { status: 'idle' },
  setCall: (call) => {
    const eatStatus = get().eatPayload.status
    if (eatStatus !== 'authorizing' && eatStatus !== 'issued') {
      set({ call })
    }
  },
  getIssuedEat: () => {
    const eatPayload = get().eatPayload
    if (eatPayload.status === 'issued') {
      return eatPayload
    }
    return
  },
  setAuthorizeProps: (authorizeArgs) => {
    if (get()?.eatPayload?.status === 'authorizing' && !get().authorizeProps) {
      set({ authorizeProps: getVioletAuthzPayloadFromCall({ ...authorizeArgs, call: get().call }) })
    }
  },
  setEatPayload: (eatPayload) => {
    set({ eatPayload })
  },
  onIssued: (issuedPayload: IssuedEATPayload['data']) => {
    set({ eatPayload: { data: issuedPayload, status: 'issued' } })
  },
  onFailed: (failedEATPayload: FailedEATPayload['data']) => {
    set({ eatPayload: { data: failedEATPayload, status: 'failed' } })
  },
}))
