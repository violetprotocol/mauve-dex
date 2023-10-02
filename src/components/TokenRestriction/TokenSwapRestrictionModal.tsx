import { ButtonError, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { WARNING_LEVEL } from 'constants/tokenSafety'
import { useTokenWarningColor, useTokenWarningTextColor } from 'hooks/useTokenWarningColor'
import { Slash } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import Modal from '../Modal'

const SwapButton = styled(ButtonError)`
  border-radius: ${20}px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  padding: 10px 16px;
  margin: 10px 0 0 0;
  text-align: center;
`
const ReviewButton = styled(ButtonPrimary)`
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

const Label = styled.div<{ color: string; backgroundColor: string }>`
  width: 100%;
  padding: 20px 20px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 16px;
  color: ${({ color }) => color};
`

const TitleRow = styled.div`
  align-items: center;
  font-weight: 700;
  display: inline-flex;
`

const Title = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin-left: 7px;
`

const DetailsRow = styled.div`
  margin: 10px 10px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

export default function TokenSwapRestrictionModal({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const backgroundColor = useTokenWarningColor(WARNING_LEVEL.BLOCKED)
  const textColor = useTokenWarningTextColor(WARNING_LEVEL.BLOCKED)

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={() => {
        onCancel()
      }}
      hideBorder
    >
      <Label color={textColor} backgroundColor={backgroundColor}>
        <TitleRow>
          <Slash size="16px" />
          <Title marginLeft="7px">Transaction will fail </Title>
        </TitleRow>

        <DetailsRow>
          {' '}
          <b>You are missing identity verification required by one or more tokens.</b>{' '}
        </DetailsRow>
        <DetailsRow>
          {' '}
          Executing the transaction in the current state will cause the transaction to fail. Please return to review
          your transaction.{' '}
        </DetailsRow>
        <AutoColumn>
          <SwapButton tabIndex={-1} onClick={onConfirm} error>
            Swap Anyway
          </SwapButton>
          <ReviewButton tabIndex={-1} onClick={onCancel}>
            Review Transaction
          </ReviewButton>
        </AutoColumn>
      </Label>
    </Modal>
  )
}
