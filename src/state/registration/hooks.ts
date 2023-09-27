import { useAppSelector } from 'state/hooks'

export function useLocalStorageWalletRegistrationStatus(address?: string): boolean | undefined {
  const state = useAppSelector((state) => state.registration)

  return state.isRegistered[address ?? '']
}
