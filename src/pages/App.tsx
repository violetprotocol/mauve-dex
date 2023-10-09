import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import AppVersion from 'components/AppVersion'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import { opacify } from 'polished'
import { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { flexRowNoWrap } from 'theme/styles'
import { Z_INDEX } from 'theme/zIndex'

import ErrorBoundary from '../components/ErrorBoundary'
import { PageTabs } from '../components/NavBar'
import NavBar from '../components/NavBar'
import Polling from '../components/Polling'
import Popups from '../components/Popups'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import NotFound from './NotFound'
import Pool from './Pool'
import { PositionPage } from './Pool/PositionPage'
import RemoveLiquidityV3 from './RemoveLiquidity/V3'
import Swap from './Swap'
import { RedirectPathToSwapOnly } from './Swap/redirects'
import VioletCallback from './VioletCallback'
import CookieConsent from "react-cookie-consent";
import { MAUVE_LANDING } from 'constants/violet'

// [MAUVE-DISABLED]
// const TokenDetails = lazy(() => import('./TokenDetails'))
// const Vote = lazy(() => import('./Vote'))

// [MAUVE-DISABLED] Analytics is disabled
// Placeholder API key. Actual API key used in the proxy server
// const ANALYTICS_DUMMY_KEY = '00000000000000000000000000000000'
// const ANALYTICS_PROXY_URL = process.env.REACT_APP_AMPLITUDE_PROXY_URL
// const COMMIT_HASH = process.env.REACT_APP_GIT_COMMIT_HASH
// initializeAnalytics(ANALYTICS_DUMMY_KEY, OriginApplication.INTERFACE, {
//   proxyUrl: ANALYTICS_PROXY_URL,
//   defaultEventName: SharedEventName.PAGE_VIEWED,
//   commitHash: COMMIT_HASH,
//   isProductionEnv: isProductionEnv(),
// })

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.navHeight}px 0px 2rem 0px;
  align-items: center;
  justify-items: center;
  flex: 1;
`

const BackgroundGlow = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  overflow: hidden;
  pointer-events: none;
`

const BackgroundGlowInner = styled.div`
  position: absolute;
  width: 10vw;
  height: 100vh;
  left: 50%;
  top: 0;
  background: ${({ theme }) => opacify(8, theme.backgroundInteractive)};
  opacity: 0.32;
  filter: blur(8rem);
  transform: rotate(45deg);
`

const MobileBottomBar = styled.div`
  z-index: 0;
  position: fixed;
  display: flex;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100vw;
  justify-content: space-between;
  padding: 4px 8px;
  height: ${({ theme }) => theme.mobileBottomBarHeight}px;
  background: ${({ theme }) => theme.backgroundSurface};
  border-top: 1px solid ${({ theme }) => theme.backgroundOutline};

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`

const HeaderWrapper = styled.div<{ transparent?: boolean }>`
  ${flexRowNoWrap};
  background-color: ${({ theme, transparent }) => !transparent && theme.backgroundSurface};
  border-bottom: ${({ theme, transparent }) => !transparent && `1px solid ${theme.backgroundOutline}`};
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: ${Z_INDEX.dropdown};
`

function getCurrentPageFromLocation(locationPathname: string): InterfacePageName | undefined {
  switch (true) {
    case locationPathname.startsWith('/swap'):
      return InterfacePageName.SWAP_PAGE
    case locationPathname.startsWith('/vote'):
      return InterfacePageName.VOTE_PAGE
    case locationPathname.startsWith('/pool'):
      return InterfacePageName.POOL_PAGE
    case locationPathname.startsWith('/tokens'):
      return InterfacePageName.TOKENS_PAGE
    case locationPathname.startsWith('/nfts/profile'):
      return InterfacePageName.NFT_PROFILE_PAGE
    case locationPathname.startsWith('/nfts/asset'):
      return InterfacePageName.NFT_DETAILS_PAGE
    case locationPathname.startsWith('/nfts/collection'):
      return InterfacePageName.NFT_COLLECTION_PAGE
    case locationPathname.startsWith('/nfts'):
      return InterfacePageName.NFT_EXPLORE_PAGE
    default:
      return undefined
  }
}

// this is the same svg defined in assets/images/blue-loader.svg
// it is defined here because the remote asset may not have had time to load when this file is executing
// [MAUVE-DISABLED]: Unused
// const LazyLoadSpinner = () => (
//   <SpinnerSVG width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M92 47C92 22.1472 71.8528 2 47 2C22.1472 2 2 22.1472 2 47C2 71.8528 22.1472 92 47 92"
//       stroke="#2172E5"
//       strokeWidth="3"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </SpinnerSVG>
// )

export default function App() {
  const { pathname } = useLocation()
  const currentPage = getCurrentPageFromLocation(pathname)
  const [scrolledState, setScrolledState] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrolledState(false)
  }, [pathname])

  // useEffect(() => {
  //   sendAnalyticsEvent(SharedEventName.APP_LOADED)
  //   user.set(CustomUserProperties.USER_AGENT, navigator.userAgent)
  //   user.set(CustomUserProperties.BROWSER, getBrowser())
  //   user.set(CustomUserProperties.SCREEN_RESOLUTION_HEIGHT, window.screen.height)
  //   user.set(CustomUserProperties.SCREEN_RESOLUTION_WIDTH, window.screen.width)
  //   getCLS(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { cumulative_layout_shift: delta }))
  //   getFCP(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { first_contentful_paint_ms: delta }))
  //   getFID(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { first_input_delay_ms: delta }))
  //   getLCP(({ delta }: Metric) =>
  //     sendAnalyticsEvent(SharedEventName.WEB_VITALS, { largest_contentful_paint_ms: delta })
  //   )
  // }, [])

  useEffect(() => {
    const scrollListener = () => {
      setScrolledState(window.scrollY > 0)
    }
    window.addEventListener('scroll', scrollListener)
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  const isHeaderTransparent = !scrolledState

  return (
    <ErrorBoundary>
      <Trace page={currentPage}>
        <HeaderWrapper transparent={isHeaderTransparent}>
          <NavBar />
        </HeaderWrapper>
        <BodyWrapper>
          <BackgroundGlow>
            <BackgroundGlowInner />
          </BackgroundGlow>

          <Popups />
          <AppVersion />
          <Polling />
          <TopLevelModals />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/swap" replace />} />
              {/* <Route path="tokens" element={<Tokens />}>
                <Route path=":chainName" />
              </Route>
              <Route path="tokens/:chainName/:tokenAddress" element={<TokenDetails />} />
              */}
              {/* // [MAUVE-DISABLED] */}
              {/* <Route
                  path="vote/*"
                  element={
                    <Suspense fallback={<LazyLoadSpinner />}>
                      <Vote />
                    </Suspense>
                  }
                /> */}
              {/* <Route path="create-proposal" element={<Navigate to="/vote/create-proposal" replace />} /> */}
              <Route path="send" element={<RedirectPathToSwapOnly />} />
              <Route path="swap" element={<Swap />} />
              <Route path="pool" element={<Pool />} />
              <Route path="pool/:tokenId" element={<PositionPage />} />
              <Route path="add" element={<RedirectDuplicateTokenIds />}>
                {/* this is workaround since react-router-dom v6 doesn't support optional parameters any more */}
                <Route path=":currencyIdA" />
                <Route path=":currencyIdA/:currencyIdB" />
                <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
              </Route>
              <Route path="increase" element={<AddLiquidity />}>
                <Route path=":currencyIdA" />
                <Route path=":currencyIdA/:currencyIdB" />
                <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                <Route path=":currencyIdA/:currencyIdB/:feeAmount/:tokenId" />
              </Route>
              <Route path="remove/:tokenId" element={<RemoveLiquidityV3 />} />
              <Route path="callback" element={<VioletCallback />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
              <Route path="/not-found" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BodyWrapper>
        <MobileBottomBar>
          <PageTabs />
        </MobileBottomBar>
        <CookieConsent
          location="bottom"
          buttonText="I understand"
          cookieName="acceptance"
          style={{ background: "#f5f5f5" }}
          buttonStyle={{ color: theme.white, borderRadius: '1rem', fontWeight: 500, fontSize: "12px", backgroundColor: theme.accentAction }}
          expires={150}
          enableDeclineButton
          declineButtonText="I decline"
          onDecline={() => {
            window.location.href = MAUVE_LANDING
          }}
          declineButtonStyle={{ color: theme.white, borderRadius: '1rem', fontWeight: 500, fontSize: "12px", backgroundColor: opacify(24, theme.accentFailure) }}
          flipButtons
          setDeclineCookie={false}
        >
          <span style={{fontSize: "12px", fontWeight: 600, color: theme.textPrimary}}>This website uses cookies to enhance the user experience.{"   "}</span>
          <span style={{fontSize: "10px", paddingLeft: '10px', color: theme.textPrimary}}>By continuing to use Mauve, you are agreeing to usage of cookies.{" "}</span>
          <link href=''>Read our terms of use.</link>
        </CookieConsent>
      </Trace>
    </ErrorBoundary>
  )
}
