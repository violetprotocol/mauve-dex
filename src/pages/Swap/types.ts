import { Call } from 'hooks/useVioletAuthorize'

export type VioletEAT =
  | { status: 'idle' }
  | { status: 'authorizing' }
  | IssuedEAT
  | {
      status: 'failed'
      data: {
        code: string
        txId?: string
      }
    }

export type IssuedEAT = {
  status: 'issued'
  data: {
    token: string
    txId: string
    signature: any
    expiry: number
    call: Call
  }
}
