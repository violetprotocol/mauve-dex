import { Percent } from '@violetprotocol/mauve-sdk-core'
import { ReactNode } from 'react'
import { ArrowLeft } from 'react-feather'
import { Link as HistoryLink, useLocation } from 'react-router-dom'
import { Box } from 'rebass'
import { useAppDispatch } from 'state/hooks'
import { resetMintState } from 'state/mint/actions'
import { resetMintState as resetMintV3State } from 'state/mint/v3/actions'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { flexRowNoWrap } from 'theme/styles'

import { RowBetween } from '../Row'
import SettingsTab from '../Settings'

const Tabs = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const StyledHistoryLink = styled(HistoryLink)<{ flex: string | undefined }>`
  flex: ${({ flex }) => flex ?? 'none'};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    flex: none;
    margin-right: 10px;
  `};
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.textPrimary};
`

export function AddRemoveTabs({
  adding,
  creating,
  defaultSlippage,
  positionID,
  children,
}: {
  adding: boolean
  creating: boolean
  defaultSlippage: Percent
  positionID?: string | undefined
  showBackLink?: boolean
  children?: ReactNode | undefined
}) {
  const theme = useTheme()
  // reset states on back
  const dispatch = useAppDispatch()
  const location = useLocation()

  // detect if back should redirect to v3 or v2 pool page
  const poolLink = location.pathname.includes('add/v2')
    ? '/pool/v2'
    : '/pool' + (positionID ? `/${positionID.toString()}` : '')

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <StyledHistoryLink
          to={poolLink}
          onClick={() => {
            if (adding) {
              // not 100% sure both of these are needed
              dispatch(resetMintState())
              dispatch(resetMintV3State())
            }
          }}
          flex={children ? '1' : undefined}
        >
          <StyledArrowLeft stroke={theme.textSecondary} />
        </StyledHistoryLink>
        <ThemedText.DeprecatedMediumHeader
          fontWeight={500}
          fontSize={20}
          style={{ flex: '1', margin: 'auto', textAlign: children ? 'start' : 'center' }}
        >
          {creating ? <>Create a pair</> : adding ? <>Add Liquidity</> : <>Remove Liquidity</>}
        </ThemedText.DeprecatedMediumHeader>
        <Box style={{ marginRight: '.5rem' }}>{children}</Box>
        <SettingsTab placeholderSlippage={defaultSlippage} />
      </RowBetween>
    </Tabs>
  )
}

// [MAUVE-DISABLED]
// export function CreateProposalTabs() {
//   return (
//     <Tabs>
//       <Row style={{ padding: '1rem 1rem 0 1rem' }}>
//         <HistoryLink to="/vote">
//           <StyledArrowLeft />
//         </HistoryLink>
//         <ActiveText style={{ marginLeft: 'auto', marginRight: 'auto' }}>Create Proposal</ActiveText>
//       </Row>
//     </Tabs>
//   )
// }
