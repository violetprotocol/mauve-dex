import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary, ButtonText, VioletProtectedButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { getVioletEnrolmentCall } from 'hooks/useVioletAuthorize'
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

export default function VioletEnrol() {
  const { account, chainId } = useWeb3React()
  
  const onEnrol = async () => {
    const violetEnrolResult = await getVioletEnrolmentCall({
      account,
      chainId,
    })

    if (!violetEnrolResult) {
      console.error(`Failed to enrol user`)
      logErrorWithNewRelic({ errorString: 'Failed to enrol user' })
      return
    }
  }

  return (
    <Wrapper>
    <Container>
      <VioletProtectedButtonPrimary onClick={onEnrol}>
        <Text fontWeight={500} fontSize={20}>
          <>Register with Violet</>
        </Text>
      </VioletProtectedButtonPrimary>
    </Container>
  </Wrapper>
  )
}

