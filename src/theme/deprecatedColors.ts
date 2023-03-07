import { colors } from './colors'
import { opacify } from './utils'

function getDeprecatedTheme() {
  return {
    // text
    deprecated_text4: colors.gray300,

    // backgrounds / grays

    // we could move this to `background`, but gray50 is a bit different from #FAFAFA
    deprecated_bg1: colors.gray50,

    deprecated_bg3: colors.gray200,
    deprecated_bg4: colors.gray300,
    deprecated_bg5: colors.gray400,

    //specialty colors
    deprecated_advancedBG: opacify(60, colors.white),

    //primary colors
    deprecated_primary2: colors.pink300,
    deprecated_primary3: colors.pink200,
    deprecated_primary4: '#F6DDE8',
    deprecated_primary5: '#FDEAF1',

    // secondary colors
    deprecated_secondary2: '#F6DDE8',
    deprecated_secondary3: '#FDEAF1',

    // other
    deprecated_yellow1: colors.yellow400,
    deprecated_yellow2: colors.yellow500,
    deprecated_yellow3: colors.yellow600,

    // dont wanna forget these blue yet
    deprecated_blue4: '#C4D9F8',
  }
}

const deprecatedColors = getDeprecatedTheme()

export { deprecatedColors }
