import { Currency } from '@violetprotocol/mauve-sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { MouseoverTooltip } from 'components/Tooltip'
import { getRestrictionCopy, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { useTokenInfoFromActiveList } from 'hooks/useTokenInfoFromActiveList'
import { CurrencyWithRestriction } from 'hooks/useTokenRestriction'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { currencyId } from 'utils/currencyId'

const BaseWrapper = styled.div<{ restricted?: boolean; disable?: boolean }>`
  border: 1px ${({ restricted }) => (restricted ? 'dotted' : 'solid')}
    ${({ theme, disable, restricted }) =>
      restricted ? theme.accentWarning : disable ? theme.accentActive : theme.backgroundOutline};
  border-radius: 16px;
  display: flex;
  padding: 6px;
  padding-right: 12px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme }) => theme.hoverDefault};
  }

  color: ${({ theme, disable }) => disable && theme.accentActive};
  background-color: ${({ theme, disable }) => disable && theme.accentActiveSoft};
`

export default function MauveBaseButton({
  currency,
  onSelect,
  isSelected,
  isPermitted,
  restriction,
}: {
  currency: Currency
  onSelect: (currency: CurrencyWithRestriction) => void
  isSelected: boolean
  isPermitted: boolean
  restriction: TOKEN_RESTRICTION_TYPE
}) {
  const { heading } = getRestrictionCopy(restriction)
  const blockedTokenOpacity = '0.6'

  const tokenButton = (
    <BaseWrapper
      style={{ opacity: !isPermitted ? blockedTokenOpacity : '1' }}
      tabIndex={0}
      onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect({ currency, isPermitted, restriction })}
      onClick={() => !isSelected && onSelect({ currency, isPermitted, restriction })}
      disable={isSelected}
      restricted={!isPermitted}
      key={currencyId(currency)}
    >
      <CurrencyLogoFromList currency={currency} />
      <Text fontWeight={500} fontSize={16}>
        {currency.symbol}
      </Text>
    </BaseWrapper>
  )

  const tooltipWrapper = <MouseoverTooltip text={<>{heading}</>}>{tokenButton}</MouseoverTooltip>

  return isPermitted ? tokenButton : tooltipWrapper
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Currency }) {
  const token = useTokenInfoFromActiveList(currency)

  return <CurrencyLogo currency={token} style={{ marginRight: 8 }} />
}
