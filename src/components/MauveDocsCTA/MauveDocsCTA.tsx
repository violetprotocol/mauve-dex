import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink, HideSmall } from 'theme'

import { AutoRow } from '../Row'

const MAUVE_DOCS_URL = 'https://docs.mauve.org'

const BodyText = styled.div`
  color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px;
  font-size: 14px;
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
  font-weight: 600;
  font-size: 16px;
  margin: 0;
  margin-bottom: 8px;
`

const LinkOutToDocs = styled(ExternalLink)`
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
        <LinkOutToDocs href={MAUVE_DOCS_URL}>
          <BodyText>
            <AutoRow>
              <Header>
                <>Mauve is a compliant DEX</>
              </Header>
              <HideSmall>
                <>Identity verification through Violet is required.</>
              </HideSmall>
            </AutoRow>
          </BodyText>
          <StyledArrowUpRight />
        </LinkOutToDocs>
      </ContentWrapper>
    </RootWrapper>
  )
}

export { MauveDocsCTA }
