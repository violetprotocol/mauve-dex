export {}
// [MAUVE-DISABLED]
// import styled from 'styled-components/macro'

// import { ColumnCenter } from '../Column'

// const ConfirmOrLoadingWrapper = styled.div`
//   width: 100%;
//   padding: 24px;
// `

// const ConfirmedIcon = styled(ColumnCenter)`
//   padding: 60px 0;
// `

// export function LoadingView({ children, onDismiss }: { children: any; onDismiss: () => void }) {
//   return (
//     <ConfirmOrLoadingWrapper>
//       <RowBetween>
//         <div />
//         <CloseIcon onClick={onDismiss} />
//       </RowBetween>
//       <ConfirmedIcon>
//         <CustomLightSpinner src={Circle} alt="loader" size="90px" />
//       </ConfirmedIcon>
//       <AutoColumn gap="100px" justify="center">
//         {children}
//         <ThemedText.DeprecatedSubHeader>
//           <Trans>Confirm this transaction in your wallet</Trans>
//         </ThemedText.DeprecatedSubHeader>
//       </AutoColumn>
//     </ConfirmOrLoadingWrapper>
//   )
// }

// export function SubmittedView({
//   children,
//   onDismiss,
//   hash,
// }: {
//   children: any
//   onDismiss: () => void
//   hash: string | undefined
// }) {
//   const theme = useTheme()
//   const { chainId } = useWeb3React()

//   return (
//     <ConfirmOrLoadingWrapper>
//       <RowBetween>
//         <div />
//         <CloseIcon onClick={onDismiss} />
//       </RowBetween>
//       <ConfirmedIcon>
//         <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.accentAction} />
//       </ConfirmedIcon>
//       <AutoColumn gap="100px" justify="center">
//         {children}
//         {chainId && hash && (
//           <ExternalLink
//             href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
//             style={{ marginLeft: '4px' }}
//           >
//             <ThemedText.DeprecatedSubHeader>
//               <Trans>View transaction on Explorer</Trans>
//             </ThemedText.DeprecatedSubHeader>
//           </ExternalLink>
//         )}
//       </AutoColumn>
//     </ConfirmOrLoadingWrapper>
//   )
// }
