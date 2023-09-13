import { Currency } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedL2ChainId } from 'constants/chains'
import { useVioletEAT } from 'hooks/useVioletSwapEAT'
import { ReactNode, SVGProps, useEffect } from 'react'
import { AlertCircle, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { useIsTransactionConfirmed, useTransaction } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { useIsRegisteredWithViolet } from 'utils/temporary/useIsRegistered'
import { VioletEmbeddedAuthorizationWrapper } from 'utils/temporary/violetStuffThatShouldBeImported/violetEmbeddedAuthorization'

import Circle from '../../assets/images/blue-loader.svg'
import { ExternalLink, ThemedText } from '../../theme'
import { CloseIcon, CustomLightSpinner } from '../../theme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { TransactionSummary } from '../AccountDetails/TransactionSummary'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Modal from '../Modal'
import { RowBetween, RowFixed } from '../Row'
import AnimatedConfirmation from './AnimatedConfirmation'

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 20px;
  outline: 1px solid ${({ theme }) => theme.backgroundOutline};
  width: 100%;
  padding: 1rem;
`
const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '0' : '0')};
`

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  padding-bottom: 10px;
`

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

const VioletAuthorizedWrapper = styled.div<{ isRegistered: boolean | null | undefined }>`
  display: flex;
  justify-content: ${(props) => (props.isRegistered ? 'space-between' : 'center')};
  align-items: center;
  width: 100%;
  padding: 8px;
`

const VioletAuthorizedColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const VerifiedIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle opacity="0.12" cx="7.99967" cy="7.99992" r="6.66667" fill="#12C97B" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.83398 8.00016C1.83398 4.59441 4.5949 1.8335 8.00065 1.8335C11.4064 1.8335 14.1673 4.59441 14.1673 8.00016C14.1673 11.4059 11.4064 14.1668 8.00065 14.1668C4.5949 14.1668 1.83398 11.4059 1.83398 8.00016ZM8.00065 0.833496C4.04261 0.833496 0.833984 4.04212 0.833984 8.00016C0.833984 11.9582 4.04261 15.1668 8.00065 15.1668C11.9587 15.1668 15.1673 11.9582 15.1673 8.00016C15.1673 4.04212 11.9587 0.833496 8.00065 0.833496ZM11.0209 6.35372C11.2161 6.15845 11.2161 5.84187 11.0209 5.64661C10.8256 5.45135 10.509 5.45135 10.3138 5.64661L7.33398 8.62639L6.3542 7.64661C6.15894 7.45135 5.84236 7.45135 5.6471 7.64661C5.45184 7.84187 5.45184 8.15845 5.6471 8.35372L6.98043 9.68705C7.0742 9.78082 7.20138 9.8335 7.33398 9.8335C7.46659 9.8335 7.59377 9.78082 7.68754 9.68705L11.0209 6.35372Z"
        fill="#12C97B"
      />
    </svg>
  )
}

const VioletBadgeWrapper = styled.div`
  border-radius: 99999px;
  background-color: #e5e5e5;
  padding: 8px 12px;
  font-size: 11px;
`

const VioletIcon = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #a73cfd;
  display: inline-block;
  margin-left: 4px;
`

const VioletIdWrapper = styled.span`
  font-weight: bold;
  display: inline-flex;
  gap: 4px;
  align-items: center;
`

const VioletBadge = () => {
  return (
    <VioletBadgeWrapper>
      <span>
        Powered by <VioletIcon /> <VioletIdWrapper>Violet ID</VioletIdWrapper>
      </span>
    </VioletBadgeWrapper>
  )
}

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  inline?: boolean // not in modal
}) {
  const theme = useTheme()

  return (
    <Wrapper>
      <AutoColumn gap="md">
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
        </ConfirmedIcon>
        <AutoColumn gap="md" justify="center">
          <Text fontWeight={500} fontSize={20} color={theme.textPrimary} textAlign="center">
            <>Waiting for confirmation</>
          </Text>
          <Text fontWeight={600} fontSize={16} color={theme.textPrimary} textAlign="center">
            {pendingText}
          </Text>
          <Text fontWeight={400} fontSize={12} color={theme.textSecondary} textAlign="center" marginBottom="12px">
            <>Confirm this transaction in your wallet</>
          </Text>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} data-cy="confirmation-close-icon" />
        </RowBetween>
        {topContent()}
      </Section>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: ReactNode; onDismiss: () => void }) {
  const theme = useTheme()
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={600} fontSize={16}>
            <>Error</>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.accentCritical} style={{ strokeWidth: 1 }} size={90} />
          <ThemedText.MediumHeader textAlign="center">{message}</ThemedText.MediumHeader>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>
          <>Dismiss</>
        </ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

function L2Content({
  onDismiss,
  chainId,
  hash,
  pendingText,
  inline,
  isRegistered,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: SupportedL2ChainId
  currencyToAdd?: Currency | undefined
  pendingText: ReactNode
  inline?: boolean // not in modal
  isRegistered?: boolean | null
}) {
  const theme = useTheme()

  const transaction = useTransaction(hash)
  const confirmed = useIsTransactionConfirmed(hash)
  const transactionSuccess = transaction?.receipt?.status === 1

  // convert unix time difference to seconds
  const secondsToConfirm = transaction?.confirmedTime
    ? (transaction.confirmedTime - transaction.addedTime) / 1000
    : undefined

  const info = getChainInfo(chainId)

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween mb="16px">
            <Badge>
              <RowFixed>
                <StyledLogo src={info.logoUrl} style={{ margin: '0 8px 0 0' }} />
                {info.label}
              </RowFixed>
            </Badge>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          {confirmed ? (
            transactionSuccess ? (
              // <CheckCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.accentSuccess} />
              <AnimatedConfirmation />
            ) : (
              <AlertCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.accentFailure} />
            )
          ) : (
            <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
          )}
        </ConfirmedIcon>
        <AutoColumn gap="md" justify="center">
          <Text fontWeight={500} fontSize={20} textAlign="center">
            {!hash ? (
              <>Confirm transaction in wallet</>
            ) : !confirmed ? (
              <>Transaction Submitted</>
            ) : transactionSuccess ? (
              <>Success</>
            ) : (
              <>Error</>
            )}
          </Text>
          <Text fontWeight={400} fontSize={16} textAlign="center">
            {transaction ? <TransactionSummary info={transaction.info} /> : pendingText}
          </Text>
          {chainId && hash ? (
            <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
              <Text fontWeight={500} fontSize={14} color={theme.accentAction}>
                <>View on Explorer</>
              </Text>
            </ExternalLink>
          ) : (
            <div style={{ height: '17px' }} />
          )}
          <Text color={theme.textTertiary} style={{ margin: '20px 0 0 0' }} fontSize="14px">
            {!secondsToConfirm ? (
              <div style={{ height: '24px' }} />
            ) : (
              <div>
                <>Transaction completed in </>
                <span
                  style={{
                    fontWeight: 500,
                    marginLeft: '4px',
                    color: theme.textPrimary,
                  }}
                >
                  {secondsToConfirm} seconds 🎉
                </span>
              </div>
            )}
          </Text>

          <VioletAuthorizedWrapper isRegistered={isRegistered}>
            <VioletAuthorizedColumn>
              {isRegistered ? (
                <>
                  <VerifiedIcon /> <span>Registered</span>
                </>
              ) : null}
            </VioletAuthorizedColumn>

            <VioletAuthorizedColumn>
              <VioletBadge />
            </VioletAuthorizedColumn>
          </VioletAuthorizedWrapper>
          <ButtonPrimary onClick={onDismiss} style={{ margin: '4px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? <>Return</> : <>Close</>}
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => ReactNode
  attemptingTxn: boolean
  pendingText: ReactNode
  currencyToAdd?: Currency | undefined
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
}: ConfirmationModalProps) {
  const { chainId, account } = useWeb3React()
  const eatPayload = useVioletEAT((state) => state.eatPayload)
  const { setAuthorizeProps, onIssued, onFailed, authorizeProps, triggerPopup } = useVioletEAT()
  const { isRegistered, updateUserIsRegistered } = useIsRegisteredWithViolet({ ethereumAddress: account })

  useEffect(() => {
    if (account && chainId && eatPayload.status === 'authorizing') {
      if (isRegistered) {
        setAuthorizeProps({ account, chainId })
      } else {
        triggerPopup({ account, chainId }, updateUserIsRegistered)
      }
    }
  }, [account, chainId, setAuthorizeProps, eatPayload.status, triggerPopup, isRegistered, updateUserIsRegistered])

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} $scrollOverlay={true} onDismiss={onDismiss} maxHeight={90}>
      {eatPayload.status === 'authorizing' && !!authorizeProps && isRegistered ? (
        <VioletEmbeddedAuthorizationWrapper authorizeProps={authorizeProps} onIssued={onIssued} onFailed={onFailed} />
      ) : hash || attemptingTxn ? (
        <L2Content
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          pendingText={pendingText}
          isRegistered={isRegistered}
        />
      ) : attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : (
        content()
      )}
    </Modal>
  )
}
