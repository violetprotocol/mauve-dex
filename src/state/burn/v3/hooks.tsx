import { Currency, CurrencyAmount, Percent } from '@violetprotocol/mauve-sdk-core'
import { Position } from '@violetprotocol/mauve-v3-sdk'
import { useWeb3React } from '@web3-react/core'
import useAnalyticsContext from 'components/analytics/useSegmentAnalyticsContext'
import { useToken } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useV3PositionFees } from 'hooks/useV3PositionFees'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PositionDetails } from 'types/position'
import { unwrappedToken } from 'utils/unwrappedToken'
import { AnalyticsEvent } from 'utils/violet/analyticsEvents'

import { AppState } from '../../index'
import { selectPercent } from './actions'

export function useBurnV3State(): AppState['burnV3'] {
  return useAppSelector((state) => state.burnV3)
}

export function useDerivedV3BurnInfo(
  position?: PositionDetails,
  asWETH = false
): {
  position?: Position
  liquidityPercentage?: Percent
  liquidityValue0?: CurrencyAmount<Currency>
  liquidityValue1?: CurrencyAmount<Currency>
  feeValue0?: CurrencyAmount<Currency>
  feeValue1?: CurrencyAmount<Currency>
  outOfRange: boolean
  error?: ReactNode
} {
  const { account } = useWeb3React()
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.fee)

  const positionSDK = useMemo(
    () =>
      pool && position?.liquidity && typeof position?.tickLower === 'number' && typeof position?.tickUpper === 'number'
        ? new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          })
        : undefined,
    [pool, position]
  )

  const liquidityPercentage = new Percent(percent, 100)

  const discountedAmount0 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount0.quotient).quotient
    : undefined
  const discountedAmount1 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount1.quotient).quotient
    : undefined

  const liquidityValue0 =
    token0 && discountedAmount0
      ? CurrencyAmount.fromRawAmount(asWETH ? token0 : unwrappedToken(token0), discountedAmount0)
      : undefined
  const liquidityValue1 =
    token1 && discountedAmount1
      ? CurrencyAmount.fromRawAmount(asWETH ? token1 : unwrappedToken(token1), discountedAmount1)
      : undefined

  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, position?.tokenId, asWETH)

  const outOfRange =
    pool && position ? pool.tickCurrent < position.tickLower || pool.tickCurrent > position.tickUpper : false

  let error: ReactNode | undefined
  if (!account) {
    error = <>Connect Wallet</>
  }
  if (percent === 0) {
    error = error ?? <>Enter a percent</>
  }
  return {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  }
}

export function useBurnV3ActionHandlers(): {
  onPercentSelect: (percent: number) => void
} {
  const dispatch = useAppDispatch()
  const { analytics } = useAnalyticsContext()

  const onPercentSelect = useCallback(
    (percent: number) => {
      dispatch(selectPercent({ percent }))
      switch (percent) {
        case 25:
          analytics.track(AnalyticsEvent.REMOVE_LIQUIDITY_25_PERCENT_CLICKED)
          break
        case 50:
          analytics.track(AnalyticsEvent.REMOVE_LIQUIDITY_50_PERCENT_CLICKED)
          break
        case 75:
          analytics.track(AnalyticsEvent.REMOVE_LIQUIDITY_75_PERCENT_CLICKED)
          break
        case 100:
          analytics.track(AnalyticsEvent.REMOVE_LIQUIDITY_MAX_CLICKED)
          break
        default:
          analytics.track(AnalyticsEvent.REMOVE_LIQUIDITY_CHANGED_SLIDER)
          break
      }
    },
    [dispatch, analytics]
  )

  return {
    onPercentSelect,
  }
}
