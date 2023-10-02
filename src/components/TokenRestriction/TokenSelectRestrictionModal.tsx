import { ButtonLight } from 'components/Button'
import { TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import Modal from '../Modal'
import TokenRestrictionMessage from './TokenRestrictionMessage'

const StyledButton = styled(ButtonLight)`
  background-color: rgba(255, 255, 255, 0.7);
  border: 0px solid ${({ theme }) => theme.backgroundContrast};
  border-radius: ${20}px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  padding: 10px 16px;
  margin: 10px 0 0 0;
  text-align: center;
`

const StyledLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.textSecondary};
  width: 100%;
  text-align: center;
  padding: 25px 0 0 0;
  font-weight: 500;
  font-size: 11px;
`

export default function TokenSelectRestrictionModal({
  isOpen,
  onCancel,
  restriction,
}: {
  isOpen: boolean
  onCancel: (understood: boolean) => void
  restriction: TOKEN_RESTRICTION_TYPE
}) {
  const buttons = (
    <>
      <StyledButton onClick={() => onCancel(true)}>I understand</StyledButton>
      <StyledLink onClick={() => onCancel(false)}>
        Select a different token
      </StyledLink>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={() => {
        onCancel(false)
      }}
      hideBorder
    >
      <TokenRestrictionMessage restriction={restriction} content={buttons} />
    </Modal>
  )
}
