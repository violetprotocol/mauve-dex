import { Check } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled, { useTheme } from 'styled-components/macro'

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
  color: ${({ theme }) => theme.tw.black};
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
  background-color: ${({ theme }) => theme.tw.black};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.tw.white};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.tw.neutral[400]};
    background-color: ${({ theme }) => theme.tw.neutral[400]};
  }
  &:hover {
    background-color: ${({ theme }) => theme.tw.neutral[400]};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.tw.neutral[200]};
    background-color: ${({ theme }) => theme.tw.neutral[200]};
  }
  &:disabled {
    background-color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.tw.black : theme.tw.neutral[200]) : theme.tw.neutral[100]};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.tw.white : theme.tw.neutral[200]) : theme.tw.neutral[400]};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`

export const SmallButtonPrimary = styled(ButtonPrimary)`
  width: auto;
  font-size: 16px;
  padding: 10px 16px;
`

export const ButtonLight = styled(BaseButton)`
  background-color: ${({ theme }) => theme.tw.neutral[200]};
  color: ${({ theme }) => theme.tw.black};
  font-size: 20px;
  font-weight: 600;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ disabled, theme }) => !disabled && theme.tw.neutral[400]};
    background-color: ${({ disabled, theme }) => !disabled && theme.tw.neutral[300]};
  }
  &:hover {
    background-color: ${({ disabled, theme }) => !disabled && theme.tw.neutral[700]};
    color: ${({ disabled, theme }) => !disabled && theme.tw.white};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ disabled, theme }) => !disabled && theme.tw.neutral[400]};
    background-color: ${({ disabled, theme }) => !disabled && theme.tw.neutral[900]};
    color: ${({ disabled, theme }) => !disabled && theme.tw.white};
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
  background-color: ${({ theme }) => theme.tw.neutral[200]};
  color: ${({ theme }) => theme.tw.black};
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.tw.neutral[300]};
  }
  &:active {
    background-color: ${({ theme, disabled }) => !disabled && theme.tw.neutral[400]};
  }
`

export const ButtonSecondary = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.deprecated_primary4};
  color: ${({ theme }) => theme.accentAction};
  background-color: transparent;
  font-size: 16px;
  padding: ${({ padding }) => (padding ? padding : '10px')};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.deprecated_primary4};
    border: 1px solid ${({ theme }) => theme.deprecated_primary3};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.deprecated_primary3};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.deprecated_primary4};
    border: 1px solid ${({ theme }) => theme.deprecated_primary3};
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
  color: ${({ theme }) => theme.tw.black};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.deprecated_bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.tw.neutral[400]};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.deprecated_bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonYellow = styled(BaseButton)`
  background-color: ${({ theme }) => theme.tw.yellow[100]};
  color: ${({ theme }) => theme.tw.yellow[500]};
  &:focus {
    background-color: ${({ theme }) => theme.tw.yellow[100]};
  }
  &:hover {
    background-color: ${({ theme }) => theme.tw.yellow[100]};
    mix-blend-mode: normal;
  }
  &:active {
    background-color: ${({ theme }) => theme.tw.yellow[100]};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.tw.yellow[100]};
    opacity: 60%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.tw.black};
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
  color: ${({ theme }) => theme.tw.black};
  /* border: 1px solid ${({ theme }) => theme.accentSuccess}; */

  &:disabled {
    opacity: 50%;
    background-color: ${({ theme }) => theme.backgroundInteractive};
    color: ${({ theme }) => theme.tw.neutral[600]};
    cursor: auto;
  }
`

const ButtonErrorStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.tw.red[600]};
  border: 1px solid ${({ theme }) => theme.tw.red[600]};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.tw.red[800]};
    background-color: ${({ theme }) => theme.tw.red[800]};
  }
  &:hover {
    background-color: ${({ theme }) => theme.tw.red[800]};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.tw.red[700]};
    background-color: ${({ theme }) => theme.tw.red[700]};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.tw.red[600]};
    border: 1px solid ${({ theme }) => theme.tw.red[600]};
  }
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
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
              <ResponsiveCheck size={13} stroke={theme.white} />
            </Circle>
          </CheckboxWrapper>
        </RowBetween>
      </ActiveOutlined>
    )
  }
}
