import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary, ButtonText, VioletProtectedButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { getVioletEnrollmentCall } from 'hooks/useVioletAuthorize'
import { Text } from 'rebass'
import styled from 'styled-components'
import { logErrorWithNewRelic } from 'utils/newRelicErrorIngestion'


const Wrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
`

const Container = styled.div`
  width: 100%;
  padding: 32px 50px;
  display: flex;
  flex-flow: column;
  align-items: center;
`

const LogoContainer = styled.div`
  display: flex;
  gap: 16px;
`

const ShortColumn = styled(AutoColumn)`
  margin-top: 10px;
`

const InfoText = styled(Text)`
  padding: 0 12px 0 12px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`

const StyledButton = styled(ButtonPrimary)`
  margin-top: 24px;
  width: 100%;
  font-weight: 600;
`

const StyledCancelButton = styled(ButtonText)`
  margin-top: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 600;
  font-size: 14px;
`

const StyledCloseButton = styled(StyledButton)`
  background-color: ${({ theme }) => theme.backgroundInteractive};
  color: ${({ theme }) => theme.textPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.backgroundInteractive};
    opacity: ${({ theme }) => theme.opacity.hover};
    transition: opacity 250ms ease;
  }
`

export default function VioletEnroll({onClose} : {onClose: () => void} ) {
  const { account, chainId } = useWeb3React()
  
  const onEnrol = async () => {
    const violetEnrollResult = await getVioletEnrollmentCall({
      account,
      chainId,
    })

    if (!violetEnrollResult) {
      console.error(`Failed to enroll user`)
      logErrorWithNewRelic({ errorString: 'Failed to enroll user' })
      return
    }
  }

  return (
    <Wrapper>
    <Container>
      {/* <ShortColumn>
        <InfoText>
          {heading} {description} {learnMoreUrl}
        </InfoText>
      </ShortColumn>
      <LinkColumn>{urls}</LinkColumn> */}
      <VioletProtectedButtonPrimary onClick={onEnrol}>
        <Text fontWeight={500} fontSize={20}>
          <>Register with Violet</>
        </Text>
      </VioletProtectedButtonPrimary>
      <StyledCancelButton onClick={onClose}>Dismiss</StyledCancelButton>
    </Container>
  </Wrapper>
  )
}

