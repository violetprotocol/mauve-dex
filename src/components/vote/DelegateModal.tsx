// [MAUVE-DISABLED]
export {}
// import { isAddress } from '@ethersproject/address'
// import { Trans } from '@lingui/macro'
// import { useWeb3React } from '@web3-react/core'
// import { ReactNode, useState } from 'react'
// import { X } from 'react-feather'
// import styled from 'styled-components/macro'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

// import { UNI } from '../../constants/tokens'
// import useENS from '../../hooks/useENS'
// import { useTokenBalance } from '../../state/connection/hooks'
// import { useDelegateCallback } from '../../state/governance/hooks'
// import { ThemedText } from '../../theme'
// import AddressInputPanel from '../AddressInputPanel'
// import { ButtonPrimary } from '../Button'
// import { AutoColumn } from '../Column'
// import Modal from '../Modal'
// import { LoadingView, SubmittedView } from '../ModalViews'
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

// const TextButton = styled.div`
//   :hover {
//     cursor: pointer;
//   }
// `

// interface VoteModalProps {
//   isOpen: boolean
//   onDismiss: () => void
//   title: ReactNode
// }

// export default function DelegateModal({ isOpen, onDismiss, title }: VoteModalProps) {
//   const { account, chainId } = useWeb3React()

//   // state for delegate input
//   const [usingDelegate, setUsingDelegate] = useState(false)
//   const [typed, setTyped] = useState('')
//   function handleRecipientType(val: string) {
//     setTyped(val)
//   }

//   // monitor for self delegation or input for third part delegate
//   // default is self delegation
//   const activeDelegate = usingDelegate ? typed : account
//   const { address: parsedAddress } = useENS(activeDelegate)

//   // get the number of votes available to delegate
//   const uniBalance = useTokenBalance(account ?? undefined, chainId ? UNI[chainId] : undefined)

//   const delegateCallback = useDelegateCallback()

//   // monitor call to help UI loading state
//   const [hash, setHash] = useState<string | undefined>()
//   const [attempting, setAttempting] = useState(false)

//   // wrapper to reset state on modal close
//   function wrappedOnDismiss() {
//     setHash(undefined)
//     setAttempting(false)
//     onDismiss()
//   }

//   async function onDelegate() {
//     setAttempting(true)

//     // if callback not returned properly ignore
//     if (!delegateCallback) return

//     // try delegation and store hash
//     const hash = await delegateCallback(parsedAddress ?? undefined)?.catch((error) => {
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
//               <ThemedText.DeprecatedMediumHeader fontWeight={500}>{title}</ThemedText.DeprecatedMediumHeader>
//               <StyledClosed stroke="black" onClick={wrappedOnDismiss} />
//             </RowBetween>
//             <ThemedText.DeprecatedBody>
//               <>Earned UNI tokens represent voting shares in Uniswap governance.</>
//             </ThemedText.DeprecatedBody>
//             <ThemedText.DeprecatedBody>
//               <>You can either vote on each proposal yourself or delegate your votes to a third party.</>
//             </ThemedText.DeprecatedBody>
//             {usingDelegate && <AddressInputPanel value={typed} onChange={handleRecipientType} />}
//             <ButtonPrimary disabled={!isAddress(parsedAddress ?? '')} onClick={onDelegate}>
//               <ThemedText.DeprecatedMediumHeader color="white">
//                 {usingDelegate ? <>Delegate Votes</> : <>Self Delegate</>}
//               </ThemedText.DeprecatedMediumHeader>
//             </ButtonPrimary>
//             <TextButton onClick={() => setUsingDelegate(!usingDelegate)}>
//               <ThemedText.DeprecatedBlue>
//                 {usingDelegate ? <>Remove Delegate</> : <>Add Delegate +</>}
//               </ThemedText.DeprecatedBlue>
//             </TextButton>
//           </AutoColumn>
//         </ContentWrapper>
//       )}
//       {attempting && !hash && (
//         <LoadingView onDismiss={wrappedOnDismiss}>
//           <AutoColumn gap="md" justify="center">
//             <ThemedText.DeprecatedLargeHeader>
//               {usingDelegate ? <>Delegating votes</> : <>Unlocking Votes</>}
//             </ThemedText.DeprecatedLargeHeader>
//             <ThemedText.DeprecatedMain fontSize={36}> {formatCurrencyAmount(uniBalance, 4)}</ThemedText.DeprecatedMain>
//           </AutoColumn>
//         </LoadingView>
//       )}
//       {hash && (
//         <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
//           <AutoColumn gap="md" justify="center">
//             <ThemedText.DeprecatedLargeHeader>
//               <>Transaction Submitted</>
//             </ThemedText.DeprecatedLargeHeader>
//             <ThemedText.DeprecatedMain fontSize={36}>{formatCurrencyAmount(uniBalance, 4)}</ThemedText.DeprecatedMain>
//           </AutoColumn>
//         </SubmittedView>
//       )}
//     </Modal>
//   )
// }
