import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@violetprotocol/mauve-router-sdk'
import { AlphaRouter, ChainId } from '@violetprotocol/mauve-smart-order-router'
import { RPC_PROVIDERS } from 'constants/providers'
import { getClientSideQuote, toSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import ms from 'ms.macro'
import qs from 'qs'

import { GetQuoteResult } from './types'

export enum RouterPreference {
  API = 'api',
  CLIENT = 'client',
  PRICE = 'price',
}

const routers = new Map<ChainId, AlphaRouter>()
function getRouter(chainId: ChainId): AlphaRouter {
  const router = routers.get(chainId)
  if (router) return router

  const supportedChainId = toSupportedChainId(chainId)
  if (supportedChainId) {
    const provider = RPC_PROVIDERS[supportedChainId]
    // @ts-ignore
    const router = new AlphaRouter({ chainId, provider })
    routers.set(chainId, router)
    return router
  }

  throw new Error(`Router does not support this chain (chainId: ${chainId}).`)
}

const API_QUERY_PARAMS = {
  protocols: 'v3',
}
const CLIENT_PARAMS = {
  protocols: [Protocol.V3],
}
// Price queries are tuned down to minimize the required RPCs to respond to them.
// TODO(zzmp): This will be used after testing router caching.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PRICE_PARAMS = {
  protocols: [Protocol.V3],
  v2PoolSelection: {
    topN: 2,
    topNDirectSwaps: 1,
    topNTokenInOut: 2,
    topNSecondHop: 1,
    topNWithEachBaseToken: 2,
    topNWithBaseToken: 2,
  },
  v3PoolSelection: {
    topN: 2,
    topNDirectSwaps: 1,
    topNTokenInOut: 2,
    topNSecondHop: 1,
    topNWithEachBaseToken: 2,
    topNWithBaseToken: 2,
  },
  maxSwapsPerPath: 2,
  minSplits: 1,
  maxSplits: 1,
  distributionPercent: 100,
}

export const routingApi = createApi({
  reducerPath: 'routingApi',
  baseQuery: fetchBaseQuery({}),
  endpoints: (build) => ({
    getQuote: build.query<
      GetQuoteResult,
      {
        tokenInAddress: string
        tokenInChainId: ChainId
        tokenInDecimals: number
        tokenInSymbol?: string
        tokenOutAddress: string
        tokenOutChainId: ChainId
        tokenOutDecimals: number
        tokenOutSymbol?: string
        amount: string
        routerPreference: RouterPreference
        excludeTokens?: string[]
        type: 'exactIn' | 'exactOut'
      }
    >({
      async queryFn(args, _api, _extraOptions, fetch) {
        const {
          tokenInAddress,
          tokenInChainId,
          tokenOutAddress,
          tokenOutChainId,
          amount,
          routerPreference,
          type,
          excludeTokens,
        } = args

        let result

        try {
          if (routerPreference === RouterPreference.API) {
            const query = qs.stringify({
              ...API_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              type,
            })
            result = await fetch(`quote?${query}`)
          } else {
            // Mauve always uses this one
            const router = getRouter(args.tokenInChainId)
            result = await getClientSideQuote(
              args,
              router,
              // TODO(zzmp): Use PRICE_PARAMS for RouterPreference.PRICE.
              // This change is intentionally being deferred to first see what effect router caching has.
              {
                ...CLIENT_PARAMS,
                excludeTokens,
              }
            )
          }

          return { data: result.data as GetQuoteResult }
        } catch (e) {
          // TODO: fall back to client-side quoter when auto router fails.
          // deprecate 'legacy' v2/v3 routers first.
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`10s`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
})

export const { useGetQuoteQuery } = routingApi
