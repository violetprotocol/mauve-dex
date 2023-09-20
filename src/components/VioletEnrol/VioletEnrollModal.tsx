import { useWeb3React } from '@web3-react/core'
import Modal from '../Modal'
import VioletEnroll from './VioletEnroll'
import { useIsRegisteredWithViolet } from 'utils/temporary/useIsRegistered'
import { useAppDispatch } from 'state/hooks'
import { useCallback, useMemo } from 'react'
import { useIsUserRegisteredWithViolet } from 'state/registration/hooks'
import { updateRegistrationState } from 'state/registration/reducer'

export default function VioletEnrollModal() {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const { isRegistered }  = useIsRegisteredWithViolet({ethereumAddress: account})
  const alreadyRegistered  = useIsUserRegisteredWithViolet()

  // Shows the enroll modal under these conditions:
  // * This is the first time we are seeing the wallet and it is not enrolled
  // * User switches to a new wallet that is also not enrolled
  // 
  // All other cases the modal should not be shown including:
  // * The account cannot be loaded from web3
  // * The user is not enrolled but we have seen this wallet before
  const showModal = useMemo(
    () => {
      // do not show modal if we cannot resolve the currently connect account
      if (!account) return false

      // do not show modal if we have already seen this wallet before
      if (alreadyRegistered !== undefined) return false

      // do not show modal if this newly seen wallet is registered with violet
      if (isRegistered) {
        return false
      }

      // otherwise show modal
      return true
    },
    [account, alreadyRegistered, dispatch]
  )

  const saveRegistrationStatus = useCallback(() => {
      // now we have seen this wallet for the first time, save the registration status
      if (account) dispatch(updateRegistrationState({ address: account, registrationState: isRegistered ?? undefined }))
  }, [account, isRegistered])

  return (
    <Modal isOpen={showModal} onDismiss={saveRegistrationStatus} maxWidth={350}>
      <VioletEnroll onClose={saveRegistrationStatus}/>
    </Modal>
  )
}
