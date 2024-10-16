import { Price, Token } from '@violetprotocol/mauve-sdk-core'
import { tickToPrice } from '@violetprotocol/mauve-v3-sdk'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
