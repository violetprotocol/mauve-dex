import { useAppSelector } from 'state/hooks'

export function useIsUserRegisteredWithViolet(address?: string): boolean | undefined {
  const state = useAppSelector((state) => state.registration)

  return state.isRegistered[address ?? '']
}
