// import { useWeb3React } from '@web3-react/core'
// import AddressClaimModal from 'components/claim/AddressClaimModal'
// import useAccountRiskCheck from 'hooks/useAccountRiskCheck'

// [MAUVE-DISABLED]
// const AirdropModal = lazy(() => import('components/AirdropModal'))

export default function TopLevelModals() {
  // const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  // const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  // const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  // const { account } = useWeb3React()
  // useAccountRiskCheck(account)
  // const accountBlocked = Boolean(blockedAccountModalOpen && account)

  return (
    <>
      {/* // [MAUVE-DISABLED] */}
      {/* <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} /> */}
      {/* <ConnectedAccountBlocked account={account} isOpen={accountBlocked} /> */}
      {/* <AirdropModal /> */}
    </>
  )
}
