import { style } from '@vanilla-extract/css'
import { lightTheme } from 'theme/colors'

import { subhead } from '../../nft/css/common.css'
import { sprinkles } from '../../nft/css/sprinkles.css'

export const logoContainer = style([
  sprinkles({
    display: 'flex',
    marginRight: '12',
    cursor: 'pointer',
  }),
])

export const logo = style([
  {
    display: 'block',
  },
])

export const baseSideContainer = style([
  sprinkles({
    display: 'flex',
    width: 'full',
    flex: '1',
    flexShrink: '2',
  }),
])

export const leftSideContainer = style([
  baseSideContainer,
  sprinkles({
    alignItems: 'center',
    justifyContent: 'flex-start',
  }),
])

export const centerSideContainer = style([
  baseSideContainer,
  {
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.5rem',
  },
  {
    '@media': {
      'screen and (max-width: 768px)': {
        display: 'none',
      },
    },
  },
])

export const rightSideContainer = style([
  baseSideContainer,
  sprinkles({
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
])

const baseMenuItem = style([
  subhead,
  sprinkles({
    paddingY: '8',
    paddingX: '16',
    borderRadius: '12',
    transition: '250',
    height: 'min',
    textAlign: 'center',
  }),
  {
    lineHeight: '24px',
    fontWeight: 600,
    ':hover': {
      color: lightTheme.textPrimary,
    },
  },
])

export const menuItem = style([
  baseMenuItem,
  {
    color: lightTheme.textTertiary,
  },
])

export const activeMenuItem = style([
  baseMenuItem,
  {
    color: lightTheme.textPrimary,
  },
])
