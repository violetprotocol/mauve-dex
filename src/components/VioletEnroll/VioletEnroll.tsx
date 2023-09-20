import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary, VioletProtected } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { getVioletEnrollmentCall } from 'hooks/useVioletAuthorize'
import { MauveIcon } from 'nft/components/icons'
import { useState } from 'react'
import { ArrowRight } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'
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
  padding: 32px 32px 25px 32px;
  display: flex;
  flex-flow: column;
  align-items: center;
`

const Label = styled.div<{ color: string; backgroundColor: string }>`
  width: 100%;
  padding: 5px 5px 15px;
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
  font-size: 18px;
  line-height: 24px;
  margin-left: 7px;
`

const DetailsRow = styled.div`
  margin-top: 8px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

const StyledLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 700;
`

const ShortColumn = styled(AutoColumn)`
  margin-bottom: 10px;
`

const StyledButton = styled(ButtonPrimary)`
  margin-top: 24px;
  width: 100%;
  font-weight: 600;
`

const StyledCloseButton = styled(StyledButton)`
  background-color: ${({ theme }) => theme.backgroundInteractive};
  color: ${({ theme }) => theme.textPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.backgroundInteractive};
    opacity: ${({ theme }) => theme.opacity.hover};
    transition: opacity 250ms ease;
  }
  padding: 8px;
`

const RegisterButton = styled(VioletProtected(ButtonPrimary, 'backgroundContrast', '0.2rem'))`
  padding: 10px;
`

export default function VioletEnroll({
  onClose,
  keepModalOpen,
}: {
  onClose: () => void
  keepModalOpen: (open: boolean) => void
}) {
  const { account, chainId } = useWeb3React()
  // const [noShow, setNoShow] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [enrollmentResult, setEnrollmentResult] = useState<string>('')

  const onEnroll = async () => {
    setRegistering(true)
    keepModalOpen(true)
    const violetEnrollResult = await getVioletEnrollmentCall({
      account,
      chainId,
    })

    if (!violetEnrollResult) {
      console.error(`Failed to enroll user`)
      logErrorWithNewRelic({ errorString: 'Failed to enroll user' })
      return
    }

    setEnrollmentResult(violetEnrollResult)
    setRegistering(false)
  }

  // const handleToggleNoShow = () => {
  //   setNoShow(!noShow)
  // }

  return (
    <Wrapper>
      <Container>
        {enrollmentResult ? (
          <Label color="black" backgroundColor="light-grey">
            <TitleRow>
              <Title paddingRight="8px">Identity Verified! 🎉</Title>
            </TitleRow>

            <DetailsRow>You can now safely continue using Mauve.</DetailsRow>
          </Label>
        ) : (
          <>
            <Label color="black" backgroundColor="light-grey">
              <TitleRow>
                <Title paddingRight="8px">Welcome to Mauve</Title>
                <MauveIcon width={30} />
              </TitleRow>

              <DetailsRow>Mauve is a compliant DEX that requires identity verification with Violet.</DetailsRow>
            </Label>
            <RegisterButton onClick={onEnroll} disabled={registering}>
              <Text fontWeight={600} fontSize={15}>
                {registering ? <>Registering...</> : enrollmentResult ? <>Registered!</> : <>Register with Violet</>}
              </Text>
            </RegisterButton>
            <ShortColumn>
              <DetailsRow style={{fontSize: '11px'}}>
                <StyledLink href="https://docs.mauve.org">Learn more</StyledLink>
              </DetailsRow>
            </ShortColumn>
          </>
        )}

        <StyledCloseButton
          onClick={() => {
            onClose()
            keepModalOpen(false)
          }}
        >
          <Text fontWeight={600} fontSize={12}>
            <>Continue to App</>
          </Text>
          <ArrowRight size={16} style={{ flex: 'end' }} />
        </StyledCloseButton>

        {/* <ShortColumn>
          <Toggle toggle={handleToggleNoShow} isActive={noShow}/>
        </ShortColumn> */}
      </Container>
    </Wrapper>
  )
}
