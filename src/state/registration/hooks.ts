import { useWeb3React } from '@web3-react/core'
import { useAppSelector } from 'state/hooks'

export function useIsUserRegisteredWithViolet(): boolean | undefined {
  const { account } = useWeb3React()

  const state = useAppSelector((state) => state.registration)

  return state.isRegistered[account ?? '']
}
