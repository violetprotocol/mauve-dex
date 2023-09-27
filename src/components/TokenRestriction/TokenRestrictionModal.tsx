import { TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'

import Modal from '../Modal'
import TokenRestrictionMessage from './TokenRestrictionMessage'

export default function TokenRestrictionModal({
  isOpen,
  onCancel,
  restriction,
}: {
  isOpen: boolean
  onCancel: () => void
  restriction: TOKEN_RESTRICTION_TYPE
}) {
  return (
    <Modal isOpen={isOpen} onDismiss={onCancel} hideBorder>
      <TokenRestrictionMessage restriction={restriction} />
    </Modal>
  )
}
