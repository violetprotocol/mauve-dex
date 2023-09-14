import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'
import { MAUVE_DISCORD_LINK } from 'utils/temporary/generateEAT'

import { AutoRow } from '../Row'

const BodyText = styled.div`
  color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px;
  font-size: 12px;
`
const RootWrapper = styled.div`
  position: relative;
  margin-top: 16px;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`
const Header = styled.h2`
  font-weight: 800;
  font-size: 16px;
  margin: 0;
  margin-bottom: 8px;
`

const LinkOutToVioletDiscord = styled(ExternalLink)`
  align-items: center;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.backgroundPrimary};
  display: flex;
  font-size: 16px;
  justify-content: space-between;
  padding: 1rem;
  text-decoration: none !important;
  width: 100%;
`

const StyledArrowUpRight = styled(ArrowUpRight)`
  margin-left: 12px;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.white};
`

const Content = styled.p`
  margin: 0;
`

const VioletCTA = () => {
  return (
    <RootWrapper>
      <ContentWrapper>
        <LinkOutToVioletDiscord href={MAUVE_DISCORD_LINK}>
          <BodyText>
            <AutoRow>
              <Header>
                <>Mauve is a compliant DEX</>
              </Header>

              <Content>
                Identity verification through Violet is required. If you are experiencing any problems, click here to
                contact us on <b>Discord</b>.
              </Content>
            </AutoRow>
          </BodyText>
          <StyledArrowUpRight />
        </LinkOutToVioletDiscord>
      </ContentWrapper>
    </RootWrapper>
  )
}

export { VioletCTA }
