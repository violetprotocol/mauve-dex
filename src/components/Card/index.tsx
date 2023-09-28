import { Box } from 'rebass/styled-components'
import styled from 'styled-components/macro'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1rem'};
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '12px'};
  border: ${({ border }) => border};
`
export default Card

export const LightCard = styled(Card)`
  background-color: ${({ theme }) => theme.backgroundModule};
`

export const DarkCard = styled(Card)`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.textSoft};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.accentWarning};
  font-weight: 500;
`
