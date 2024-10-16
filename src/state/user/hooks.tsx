import { Percent, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { L2_CHAIN_IDS } from 'constants/chains'
import { SupportedLocale } from 'constants/locales'
import { L2_DEADLINE_FROM_NOW } from 'constants/misc'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { UserAddedToken } from 'types/tokens'

import { AppState } from '../index'
import {
  addSerializedToken,
  updateHideClosedPositions,
  updateUserClientSideRouter,
  updateUserDeadline,
  updateUserLocale,
  updateUserSlippageTolerance,
} from './reducer'
import { SerializedToken } from './types'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function deserializeToken(serializedToken: SerializedToken, Class: typeof Token = Token): Token {
  return new Class(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useUserLocale(): SupportedLocale | null {
  return useAppSelector((state) => state.user.userLocale)
}

// eslint-disable-next-line import/no-unused-modules
export function useUserLocaleManager(): [SupportedLocale | null, (newLocale: SupportedLocale) => void] {
  const dispatch = useAppDispatch()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}

export function useClientSideRouter(): [boolean, (userClientSideRouter: boolean) => void] {
  const dispatch = useAppDispatch()

  const clientSideRouter = useAppSelector((state) => Boolean(state.user.userClientSideRouter))

  const setClientSideRouter = useCallback(
    (newClientSideRouter: boolean) => {
      dispatch(updateUserClientSideRouter({ userClientSideRouter: newClientSideRouter }))
    },
    [dispatch]
  )

  return [clientSideRouter, setClientSideRouter]
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): [Percent | 'auto', (slippageTolerance: Percent | 'auto') => void] {
  const userSlippageToleranceRaw = useAppSelector((state) => {
    return state.user.userSlippageTolerance
  })
  const userSlippageTolerance = useMemo(
    () => (userSlippageToleranceRaw === 'auto' ? 'auto' : new Percent(userSlippageToleranceRaw, 10_000)),
    [userSlippageToleranceRaw]
  )

  const dispatch = useAppDispatch()
  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippageTolerance === 'auto' ? 'auto' : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
      } catch (error) {
        value = 'auto'
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        })
      )
    },
    [dispatch]
  )

  return useMemo(
    () => [userSlippageTolerance, setUserSlippageTolerance],
    [setUserSlippageTolerance, userSlippageTolerance]
  )
}

export function useUserHideClosedPositions(): [boolean, (newHideClosedPositions: boolean) => void] {
  const dispatch = useAppDispatch()

  const hideClosedPositions = useAppSelector((state) => state.user.userHideClosedPositions)

  const setHideClosedPositions = useCallback(
    (newHideClosedPositions: boolean) => {
      dispatch(updateHideClosedPositions({ userHideClosedPositions: newHideClosedPositions }))
    },
    [dispatch]
  )

  return [hideClosedPositions, setHideClosedPositions]
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
  const allowedSlippage = useUserSlippageTolerance()[0]
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance]
  )
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userDeadline)
  const onL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))
  const deadline = onL2 ? L2_DEADLINE_FROM_NOW : userDeadline

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [deadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

function useUserAddedTokensOnChain(chainId: number | undefined | null): Token[] {
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    const tokenMap: Token[] = serializedTokensMap?.[chainId]
      ? Object.values(serializedTokensMap[chainId]).map((value) => deserializeToken(value, UserAddedToken))
      : []
    return tokenMap
  }, [serializedTokensMap, chainId])
}

// Used in CurrencySearchModal.tsx, src/hooks/Tokens.ts
// eslint-disable-next-line import/no-unused-modules
export function useUserAddedTokens(): Token[] {
  return useUserAddedTokensOnChain(useWeb3React().chainId)
}

export function useURLWarningVisible(): boolean {
  return useAppSelector((state: AppState) => state.user.URLWarningVisible)
}
