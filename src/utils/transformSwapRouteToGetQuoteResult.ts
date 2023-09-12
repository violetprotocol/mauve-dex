import { Protocol } from '@violetprotocol/mauve-router-sdk'
import { Currency, CurrencyAmount } from '@violetprotocol/mauve-sdk-core'
import { routeAmountsToString, SwapRoute } from '@violetprotocol/mauve-smart-order-router'
import { Pool } from '@violetprotocol/mauve-v3-sdk'
import { GetQuoteResult, V2PoolInRoute, V3PoolInRoute } from 'state/routing/types'

export function transformSwapRouteToGetQuoteResult(
  type: 'exactIn' | 'exactOut',
  amount: CurrencyAmount<Currency>,
  {
    quote,
    quoteGasAdjusted,
    route,
    estimatedGasUsed,
    estimatedGasUsedQuoteToken,
    estimatedGasUsedUSD,
    gasPriceWei,
    methodParameters,
    blockNumber,
  }: SwapRoute
): GetQuoteResult {
  const routeResponse: Array<(V3PoolInRoute | V2PoolInRoute)[]> = []

  for (const subRoute of route) {
    const { amount, quote, tokenPath } = subRoute

    const pools = subRoute.protocol === Protocol.V2 ? subRoute.route.pairs : subRoute.route.pools
    const curRoute: (V3PoolInRoute | V2PoolInRoute)[] = []
    for (let i = 0; i < pools.length; i++) {
      const nextPool = pools[i]
      const tokenIn = tokenPath[i]
      const tokenOut = tokenPath[i + 1]

      let edgeAmountIn = undefined
      if (i === 0) {
        edgeAmountIn = type === 'exactIn' ? amount.quotient.toString() : quote.quotient.toString()
      }

      let edgeAmountOut = undefined
      if (i === pools.length - 1) {
        edgeAmountOut = type === 'exactIn' ? quote.quotient.toString() : amount.quotient.toString()
      }

      if (nextPool instanceof Pool) {
        curRoute.push({
          type: 'v3-pool',
          tokenIn: {
            chainId: tokenIn.chainId,
            decimals: tokenIn.decimals,
            address: tokenIn.address,
            symbol: tokenIn.symbol,
          },
          tokenOut: {
            chainId: tokenOut.chainId,
            decimals: tokenOut.decimals,
            address: tokenOut.address,
            symbol: tokenOut.symbol,
          },
          fee: nextPool.fee.toString(),
          liquidity: nextPool.liquidity.toString(),
          sqrtRatioX96: nextPool.sqrtRatioX96.toString(),
          tickCurrent: nextPool.tickCurrent.toString(),
          amountIn: edgeAmountIn,
          amountOut: edgeAmountOut,
        })
      } else {
        console.error(`nextPool received is not an instance of Pool.`)
        throw new Error(
          `Pool received is not an instance of Pool. Make sure the versions of the dependencies are in sync. nexPool: ${JSON.stringify(
            nextPool,
            null,
            2
          )}`
        )
      }
    }

    routeResponse.push(curRoute)
  }

  const result: GetQuoteResult = {
    methodParameters,
    blockNumber: blockNumber.toString(),
    amount: amount.quotient.toString(),
    amountDecimals: amount.toExact(),
    quote: quote.quotient.toString(),
    quoteDecimals: quote.toExact(),
    quoteGasAdjusted: quoteGasAdjusted.quotient.toString(),
    quoteGasAdjustedDecimals: quoteGasAdjusted.toExact(),
    gasUseEstimateQuote: estimatedGasUsedQuoteToken.quotient.toString(),
    gasUseEstimateQuoteDecimals: estimatedGasUsedQuoteToken.toExact(),
    gasUseEstimate: estimatedGasUsed.toString(),
    gasUseEstimateUSD: estimatedGasUsedUSD.toExact(),
    gasPriceWei: gasPriceWei.toString(),
    route: routeResponse,
    routeString: routeAmountsToString(route),
  }

  return result
}
