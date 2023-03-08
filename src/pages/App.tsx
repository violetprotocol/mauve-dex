import Loader from 'components/Loader'
import { MenuDropdown } from 'components/NavBar/MenuDropdown'
import TopLevelModals from 'components/TopLevelModals'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Box } from 'nft/components/Box'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
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
import Tokens from './Tokens'
import VioletCallback from './VioletCallback'

const TokenDetails = lazy(() => import('./TokenDetails'))
// [MAUVE-DISABLED]
// const Vote = lazy(() => import('./Vote'))

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.navHeight}px 0px 5rem 0px;
  align-items: center;
  flex: 1;
`

const MobileBottomBar = styled.div`
  z-index: ${Z_INDEX.sticky};
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
  const isLoaded = useFeatureFlagsIsLoaded()

  const { pathname } = useLocation()
  const [scrolledState, setScrolledState] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrolledState(false)
  }, [pathname])

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
      <ApeModeQueryParamReader />
      <HeaderWrapper transparent={isHeaderTransparent}>
        <NavBar />
      </HeaderWrapper>
      <BodyWrapper>
        <Popups />
        <Polling />
        <TopLevelModals />
        <Suspense fallback={<Loader />}>
          {isLoaded ? (
            <Routes>
              <Route path="/" element={<Navigate to="/swap" replace />} />
              <Route path="tokens" element={<Tokens />}>
                <Route path=":chainName" />
              </Route>
              <Route path="tokens/:chainName/:tokenAddress" element={<TokenDetails />} />
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
          ) : (
            <Loader />
          )}
        </Suspense>
      </BodyWrapper>
      <MobileBottomBar>
        <PageTabs />
        <Box marginY="4">
          <MenuDropdown />
        </Box>
      </MobileBottomBar>
    </ErrorBoundary>
  )
}
