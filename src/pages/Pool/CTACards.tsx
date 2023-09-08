export {}

// import { Trans } from '@lingui/macro'
// import { AutoColumn } from 'components/Column'
// import styled from 'styled-components/macro'
// import { ThemedText } from 'theme'

// import { ExternalLink } from '../../theme'

// const CTASection = styled.section`
//   display: grid;
//   grid-template-columns: 2fr 1.5fr;
//   gap: 8px;
//   opacity: 0.8;

//   ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
//     grid-template-columns: auto;
//     grid-template-rows: auto;
//   `};
// `

// const CTA1 = styled(ExternalLink)`
//   padding: 16px;
//   border-radius: 20px;
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   justify-content: center;
//   align-items: center;
//   overflow: hidden;
//   border: 1px solid ${({ theme }) => theme.deprecated_bg3};

//   * {
//     color: ${({ theme }) => theme.textPrimary};
//     text-decoration: none !important;
//   }

//   :hover {
//     border: 1px solid ${({ theme }) => theme.deprecated_bg4};

//     text-decoration: none;
//     * {
//       text-decoration: none !important;
//     }
//   }
// `

// const CTA2 = styled(ExternalLink)`
//   position: relative;
//   overflow: hidden;
//   padding: 16px;
//   border-radius: 20px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   border: 1px solid ${({ theme }) => theme.deprecated_bg3};

//   * {
//     color: ${({ theme }) => theme.textPrimary};
//     text-decoration: none !important;
//   }

//   :hover {
//     border: 1px solid ${({ theme }) => theme.deprecated_bg4};
//     text-decoration: none !important;
//     * {
//       text-decoration: none !important;
//     }
//   }
// `

// const HeaderText = styled(ThemedText.DeprecatedLabel)`
//   align-items: center;
//   display: flex;

//   font-weight: 400;
//   font-size: 16px;
//   ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
//     font-size: 16px;
//   `};
// `

// const ResponsiveColumn = styled(AutoColumn)`
//   grid-template-columns: 1fr;
//   width: 100%;
//   gap: 8px;

//   ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
//     gap: 8px;
//   `};
//   justify-content: space-between;
// `

// export default function CTACards() {
//   return (
//     <CTASection>
//       {/* TODO add link for prividing liquidity */}
//       <CTA1 href="#">
//         <ResponsiveColumn>
//           <HeaderText>
//             <Trans>Learn about providing liquidity</Trans> ↗
//           </HeaderText>
//           <ThemedText.DeprecatedBody
//             fontWeight={400}
//             style={{ alignItems: "center", display: "flex" }}
//           >
//             <Trans>Check out our walkthrough and migration guides.</Trans>
//           </ThemedText.DeprecatedBody>
//         </ResponsiveColumn>
//       </CTA1>
//       <CTA2 data-testid="cta-infolink" href={infoLink + "pools"}>
//         <ResponsiveColumn>
//           <HeaderText style={{ alignSelf: "flex-start" }}>
//             <Trans>Top pools</Trans> ↗
//           </HeaderText>
//           <ThemedText.DeprecatedBody
//             fontWeight={400}
//             style={{ alignSelf: "flex-start" }}
//           >
//             <Trans>Explore Uniswap Analytics.</Trans>
//           </ThemedText.DeprecatedBody>
//         </ResponsiveColumn>
//       </CTA2>
//     </CTASection>
//   );
// }
