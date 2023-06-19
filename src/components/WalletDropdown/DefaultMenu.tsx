import { Trans } from '@lingui/macro'
import { TransactionSummary } from 'components/AccountDetailsV2'
import { useMemo } from 'react'
import { ChevronRight } from 'react-feather'
import styled from 'styled-components/macro'
import { tw } from 'theme/colors'

import { useAllTransactions } from '../../state/transactions/hooks'
import AuthenticatedHeader from './AuthenticatedHeader'
import { MenuState } from './index'

const Divider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  margin-top: 16px;
  margin-bottom: 16px;
`

const ToggleMenuItem = styled.button`
  background-color: transparent;
  margin: 0;
  border: none;
  cursor: pointer;
  display: flex;
  flex: 1;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
  width: 100%;
  padding: 12px 8px;
  color: ${({ theme }) => theme.tw.neutral[600]};
  :hover {
    color: ${({ theme }) => theme.tw.black};
    background-color: ${({ theme }) => theme.backgroundModule};
    transition: ${({
      theme: {
        transition: { duration, timing },
      },
    }) => `${duration.fast} all ${timing.in}`};
  }
`

const FlexContainer = styled.div`
  display: flex;
`

const LatestPendingTxnBox = styled(FlexContainer)`
  display: flex;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.backgroundModule};
  align-items: center;
  gap: 8px;
`

const PendingBadge = styled.span`
  background-color: ${tw.black};
  color: ${tw.white};
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
`

const IconWrap = styled.span`
  display: inline-block;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 4px;
  height: 16px;
`

const DefaultMenuWrap = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 8px;
`

const DefaultText = styled.span`
  font-size: 14px;
  font-weight: 400;
`

const WalletDropdown = ({ setMenu }: { setMenu: (state: MenuState) => void }) => {
  const allTransactions = useAllTransactions()

  const pendingTransactions = useMemo(
    () => Object.values(allTransactions).filter((tx) => !tx.receipt),
    [allTransactions]
  )
  const latestPendingTransaction =
    pendingTransactions.length > 0
      ? pendingTransactions.sort((tx1, tx2) => tx2.addedTime - tx1.addedTime)[0]
      : undefined

  return (
    <DefaultMenuWrap>
      <AuthenticatedHeader />

      <Divider />

      <ToggleMenuItem data-testid="wallet-transactions" onClick={() => setMenu(MenuState.TRANSACTIONS)}>
        <DefaultText>
          <Trans>Transactions</Trans>{' '}
          {pendingTransactions.length > 0 && (
            <PendingBadge>
              {pendingTransactions.length} <Trans>Pending</Trans>
            </PendingBadge>
          )}
        </DefaultText>
        <IconWrap>
          <ChevronRight size={16} strokeWidth={3} />
        </IconWrap>
      </ToggleMenuItem>
      {!!latestPendingTransaction && (
        <LatestPendingTxnBox>
          <TransactionSummary
            key={latestPendingTransaction.hash}
            transactionDetails={latestPendingTransaction}
            isLastTransactionInList={true}
          />
        </LatestPendingTxnBox>
      )}
    </DefaultMenuWrap>
  )
}

export default WalletDropdown
