import VioletEnrollModal from 'components/VioletEnroll/VioletEnrollModal'
import Web3Status from 'components/Web3Status'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { MauveIcon } from 'nft/components/icons'
import { ReactNode } from 'react'
import { NavLink, NavLinkProps, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import { ChainDisplay } from './ChainDisplay'
import * as styles from './style.css'

// https://stackoverflow.com/a/31617326
const FULL_BORDER_RADIUS = 9999

const Nav = styled.nav`
  padding: 20px 12px;
  width: 100%;
  height: ${({ theme }) => theme.navHeight}px;
  z-index: 2;
`

const DocsLink = styled(ExternalLink)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.backgroundContrast};
  border-radius: ${FULL_BORDER_RADIUS}px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  padding: 10px 16px;
`

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
  dataTestId?: string
}

const MenuItem = ({ href, dataTestId, id, isActive, children }: MenuItemProps) => {
  return (
    <NavLink
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none' }}
      data-testid={dataTestId}
    >
      {children}
    </NavLink>
  )
}

export const PageTabs = () => {
  const { pathname } = useLocation()

  const isPoolActive =
    pathname.startsWith('/pool') ||
    pathname.startsWith('/add') ||
    pathname.startsWith('/remove') ||
    pathname.startsWith('/increase') ||
    pathname.startsWith('/find')

  return (
    <>
      <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
        <>Swap</>
      </MenuItem>
      <MenuItem href="/pool" id="pool-nav-link" isActive={isPoolActive}>
        <>Pool</>
      </MenuItem>
    </>
  )
}

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <>
      <Nav>
        <Box display="flex" height="full" flexWrap="nowrap">
          <Box className={styles.leftSideContainer}>
            <Box className={styles.logoContainer}>
              <MauveIcon
                width="48"
                height="48"
                data-testid="mauve-logo"
                className={styles.logo}
                onClick={() => {
                  navigate({
                    pathname: '/',
                    search: '?intro=true',
                  })
                }}
              />
            </Box>

            <DocsLink href="https://docs.mauve.org">Docs</DocsLink>
            <VioletEnrollModal />
          </Box>

          <Box className={styles.centerSideContainer} display={{ sm: 'none', lg: 'flex' }}>
            <PageTabs />
          </Box>

          <Box className={styles.rightSideContainer}>
            <Row gap="32">
              <ChainDisplay />

              <Web3Status />
            </Row>
          </Box>
        </Box>
      </Nav>
    </>
  )
}

export default Navbar
