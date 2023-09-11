// [MAUVE-DISABLED]
export {}
// import { useWeb3React } from '@web3-react/core'
// import { useState } from 'react'
// import { ArrowUpCircle, X } from 'react-feather'
// import styled, { useTheme } from 'styled-components/macro'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

// import Circle from '../../assets/images/blue-loader.svg'
// import { useUserVotes, useVoteCallback } from '../../state/governance/hooks'
// import { VoteOption } from '../../state/governance/types'
// import { CustomLightSpinner, ThemedText } from '../../theme'
// import { ExternalLink } from '../../theme'
// import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
// import { ButtonPrimary } from '../Button'
// import { AutoColumn, ColumnCenter } from '../Column'
// import Modal from '../Modal'
// import { RowBetween } from '../Row'

// const ContentWrapper = styled(AutoColumn)`
//   width: 100%;
//   padding: 24px;
// `

// const StyledClosed = styled(X)`
//   :hover {
//     cursor: pointer;
//   }
// `

// const ConfirmOrLoadingWrapper = styled.div`
//   width: 100%;
//   padding: 24px;
// `

// const ConfirmedIcon = styled(ColumnCenter)`
//   padding: 60px 0;
// `

// interface VoteModalProps {
//   isOpen: boolean
//   onDismiss: () => void
//   voteOption: VoteOption | undefined
//   proposalId: string | undefined // id for the proposal to vote on
// }

// export default function VoteModal({ isOpen, onDismiss, proposalId, voteOption }: VoteModalProps) {
//   const { chainId } = useWeb3React()
//   const voteCallback = useVoteCallback()
//   const { votes: availableVotes } = useUserVotes()

//   // monitor call to help UI loading state
//   const [hash, setHash] = useState<string | undefined>()
//   const [attempting, setAttempting] = useState<boolean>(false)

//   // get theme for colors
//   const theme = useTheme()

//   // wrapper to reset state on modal close
//   function wrappedOnDismiss() {
//     setHash(undefined)
//     setAttempting(false)
//     onDismiss()
//   }

//   async function onVote() {
//     setAttempting(true)

//     // if callback not returned properly ignore
//     if (!voteCallback || voteOption === undefined) return

//     // try delegation and store hash
//     const hash = await voteCallback(proposalId, voteOption)?.catch((error) => {
//       setAttempting(false)
//       console.log(error)
//     })

//     if (hash) {
//       setHash(hash)
//     }
//   }

//   return (
//     <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
//       {!attempting && !hash && (
//         <ContentWrapper gap="lg">
//           <AutoColumn gap="lg" justify="center">
//             <RowBetween>
//               <ThemedText.DeprecatedMediumHeader fontWeight={500}>
//                 {voteOption === VoteOption.Against ? (
//                   <>Vote against proposal {proposalId}</>
//                 ) : voteOption === VoteOption.For ? (
//                   <>Vote for proposal {proposalId}</>
//                 ) : (
//                   <>Vote to abstain on proposal {proposalId}</>
//                 )}
//               </ThemedText.DeprecatedMediumHeader>
//               <StyledClosed onClick={wrappedOnDismiss} />
//             </RowBetween>
//             <ThemedText.DeprecatedLargeHeader>
//               <>{formatCurrencyAmount(availableVotes, 4)} Votes</>
//             </ThemedText.DeprecatedLargeHeader>
//             <ButtonPrimary onClick={onVote}>
//               <ThemedText.DeprecatedMediumHeader color="white">
//                 {voteOption === VoteOption.Against ? (
//                   <>Vote against proposal {proposalId}</>
//                 ) : voteOption === VoteOption.For ? (
//                   <>Vote for proposal {proposalId}</>
//                 ) : (
//                   <>Vote to abstain on proposal {proposalId}</>
//                 )}
//               </ThemedText.DeprecatedMediumHeader>
//             </ButtonPrimary>
//           </AutoColumn>
//         </ContentWrapper>
//       )}
//       {attempting && !hash && (
//         <ConfirmOrLoadingWrapper>
//           <RowBetween>
//             <div />
//             <StyledClosed onClick={wrappedOnDismiss} />
//           </RowBetween>
//           <ConfirmedIcon>
//             <CustomLightSpinner src={Circle} alt="loader" size="90px" />
//           </ConfirmedIcon>
//           <AutoColumn gap="100px" justify="center">
//             <AutoColumn gap="md" justify="center">
//               <ThemedText.DeprecatedLargeHeader>
//                 <>Submitting Vote</>
//               </ThemedText.DeprecatedLargeHeader>
//             </AutoColumn>
//             <ThemedText.DeprecatedSubHeader>
//               <>Confirm this transaction in your wallet</>
//             </ThemedText.DeprecatedSubHeader>
//           </AutoColumn>
//         </ConfirmOrLoadingWrapper>
//       )}
//       {hash && (
//         <ConfirmOrLoadingWrapper>
//           <RowBetween>
//             <div />
//             <StyledClosed onClick={wrappedOnDismiss} />
//           </RowBetween>
//           <ConfirmedIcon>
//             <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.accentAction} />
//           </ConfirmedIcon>
//           <AutoColumn gap="100px" justify="center">
//             <AutoColumn gap="md" justify="center">
//               <ThemedText.DeprecatedLargeHeader>
//                 <>Transaction Submitted</>
//               </ThemedText.DeprecatedLargeHeader>
//             </AutoColumn>
//             {chainId && (
//               <ExternalLink
//                 href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
//                 style={{ marginLeft: '4px' }}
//               >
//                 <ThemedText.DeprecatedSubHeader>
//                   <>View transaction on Explorer</>
//                 </ThemedText.DeprecatedSubHeader>
//               </ExternalLink>
//             )}
//           </AutoColumn>
//         </ConfirmOrLoadingWrapper>
//       )}
//     </Modal>
//   )
// }
