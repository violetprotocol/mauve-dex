import { Trade } from '@violetprotocol/mauve-router-sdk'
import { Currency, TradeType } from '@violetprotocol/mauve-sdk-core'
import { AuthorizeProps } from '@violetprotocol/sdk'
import { getVioletAuthzPayloadFromCall } from 'utils/temporary/authorizeProps'
import { create } from 'zustand'

import { Call, getVioletAuthorizedCall, handleErrorCodes } from './useVioletAuthorize'

type EatPayload = { status: 'idle' } | { status: 'authorizing' } | IssuedEATPayload | FailedEATPayload

type FailedEATPayload = {
  status: 'failed'
  data: {
    code?: string
    message?: string
  }
}
type IssuedEATPayload = {
  status: 'issued'
  data: {
    signature: any
    expiry: number
  }
}

type VioletEatProps = {
  call: Call | null
  trade?: Trade<Currency, Currency, TradeType>
  setTrade: (trade: any) => void
  setCall: (call: Call) => void
  authorizeProps?: AuthorizeProps
  setAuthorizeProps: (props: { account: string; chainId: number }) => void
  eatPayload: EatPayload
  setEatPayload: (payload: EatPayload) => void
  onIssued: (issuedPayload: IssuedEATPayload['data']) => void
  onFailed: (failedEATPayload: FailedEATPayload['data']) => void
  triggerPopup: (props: { account: string; chainId: number }, callback: () => Promise<void>) => void
  onTransactionSuccess: () => void
  onTransactionDismiss: () => void
}

export const useVioletEAT = create<VioletEatProps>((set, get) => ({
  call: null,
  eatPayload: { status: 'idle' },
  setTrade: (trade) => {
    const eatStatus = get().eatPayload.status
    if (eatStatus !== 'authorizing' && eatStatus !== 'issued') {
      set({ trade })
    }
  },
  setCall: (call) => {
    const eatStatus = get().eatPayload.status
    if (eatStatus !== 'authorizing' && eatStatus !== 'issued') {
      set({ call })
    }
  },
  setAuthorizeProps: (authorizeArgs) => {
    if (get()?.eatPayload?.status === 'authorizing') {
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
    set({ eatPayload: { data: { message: handleErrorCodes(failedEATPayload.code) }, status: 'failed' } })
  },
  triggerPopup: ({ account, chainId }, callback) => {
    const { call } = get()
    getVioletAuthorizedCall({ call, account, chainId })
      .then((result) => {
        if (result) {
          console.log(result)
          set({ eatPayload: { data: result.eat, status: 'issued' } })
          callback()
        }
      })
      .catch((err) => {
        set({ eatPayload: { status: 'failed', data: { message: err.message } } })
      })
  },
  onTransactionSuccess: () => {
    set({ eatPayload: { status: 'idle' } })
  },
  onTransactionDismiss: () => {
    set({ eatPayload: { status: 'idle' } })
  },
}))
