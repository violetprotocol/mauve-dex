import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { Currency, Token } from '@violetprotocol/mauve-sdk-core'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { useAllTokens } from 'hooks/Tokens'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenAddress } from 'lib/utils/analytics'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import styled from 'styled-components/macro'
import { currencyId } from 'utils/currencyId'
import MauveBaseButton from './MauveBaseButton'
import { CurrencyWithRestriction, useTokenRestriction } from 'hooks/useTokenRestriction'
import { useWeb3React } from '@web3-react/core'

const MobileWrapper = styled(AutoColumn)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`

const formatAnalyticsEventProperties = (currency: Currency, searchQuery: string, isAddressSearch: string | false) => ({
  token_symbol: currency?.symbol,
  token_chain_id: currency?.chainId,
  token_address: getTokenAddress(currency),
  is_suggested_token: true,
  is_selected_from_list: false,
  is_imported_by_user: false,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

export default function MauveBases({
  chainId,
  onSelect,
  selectedCurrency,
  searchQuery,
  isAddressSearch,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: CurrencyWithRestriction) => void
  searchQuery: string
  isAddressSearch: string | false
}) {
  const { account } = useWeb3React()
  const defaultTokens = useAllTokens()
  const tokens = Object.values(defaultTokens).map((token) => {
    return {
      isNative: token.isNative,
      isToken: token.isToken,
      ...((token as WrappedTokenInfo).tokenInfo ? (token as WrappedTokenInfo).tokenInfo : token),
      wrapped: token,
    } as Currency
  })

  const native = useNativeCurrency()
  const bases = typeof chainId !== 'undefined' ? [native, ...tokens] ?? [] : []
  const basesWithRestrictions = useTokenRestriction(account, bases)

  return bases.length > 0 ? (
    <MobileWrapper gap="md">
      <AutoRow gap="4px">
        {basesWithRestrictions.map((baseWithRestriction: CurrencyWithRestriction) => {
          const isSelected = selectedCurrency?.equals(baseWithRestriction.currency)
          
          return (
            <TraceEvent
              events={[BrowserEvent.onClick, BrowserEvent.onKeyPress]}
              name={InterfaceEventName.TOKEN_SELECTED}
              properties={formatAnalyticsEventProperties(baseWithRestriction.currency, searchQuery, isAddressSearch)}
              element={InterfaceElementName.COMMON_BASES_CURRENCY_BUTTON}
              key={currencyId(baseWithRestriction.currency)}
            >
              <MauveBaseButton currency={baseWithRestriction.currency} onSelect={onSelect} isPermitted={baseWithRestriction.isPermitted} restriction={baseWithRestriction.restriction} isSelected={isSelected ?? false}/>
            </TraceEvent>
          )
        })}
      </AutoRow>
    </MobileWrapper>
  ) : null
}
