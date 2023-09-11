import { Connector } from '@web3-react/types'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

import Loader from '../Loader'

const PendingSection = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const WaitingToConnectSection = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`

const AlertTriangleIcon = styled(AlertTriangle)`
  width: 25%;
  height: 25%;
  stroke-width: 1;
  padding-bottom: 2rem;
  color: ${({ theme }) => theme.accentCritical};
`

const LoaderContainer = styled.div`
  ${flexRowNoWrap};
  margin: 16px 0;
  align-items: center;
  justify-content: center;
`

const LoadingMessage = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const LoadingWrapper = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
`

export default function PendingView({
  connector,
  error = false,
  tryActivation,
  openOptions,
}: {
  connector: Connector
  error?: boolean
  tryActivation: (connector: Connector) => void
  openOptions: () => void
}) {
  return (
    <PendingSection>
      <LoadingMessage>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <AlertTriangleIcon />
              <ThemedText.MediumHeader marginBottom={12}>
                <>Error connecting</>
              </ThemedText.MediumHeader>
              <ThemedText.BodyPrimary fontSize={16} marginBottom={36} textAlign="center">
                <>
                  The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
                </>
              </ThemedText.BodyPrimary>
              <ButtonPrimary
                $borderRadius="12px"
                onClick={() => {
                  tryActivation(connector)
                }}
              >
                <>Try Again</>
              </ButtonPrimary>
              <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
                <ThemedText.Link onClick={openOptions}>
                  <>Back to wallet selection</>
                </ThemedText.Link>
              </ButtonEmpty>
            </ErrorGroup>
          ) : (
            <>
              <WaitingToConnectSection>
                <LoaderContainer style={{ padding: '16px 0px' }}>
                  <Loader strokeWidth={0.8} size="100px" />
                </LoaderContainer>
                <ThemedText.MediumHeader>
                  <>Waiting to connect</>
                </ThemedText.MediumHeader>
                <ThemedText.BodyPrimary style={{ paddingTop: '8px' }}>
                  <>Confirm this connection in your wallet</>
                </ThemedText.BodyPrimary>
              </WaitingToConnectSection>
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  )
}
