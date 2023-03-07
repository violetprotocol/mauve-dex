import { useWeb3React } from '@web3-react/core'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useEffect } from 'react'

import { SupportedChainId } from '../../constants/chains'
import { lightTheme } from '../colors'

const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient')
const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundRadialGradientElement) {
      backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })

export default function RadialGradientByChainUpdater(): null {
  const { chainId } = useWeb3React()
  const isNftPage = useIsNftPage()

  // manage background color
  useEffect(() => {
    if (!backgroundRadialGradientElement) {
      return
    }

    if (isNftPage) {
      setBackground(initialStyles)
      backgroundRadialGradientElement.style.background = lightTheme.backgroundBackdrop

      return
    }

    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_RINKEBY: {
        setBackground(backgroundResetStyles)
        const arbitrumLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(205, 232, 251, 0.7) 0%, rgba(252, 243, 249, 0.6536) 49.48%, rgba(255, 255, 255, 0) 100%), #FFFFFF'

        backgroundRadialGradientElement.style.background = arbitrumLightGradient
        break
      }
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISM_GOERLI: {
        setBackground(backgroundResetStyles)
        const optimismLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(255, 251, 242, 0.8) 0%, rgba(255, 244, 249, 0.6958) 50.52%, rgba(255, 255, 255, 0) 100%), #FFFFFF'

        backgroundRadialGradientElement.style.background = optimismLightGradient
        break
      }
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI: {
        setBackground(backgroundResetStyles)
        const polygonLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(130, 71, 229, 0.2) 0%, rgba(200, 168, 255, 0.05) 52.6%, rgba(0, 0, 0, 0) 100%), #FFFFFF'

        backgroundRadialGradientElement.style.background = polygonLightGradient
        break
      }
      case SupportedChainId.CELO:
      case SupportedChainId.CELO_ALFAJORES: {
        setBackground(backgroundResetStyles)
        const celoLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(186, 228, 210, 0.7) 0%, rgba(252, 243, 249, 0.6536) 49.48%, rgba(255, 255, 255, 0) 100%), #FFFFFF'

        backgroundRadialGradientElement.style.background = celoLightGradient
        break
      }
      default: {
        setBackground(initialStyles)
        const defaultLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0.51) 0%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
        backgroundRadialGradientElement.style.background = defaultLightGradient
      }
    }
  }, [chainId, isNftPage])
  return null
}
