// [MAUVE-DISABLED]
export {}
// import styled, { DefaultTheme } from 'styled-components/macro'

// import { ProposalState } from '../../state/governance/hooks'

// const handleColorType = (status: ProposalState, theme: DefaultTheme) => {
//   switch (status) {
//     case ProposalState.PENDING:
//     case ProposalState.ACTIVE:
//       return theme.accentAction
//     case ProposalState.SUCCEEDED:
//     case ProposalState.EXECUTED:
//       return theme.accentSuccess
//     case ProposalState.DEFEATED:
//       return theme.accentFailure
//     case ProposalState.QUEUED:
//     case ProposalState.CANCELED:
//     case ProposalState.EXPIRED:
//     default:
//       return theme.textTertiary
//   }
// }

// function StatusText({ status }: { status: ProposalState }) {
//   switch (status) {
//     case ProposalState.PENDING:
//       return <>Pending</>
//     case ProposalState.ACTIVE:
//       return <>Active</>
//     case ProposalState.SUCCEEDED:
//       return <>Succeeded</>
//     case ProposalState.EXECUTED:
//       return <>Executed</>
//     case ProposalState.DEFEATED:
//       return <>Defeated</>
//     case ProposalState.QUEUED:
//       return <>Queued</>
//     case ProposalState.CANCELED:
//       return <>Canceled</>
//     case ProposalState.EXPIRED:
//       return <>Expired</>
//     default:
//       return <>Undetermined</>
//   }
// }

// const StyledProposalContainer = styled.span<{ status: ProposalState }>`
//   font-size: 0.825rem;
//   font-weight: 600;
//   padding: 0.5rem;
//   border-radius: 8px;
//   color: ${({ status, theme }) => handleColorType(status, theme)};
//   border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
//   width: fit-content;
//   justify-self: flex-end;
//   text-transform: uppercase;
//   flex: 0 0 100px;
//   text-align: center;
// `

// export function ProposalStatus({ status }: { status: ProposalState }) {
//   return (
//     <StyledProposalContainer status={status}>
//       <StatusText status={status} />
//     </StyledProposalContainer>
//   )
// }
