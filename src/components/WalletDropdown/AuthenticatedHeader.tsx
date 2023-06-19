import { Trans } from '@lingui/macro'
import { formatUSDPrice } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { getConnection } from 'connection/utils'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import useCopyClipboard from 'hooks/useCopyClipboard'
import useStablecoinPrice from 'hooks/useStablecoinPrice'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useCallback, useMemo } from 'react'
import { Copy, ExternalLink as ExternalLinkIcon, Power } from 'react-feather'
import { Text } from 'rebass'
import { useCloseModal } from 'state/application/hooks'
import { useCurrencyBalanceString } from 'state/connection/hooks'
import { useAppDispatch } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { shortenAddress } from '../../nft/utils/address'
import StatusIcon from '../Identicon/StatusIcon'
import IconButton, { IconHoverText } from './IconButton'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`

const USDText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.tw.neutral[600]};
  margin-top: 8px;
`
const FlexContainer = styled.div`
  display: flex;
`

const StatusWrapper = styled.div`
  display: inline-block;
  margin-top: 4px;
  width: 70%;
`

const TruncatedTextStyle = css`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const AccountNamesWrapper = styled.div`
  ${TruncatedTextStyle}
  margin-right: 8px;
`

const ENSNameContainer = styled(ThemedText.SubHeader)`
  ${TruncatedTextStyle}
  color: ${({ theme }) => theme.tw.black};
  margin-top: 2.5px;
`

const AccountContainer = styled(ThemedText.BodySmall)`
  ${TruncatedTextStyle}
  color: ${({ theme }) => theme.tw.neutral[600]};
  margin-top: 2.5px;
`
const BalanceWrapper = styled.div`
  padding: 16px 0;
`

const HeaderWrapper = styled.div`
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
`

const AuthenticatedHeaderWrapper = styled.div`
  padding: 0 16px;
`

const AuthenticatedHeader = () => {
  const { account, chainId, connector, ENSName } = useWeb3React()
  const [isCopied, setCopied] = useCopyClipboard()
  const copy = useCallback(() => {
    setCopied(account || '')
  }, [account, setCopied])
  const dispatch = useAppDispatch()
  const balanceString = useCurrencyBalanceString(account ?? '')
  const {
    nativeCurrency: { symbol: nativeCurrencySymbol },
    explorer,
  } = getChainInfoOrDefault(chainId ? chainId : SupportedChainId.MAINNET)
  const closeModal = useCloseModal()

  const connectionType = getConnection(connector).type
  const nativeCurrency = useNativeCurrency()
  const nativeCurrencyPrice = useStablecoinPrice(nativeCurrency ?? undefined)

  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()
    dispatch(updateSelectedWallet({ wallet: undefined }))
    closeModal()
  }, [closeModal, connector, dispatch])

  const amountUSD = useMemo(() => {
    if (!nativeCurrencyPrice || !balanceString) return undefined
    const price = parseFloat(nativeCurrencyPrice.toFixed(5))
    const balance = parseFloat(balanceString)
    return price * balance
  }, [balanceString, nativeCurrencyPrice])

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <FlexContainer>
            <StatusIcon connectionType={connectionType} size={24} />
            {ENSName ? (
              <AccountNamesWrapper>
                <ENSNameContainer>{ENSName}</ENSNameContainer>
                <AccountContainer>{account && shortenAddress(account, 2, 4)}</AccountContainer>
              </AccountNamesWrapper>
            ) : (
              <ThemedText.SubHeader marginTop="2.5px">{account && shortenAddress(account, 2, 4)}</ThemedText.SubHeader>
            )}
          </FlexContainer>
        </StatusWrapper>
        <IconContainer>
          <IconButton onClick={copy} Icon={Copy}>
            {isCopied ? <Trans>Copied!</Trans> : <Trans>Copy</Trans>}
          </IconButton>
          <IconButton href={`${explorer}address/${account}`} target="_blank" Icon={ExternalLinkIcon}>
            <Trans>Explore</Trans>
          </IconButton>
          <IconButton data-testid="wallet-disconnect" onClick={disconnect} Icon={Power}>
            <Trans>Disconnect</Trans>
          </IconButton>
        </IconContainer>
      </HeaderWrapper>
      <Column>
        <BalanceWrapper>
          <Text fontSize={36} fontWeight={400}>
            {balanceString} {nativeCurrencySymbol}
          </Text>
          {amountUSD !== undefined && <USDText>{formatUSDPrice(amountUSD)} USD</USDText>}
        </BalanceWrapper>
      </Column>
    </AuthenticatedHeaderWrapper>
  )
}

export default AuthenticatedHeader
