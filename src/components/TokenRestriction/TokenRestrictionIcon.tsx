import { TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { Warning, WARNING_LEVEL } from 'constants/tokenSafety'
import { AlertTriangle, Slash } from 'react-feather'
import styled, { css } from 'styled-components/macro'

const WarningContainer = styled.div`
  margin-left: 4px;
  display: flex;
  justify-content: center;
`

const WarningIconStyle = css<{ size?: string }>`
  width: ${({ size }) => size ?? '1em'};
  height: ${({ size }) => size ?? '1em'};
`

const WarningIcon = styled(AlertTriangle)`
  ${WarningIconStyle};
  color: ${({ theme }) => theme.textTertiary};
`

const BlockedIcon = styled(Slash)`
  ${WarningIconStyle}
  color: ${({ theme }) => theme.textSecondary};
`

export default function TokenRestrictionIcon({ restriction }: { restriction: TOKEN_RESTRICTION_TYPE | null }) {
  switch (restriction) {
    case TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR:
      return (
        <WarningContainer>
          <BlockedIcon strokeWidth={2.5} />
        </WarningContainer>
      )
    default:
      return null
  }
}
