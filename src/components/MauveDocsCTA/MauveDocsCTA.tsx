import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import { AutoRow } from '../Row'

const VIOLET_DISCORD_INVITE_URL = 'https://discord.com/invite/hRJpPQtKSh'

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

const MauveDocsCTA = () => {
  return (
    <RootWrapper>
      <ContentWrapper>
        <LinkOutToVioletDiscord href={VIOLET_DISCORD_INVITE_URL}>
          <BodyText>
            <AutoRow>
              <Header>
                <>Mauve is a compliant DEX</>
              </Header>

              <>
                Identity verification through Violet is required. If you are experiencing any problems, contact us on
                Discord.
              </>
            </AutoRow>
          </BodyText>
          <StyledArrowUpRight />
        </LinkOutToVioletDiscord>
      </ContentWrapper>
    </RootWrapper>
  )
}

export { MauveDocsCTA }
