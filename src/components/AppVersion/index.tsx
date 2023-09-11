import { RowFixed } from 'components/Row'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { isProductionEnv } from 'utils/env'

const StyledAppVersion = styled.div`
  align-items: center;
  bottom: 0;
  color: ${({ theme }) => theme.textTertiary};
  display: none;
  padding: 1rem;
  position: fixed;
  left: 0;
  transition: 250ms ease color;

  a {
    color: unset;
  }
  a:hover {
    color: unset;
    text-decoration: none;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: flex;
  }
`
const StyledAppVersionNumber = styled(ThemedText.DeprecatedSmall)<{
  hovering: boolean
}>`
  color: ${({ theme }) => theme.accentAction};
  transition: opacity 0.25s ease;
  opacity: ${({  hovering }) => (hovering ? 1 : 0)};
  :hover {
    opacity: 1;
  }

  a {
    color: unset;
  }
  a:hover {
    text-decoration: none;
    color: unset;
  }
`

export default function AppVersion() {
  const [isHover, setIsHover] = useState(false)

  const isProduction = isProductionEnv()
  const appVersionNumber = process?.env?.REACT_APP_VERSION

  return isProduction || !appVersionNumber ? null : (
    <RowFixed>
      <StyledAppVersion onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
        <StyledAppVersionNumber hovering={isHover}>
          {appVersionNumber}
        </StyledAppVersionNumber>
      </StyledAppVersion>
    </RowFixed>
  )
}
