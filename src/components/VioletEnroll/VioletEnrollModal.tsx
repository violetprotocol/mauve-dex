import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useIsUserRegisteredWithViolet } from 'state/registration/hooks'
import { updateRegistrationState } from 'state/registration/reducer'
import { useIsRegisteredWithViolet } from 'utils/temporary/useIsRegistered'

import Modal from '../Modal'
import VioletEnroll from './VioletEnroll'

export default function VioletEnrollModal() {
  const { account, isActive } = useWeb3React()
  const walletFinishedLoading = useDebounce(isActive, 600)
  const dispatch = useAppDispatch()
  const { isRegistered } = useIsRegisteredWithViolet({ ethereumAddress: account })
  const alreadyRegistered = useIsUserRegisteredWithViolet()

  const [keepOpen, setKeepOpen] = useState(false)
  const [peruseAppWithoutWallet, setPeruseAppWithoutWallet] = useState(false)

  const saveRegistrationStatus = useCallback(() => {
    // now we have seen this wallet for the first time, save the registration status
    if (account) dispatch(updateRegistrationState({ address: account, registrationState: isRegistered ?? undefined }))
  }, [account, isRegistered, dispatch])

  const dismissModal = () => {
    saveRegistrationStatus()
    if (!account && walletFinishedLoading) {
      setPeruseAppWithoutWallet(true)
    }
  }

  // if account change is detected and user has been perusing app without wallet, reset that state
  useEffect(() => {
    if (account && walletFinishedLoading && peruseAppWithoutWallet) setPeruseAppWithoutWallet(false)
  }, [account, walletFinishedLoading, setPeruseAppWithoutWallet])

  // Shows the enroll modal under these conditions:
  // * This is the first time we are seeing the wallet and it is not enrolled
  // * User switches to a new wallet that is also not enrolled
  // * Wallet has not been connected yet
  //
  // All other cases the modal should not be shown including:
  // * The account is currently being loaded
  // * The user is not enrolled but we have seen this wallet before
  // * The user is enrolled
  const showModal = useMemo(() => {
    // if there is no connected wallet...
    if (!account) {
      // do not show modal if we have not finished attempting to load wallet from provider
      if (!walletFinishedLoading) return false

      // do not show modal if the user has dismissed the modal whilst having no wallet connected
      if (peruseAppWithoutWallet) return false

      // show modal
      return true
    }

    // do not show modal if we have already seen this wallet before
    if (alreadyRegistered !== undefined) return false

    // do not show modal if this newly seen wallet is registered with violet and save
    if (isRegistered) {
      saveRegistrationStatus()
      return false
    }

    // otherwise show modal
    return true
  }, [account, walletFinishedLoading, alreadyRegistered, isRegistered, peruseAppWithoutWallet, saveRegistrationStatus])

  return (
    <Modal isOpen={keepOpen || showModal} onDismiss={dismissModal} maxWidth={350}>
      <VioletEnroll onClose={dismissModal} keepModalOpen={setKeepOpen} />
    </Modal>
  )
}
