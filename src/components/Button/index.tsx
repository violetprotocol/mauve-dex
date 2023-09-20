import { Check } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled, { AnyStyledComponent, keyframes, useTheme } from 'styled-components/macro'

import { RowBetween } from '../Row'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

type BaseButtonProps = {
  padding?: string
  width?: string
  $borderRadius?: string
  altDisabledStyle?: boolean
} & ButtonProps

const BaseButton = styled(RebassButton)<BaseButtonProps>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '100px'};
  outline: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.textPrimary};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
    background-image: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

export const ButtonPrimary = styled(BaseButton)`
  background-color: ${({ theme }) => theme.backgroundContrast};
  color: ${({ theme }) => theme.textContrast};

  font-size: 20px;
  font-weight: 600;
  padding: 16px;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.accentActiveSoft};
    background-color: ${({ theme }) => theme.textTertiary};
  }
  &:hover {
    background-color: ${({ theme }) => theme.textTertiary};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.backgroundInteractive};
    background-color: ${({ theme }) => theme.backgroundInteractive};
  }
  &:disabled {
    background-color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.backgroundContrast : theme.backgroundModule) : theme.backgroundOutline};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.textContrast : theme.accentActive) : theme.accentActive};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`

const rotate = keyframes`
 to {
    --angle: 360deg;
 }
 `

// Designed for use only with button components inheriting RebassButton or BaseButton
export const VioletProtected = (button: AnyStyledComponent, fillColorClass: string, haloWidth: string = '0.3rem') => {
  return styled(button)`
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: true;
    }
    --angle: 0deg;

    background-image: linear-gradient(
        to right,
        ${({ theme }) => theme[fillColorClass]},
        ${({ theme }) => theme[fillColorClass]}
      ),
      conic-gradient(from var(--angle), #35085e, #802dcc);
    background-origin: border-box;
    background-clip: padding-box,
      /* Clip white semi-transparent to the padding-box */ border-box
        /* Clip colored boxes to the border-box (default) */;
    border: ${haloWidth} dotted transparent;
    animation-name: ${rotate};
    animation-duration: 4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  `
}

export const VioletProtectedButtonPrimary = VioletProtected(ButtonPrimary, 'backgroundContrast')

export const SmallButtonPrimary = styled(ButtonPrimary)`
  width: auto;
  font-size: 16px;
  padding: 10px 16px;
`

export const ButtonLight = styled(BaseButton)`
  background-color: ${({ theme }) => theme.backgroundModule};
  color: ${({ theme }) => theme.textPrimary};
  font-size: 20px;
  font-weight: 600;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ disabled, theme }) => !disabled && theme.accentActiveSoft};
    background-color: ${({ disabled, theme }) => !disabled && theme.accentActive};
    color: ${({ disabled, theme }) => !disabled && theme.textContrast};
  }
  &:hover {
    background-color: ${({ disabled, theme }) => !disabled && theme.accentActive};
    color: ${({ disabled, theme }) => !disabled && theme.textContrast};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ disabled, theme }) => !disabled && theme.accentActiveSoft};
    background-color: ${({ disabled, theme }) => !disabled && theme.accentActive};
    color: ${({ disabled, theme }) => !disabled && theme.textContrast};
  }

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: transparent;
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`

export const ButtonGray = styled(BaseButton)`
  background-color: ${({ theme }) => theme.backgroundModule};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.backgroundInteractive};
  }
  &:active {
    background-color: ${({ theme, disabled }) => !disabled && theme.backgroundInteractive};
  }
`

export const ButtonSecondary = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.textSecondary};
  color: ${({ theme }) => theme.textSecondary};
  background-color: transparent;

  font-size: 20px;
  font-weight: 600;
  padding: 16px;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.accentActiveSoft};
    border: 1px solid ${({ theme }) => theme.accentActiveSoft};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.accentActiveSoft};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.accentActiveSoft};
    border: 1px solid ${({ theme }) => theme.accentActiveSoft};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`

export const ButtonOutlined = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: transparent;
  color: ${({ theme }) => theme.textPrimary};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.accentActiveSoft};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.accentActiveSoft};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.accentActiveSoft};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonYellow = styled(BaseButton)`
  background-color: ${({ theme }) => theme.accentWarningSoft};
  color: ${({ theme }) => theme.accentWarning};
  &:focus {
    background-color: ${({ theme }) => theme.accentWarningSoft};
  }
  &:hover {
    background-color: ${({ theme }) => theme.accentWarningSoft};
    mix-blend-mode: normal;
  }
  &:active {
    background-color: ${({ theme }) => theme.accentWarningSoft};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.accentWarningSoft};
    opacity: 60%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.textPrimary};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonText = styled(BaseButton)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    text-decoration: underline;
  }
  &:hover {
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonConfirmedStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  color: ${({ theme }) => theme.textPrimary};
  /* border: 1px solid ${({ theme }) => theme.accentSuccess}; */

  &:disabled {
    opacity: 50%;
    background-color: ${({ theme }) => theme.backgroundInteractive};
    color: ${({ theme }) => theme.textSecondary};
    cursor: auto;
  }
`

const VioletProtectedButtonConfirmedStyle = VioletProtected(ButtonConfirmedStyle, 'backgroundContrast')

const ButtonErrorStyle = styled(BaseButton)`
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.accentFailure};
  border: 1px solid ${({ theme }) => theme.accentFailure};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.accentFailureSoft};
    background-color: ${({ theme }) => theme.accentFailureSoft};
  }
  &:hover {
    background-color: ${({ theme }) => theme.accentFailureSoft};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.accentFailureSoft};
    background-color: ${({ theme }) => theme.accentFailureSoft};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.accentFailure};
    border: 1px solid ${({ theme }) => theme.accentFailure};
  }
`

const VioletProtectedButtonError = VioletProtected(ButtonErrorStyle, 'accentFailure')

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  violetProtected,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean; violetProtected?: boolean } & ButtonProps) {
  if (confirmed) {
    if (violetProtected) return <VioletProtectedButtonConfirmedStyle {...rest} />
    return <ButtonConfirmedStyle {...rest} />
  } else {
    if (violetProtected) return <VioletProtectedButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({
  error,
  violetProtected,
  ...rest
}: { error?: boolean; violetProtected?: boolean } & ButtonProps) {
  if (error) {
    if (violetProtected) return <VioletProtectedButtonError {...rest} />
    return <ButtonErrorStyle {...rest} />
  } else {
    if (violetProtected) return <VioletProtectedButtonPrimary {...rest} />
    return <ButtonPrimary {...rest} />
  }
}

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.accentAction};
`

const Circle = styled.div`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accentAction};
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  width: 20px;
  padding: 0 10px;
  position: absolute;
  top: 11px;
  right: 15px;
`

const ResponsiveCheck = styled(Check)`
  size: 13px;
`

export function ButtonRadioChecked({ active = false, children, ...rest }: { active?: boolean } & ButtonProps) {
  const theme = useTheme()

  if (!active) {
    return (
      <ButtonOutlined $borderRadius="12px" padding="12px 8px" {...rest}>
        <RowBetween>{children}</RowBetween>
      </ButtonOutlined>
    )
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" $borderRadius="12px">
        <RowBetween>
          {children}
          <CheckboxWrapper>
            <Circle>
              <ResponsiveCheck size={13} stroke={theme.textContrast} />
            </Circle>
          </CheckboxWrapper>
        </RowBetween>
      </ActiveOutlined>
    )
  }
}
