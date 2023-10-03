// eslint-disable-next-line no-restricted-imports
import { Trace } from '@uniswap/analytics'
import { InterfaceEventName, InterfaceModalName } from '@uniswap/analytics-events'
import { Currency, Token } from '@violetprotocol/mauve-sdk-core'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import TokenRestrictionModal from 'components/TokenRestriction/TokenSelectRestrictionModal'
import { TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useToggle from 'hooks/useToggle'
import { CurrencyWithRestriction, useTokenRestriction } from 'hooks/useTokenRestriction'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { useAllTokenBalances } from 'state/connection/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { UserAddedToken } from 'types/tokens'

import { useAllTokens, useIsUserAddedToken, useToken } from '../../hooks/Tokens'
import { CloseIcon, ThemedText } from '../../theme'
import { isAddress } from '../../utils'
import Column from '../Column'
import { RowBetween } from '../Row'
import { CurrencyRow, formatAnalyticsEventProperties } from './CurrencyList'
import CurrencyList from './CurrencyList'
import MauveBases from './MauveBases'
import { PaddedColumn, Separator } from './styleds'

const ContentWrapper = styled(Column)`
  background-color: ${({ theme }) => theme.backgroundSurface};
  width: 100%;
  flex: 1 1;
  position: relative;
`

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency, hasWarning?: boolean) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  onDismiss,
  isOpen,
}: CurrencySearchProps) {
  const { chainId, account } = useWeb3React()
  const theme = useTheme()

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const isAddressSearch = isAddress(debouncedQuery)
  const searchToken = useToken(debouncedQuery)
  const searchTokenIsAdded = useIsUserAddedToken(searchToken)

  // TO-DO find out why non-conditional usage of this hook blocks the UI thread
  const searchTokenWithRestrictions = useTokenRestriction(account, searchToken ? [searchToken] : [])[0]

  const [restrictedTokenClicked, setRestrictedTokenClicked] = useState<CurrencyWithRestriction>()
  const [openTokenRestrictionModal, setOpenTokenRestrictionModal] = useState(false)

  useEffect(() => {
    if (isAddressSearch) {
      sendEvent({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch,
      })
    }
  }, [isAddressSearch])

  const defaultTokens = useAllTokens()
  const filteredTokens: Token[] = useMemo(() => {
    return Object.values(defaultTokens).filter(getTokenFilter(debouncedQuery))
  }, [defaultTokens, debouncedQuery])

  const [balances, balancesAreLoading] = useAllTokenBalances()
  const sortedTokens: Token[] = useMemo(
    () =>
      !balancesAreLoading
        ? filteredTokens
            .filter((token) => {
              // If there is no query, filter out unselected user-added tokens with no balance.
              if (!debouncedQuery && token instanceof UserAddedToken) {
                if (selectedCurrency?.equals(token) || otherSelectedCurrency?.equals(token)) return true
                return balances[token.address]?.greaterThan(0)
              }
              return true
            })
            .sort(tokenComparator.bind(null, balances))
        : [],
    [balances, balancesAreLoading, debouncedQuery, filteredTokens, otherSelectedCurrency, selectedCurrency]
  )
  const isLoading = Boolean(balancesAreLoading && !tokenLoaderTimerElapsed)

  const filteredSortedTokens = useSortTokensByQuery(debouncedQuery, sortedTokens)
  const filteredSortedTokensWithRestrictions = useTokenRestriction(account, filteredSortedTokens)

  const native = useNativeCurrency()
  const wrapped = native.wrapped

  const searchCurrencies: CurrencyWithRestriction[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim()

    const tokens = filteredSortedTokensWithRestrictions.filter(
      (t) => !(t.currency.equals(wrapped) || (disableNonToken && t.currency.isNative))
    )
    const natives = (disableNonToken || native.equals(wrapped) ? [wrapped] : [native, wrapped]).filter(
      (n) => n.symbol?.toLowerCase()?.indexOf(s) !== -1 || n.name?.toLowerCase()?.indexOf(s) !== -1
    )
    return [
      ...natives.map((n) => {
        return {
          currency: n,
          restriction: TOKEN_RESTRICTION_TYPE.NONE,
          isPermitted: true,
        }
      }),
      ...tokens,
    ]
  }, [debouncedQuery, filteredSortedTokensWithRestrictions, wrapped, disableNonToken, native])

  const handleCurrencySelect = useCallback(
    (currency: CurrencyWithRestriction, hasWarning?: boolean) => {
      if (!currency.isPermitted && !openTokenRestrictionModal) {
        setRestrictedTokenClicked(currency)
        setOpenTokenRestrictionModal(true)
      } else {
        onCurrencySelect(currency.currency, hasWarning)
        if (!hasWarning) onDismiss()
      }
    },
    [onDismiss, onCurrencySelect, openTokenRestrictionModal]
  )

  const handleCloseRestrictionWarning = (understood: boolean) => {
    setOpenTokenRestrictionModal(false)
    if (understood && restrictedTokenClicked) {
      handleCurrencySelect(restrictedTokenClicked)
    }
  }

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // [MAUVE-DISABLED] We don't have a search input, as we don't have many tokens yet
  // // manage focus on modal show
  // const inputRef = useRef<HTMLInputElement>();
  // const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  //   const input = event.target.value;
  //   const checksummedInput = isAddress(input);
  //   setSearchQuery(checksummedInput || input);
  //   fixedList.current?.scrollTo(0);
  // }, []);

  // const handleEnter = useCallback(
  //   (e: KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === "Enter") {
  //       const s = debouncedQuery.toLowerCase().trim();
  //       if (s === native?.symbol?.toLowerCase()) {
  //         handleCurrencySelect(native);
  //       } else if (searchCurrencies.length > 0) {
  //         if (
  //           searchCurrencies[0].symbol?.toLowerCase() ===
  //             debouncedQuery.trim().toLowerCase() ||
  //           searchCurrencies.length === 1
  //         ) {
  //           handleCurrencySelect(searchCurrencies[0]);
  //         }
  //       }
  //     }
  //   },
  //   [debouncedQuery, native, searchCurrencies, handleCurrencySelect]
  // );

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  // const filteredInactiveTokens = useSearchInactiveTokenLists(
  //   filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch) ? debouncedQuery : undefined
  // )

  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  return (
    <ContentWrapper>
      <Trace
        name={InterfaceEventName.TOKEN_SELECTOR_OPENED}
        modal={InterfaceModalName.TOKEN_SELECTOR}
        shouldLogImpression
      >
        <PaddedColumn gap="16px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              <>Select a token</>
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          {/*   
          // [MAUVE-DISABLED] We don't have a search input, as we don't have many tokens yet
              <Row>
                <SearchInput
                  type="text"
                  id="token-search-input"
                  placeholder={t`Search name or paste address`}
                  autoComplete="off"
                  value={searchQuery}
                  ref={inputRef as RefObject<HTMLInputElement>}
                  onChange={handleInput}
                  onKeyDown={handleEnter}
                />
              </Row> */}
          {showCommonBases && (
            <MauveBases
              chainId={chainId}
              onSelect={handleCurrencySelect}
              selectedCurrency={selectedCurrency}
              searchQuery={searchQuery}
              isAddressSearch={isAddressSearch}
            />
          )}
        </PaddedColumn>
        <Separator />
        {searchTokenWithRestrictions && !searchTokenIsAdded ? (
          <Column style={{ padding: '20px 0', height: '100%' }}>
            <CurrencyRow
              currency={searchTokenWithRestrictions.currency}
              isSelected={Boolean(searchToken && selectedCurrency && selectedCurrency.equals(searchToken))}
              isPermitted={searchTokenWithRestrictions.isPermitted}
              restriction={searchTokenWithRestrictions.restriction}
              onSelect={(hasWarning: boolean) =>
                searchToken && handleCurrencySelect(searchTokenWithRestrictions, hasWarning)
              }
              otherSelected={Boolean(searchToken && otherSelectedCurrency && otherSelectedCurrency.equals(searchToken))}
              showCurrencyAmount={showCurrencyAmount}
              eventProperties={formatAnalyticsEventProperties(
                searchTokenWithRestrictions.currency as Token,
                0,
                [searchTokenWithRestrictions.currency as Token],
                searchQuery,
                isAddressSearch
              )}
            />
          </Column>
        ) : searchCurrencies?.length > 0 || isLoading ? (
          <div style={{ flex: '1' }}>
            <AutoSizer disableWidth>
              {({ height }: { height: number }) => (
                <CurrencyList
                  height={height}
                  currencies={searchCurrencies}
                  // otherListTokens={filteredInactiveTokens}
                  onCurrencySelect={handleCurrencySelect}
                  otherCurrency={otherSelectedCurrency}
                  selectedCurrency={selectedCurrency}
                  fixedListRef={fixedList}
                  showCurrencyAmount={showCurrencyAmount}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  isAddressSearch={isAddressSearch}
                />
              )}
            </AutoSizer>
          </div>
        ) : (
          <Column style={{ padding: '20px', height: '100%' }}>
            <ThemedText.DeprecatedMain color={theme.textTertiary} textAlign="center" mb="20px">
              <>No results found.</>
            </ThemedText.DeprecatedMain>
          </Column>
        )}
        <TokenRestrictionModal
          restriction={restrictedTokenClicked?.restriction ?? TOKEN_RESTRICTION_TYPE.NONE}
          isOpen={openTokenRestrictionModal}
          onCancel={handleCloseRestrictionWarning}
        />
      </Trace>
    </ContentWrapper>
  )
}
