import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { CurrencyAmount, Percent } from '@violetprotocol/mauve-sdk-core'
import { EATMulticall, NonfungiblePositionManager } from '@violetprotocol/mauve-v3-sdk'
import { EAT, EmbeddedAuthorization, useAuthorization, useEnrollment } from '@violetprotocol/sdk'
import { useEmbeddedAuthorizationRef } from '@violetprotocol/sdk-web3-react'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import useAnalyticsContext from 'components/analytics/useSegmentAnalyticsContext'
import RangeBadge from 'components/Badge/RangeBadge'
import { ButtonConfirmed, VioletProtectedButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount'
import Loader from 'components/Loader'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import Slider from 'components/Slider'
import Toggle from 'components/Toggle'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useV3PositionFromTokenId } from 'hooks/useV3Positions'
import { Call, handleErrorCodes } from 'hooks/useVioletAuthorize'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useBurnV3ActionHandlers, useBurnV3State, useDerivedV3BurnInfo } from 'state/burn/v3/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { logErrorWithNewRelic } from 'utils/newRelicErrorIngestion'
import { getVioletAuthzPayloadFromCall } from 'utils/violet/authorizeProps'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent,
} from '../../components/TransactionConfirmationModal'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import { TransactionType } from '../../state/transactions/types'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import AppBody from '../AppBody'
import { Break, ResponsiveHeaderText, SmallMaxButton, Wrapper } from './styled'

const DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100)

// redirect invalid tokenIds
export default function RemoveLiquidityV3() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const location = useLocation()
  const parsedTokenId = useMemo(() => {
    try {
      return BigNumber.from(tokenId)
    } catch {
      return null
    }
  }, [tokenId])

  if (parsedTokenId === null || parsedTokenId.eq(0)) {
    return <Navigate to={{ ...location, pathname: '/pool' }} replace />
  }

  return <Remove tokenId={parsedTokenId} />
}

function Remove({ tokenId }: { tokenId: BigNumber }) {
  const { position } = useV3PositionFromTokenId(tokenId)
  const theme = useTheme()
  const { account, chainId, provider } = useWeb3React()
  const [call, setCall] = useState<Call | null>(null)
  const [showVioletEmbed, setShowVioletEmbed] = useState(false)
  const [violetError, setVioletError] = useState<string>('')
  const [pendingVioletAuth, setPendingVioletAuth] = useState(false)

  const { authorize } = useAuthorization()
  const { isEnrolled } = useEnrollment({
    userAddress: account,
  })
  const embeddedAuthorizationRef = useEmbeddedAuthorizationRef()

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false)
  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  // burn state
  const { percent } = useBurnV3State()
  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  } = useDerivedV3BurnInfo(position, receiveWETH)
  const { onPercentSelect } = useBurnV3ActionHandlers()

  const removed = position?.liquidity?.eq(0)

  // boilerplate for the slider
  const [percentForSlider, onPercentSelectForSlider] = useDebouncedChangeHandler(percent, onPercentSelect)

  const deadline = useTransactionDeadline() // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE) // custom from users

  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txnHash, setTxnHash] = useState<string | undefined>()
  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const { analytics } = useAnalyticsContext()

  // Segment Page view analytics
  useEffect(() => {
    analytics.track('Remove Liquidity page viewed')
  }, [analytics])

  const authorizeProps = useMemo(() => {
    if (!account || !chainId || !call) {
      return
    }
    return getVioletAuthzPayloadFromCall({
      call,
      account,
      chainId,
    })
  }, [account, chainId, call])

  async function submitTransaction({ value, data }: { value: string; data: string }) {
    if (
      !positionManager ||
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage ||
      !provider
    ) {
      throw new Error('Missing parameters to submit the transaction')
    }

    setAttemptingTxn(true)

    const txn = {
      to: positionManager.address,
      data,
      value,
    }

    provider
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return provider
          .getSigner()
          .sendTransaction(newTxn)
          .then((response: TransactionResponse) => {
            sendEvent({
              category: 'Liquidity',
              action: 'RemoveV3',
              label: [liquidityValue0.currency.symbol, liquidityValue1.currency.symbol].join('/'),
            })
            setTxnHash(response.hash)
            setAttemptingTxn(false)
            addTransaction(response, {
              type: TransactionType.REMOVE_LIQUIDITY_V3,
              baseCurrencyId: currencyId(liquidityValue0.currency),
              quoteCurrencyId: currencyId(liquidityValue1.currency),
              expectedAmountBaseRaw: liquidityValue0.quotient.toString(),
              expectedAmountQuoteRaw: liquidityValue1.quotient.toString(),
            })
          })
      })
      .catch((error) => {
        setAttemptingTxn(false)
        console.error(error)
        logErrorWithNewRelic({
          error,
          errorString: 'error removing liquidity with violet EAT',
        })
      })
  }

  type HandleVioletResponseAndSubmitTransactionProps = {
    to: string
    value: string
    v: EAT['signature']['v']
    r: EAT['signature']['r']
    s: EAT['signature']['s']
    expiry: EAT['expiry']
    calls: Call['calls']
  }

  const handleVioletResponseAndSubmitTransaction = ({
    value,
    v,
    r,
    s,
    expiry,
    calls,
  }: HandleVioletResponseAndSubmitTransactionProps) => {
    // Might be helpful to leave this console.log?
    console.log(
      `TX payload to submit: ${JSON.stringify(
        {
          value,
          v,
          r,
          s,
          expiry,
          calls,
        },
        null,
        2
      )}`
    )

    const calldata = EATMulticall.encodePostsignMulticall(v, r, s, expiry, calls)
    if (!calldata) {
      throw new Error('Failed to generate calldata from violet EAT')
    }

    return submitTransaction({ data: calldata, value })
  }

  const onBurn = async () => {
    if (
      !positionManager ||
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage ||
      !provider
    ) {
      return
    }

    // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
    // vast majority of cases
    const callParameters = NonfungiblePositionManager.removeCallParameters(positionSDK, {
      tokenId: tokenId.toString(),
      liquidityPercentage,
      slippageTolerance: allowedSlippage,
      deadline: deadline.toString(),
      collectOptions: {
        expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(liquidityValue0.currency, 0),
        expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(liquidityValue1.currency, 0),
        recipient: account,
      },
    })
    const { calls, address, value } = {
      ...callParameters,
      address: positionManager.address,
    }

    try {
      const { functionSignature, parameters } = await EATMulticall.encodePresignMulticall(calls)

      // If the user is already enrolled, we take a shortcut and
      // use Violet iFrame (embedded authentication)
      if (isEnrolled) {
        // TODO: address is confusing! It can be confused with the user's address
        setCall({
          calls,
          value,
          functionSignature,
          parameters,
          address,
        })
        setShowVioletEmbed(true)

        return
      }

      setPendingVioletAuth(true)

      const response = await authorize({
        transaction: {
          data: parameters,
          functionSignature,
          targetContract: address,
        },
        address: account,
        chainId,
      })

      if (!response) {
        setVioletError('FAILED_CALL')
        return
      }

      const [violet, error] = response

      if (!violet) {
        console.error(error)
        setVioletError(error?.code ?? 'FAILED_CALL')
        return
      }
      const eat = violet.eat

      if (!eat?.signature || !eat?.expiry) {
        setVioletError(error?.code ?? 'FAILED_CALL')
        return
      }

      return handleVioletResponseAndSubmitTransaction({
        ...eat.signature,
        expiry: eat.expiry,
        to: address,
        value,
        calls,
      })
    } catch (error) {
      console.error('Error generating an EAT: ', error)
      setVioletError(error)
      logErrorWithNewRelic({
        error,
        errorString: 'Failed generating a Violet EAT',
      })
      return
    }
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      onPercentSelectForSlider(0)
    }
    setAttemptingTxn(false)
    setTxnHash('')
  }, [onPercentSelectForSlider, txnHash])

  const pendingText = (
    <>
      Removing {liquidityValue0?.toSignificant(6)} {liquidityValue0?.currency?.symbol} and{' '}
      {liquidityValue1?.toSignificant(6)} {liquidityValue1?.currency?.symbol}
    </>
  )

  function modalHeader() {
    return (
      <AutoColumn gap="sm" style={{ padding: '16px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={500}>
            <>Pooled {liquidityValue0?.currency?.symbol}:</>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={500} marginLeft="6px">
              {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue0?.currency} />
          </RowFixed>
        </RowBetween>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={500}>
            <>Pooled {liquidityValue1?.currency?.symbol}:</>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={500} marginLeft="6px">
              {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue1?.currency} />
          </RowFixed>
        </RowBetween>
        {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
          <>
            <ThemedText.DeprecatedItalic fontSize={12} color={theme.textSecondary} textAlign="left" padding="8px 0 0 0">
              <>You will also collect fees earned from this position.</>
            </ThemedText.DeprecatedItalic>
            <RowBetween>
              <Text fontSize={16} fontWeight={500}>
                <>{feeValue0?.currency?.symbol} Fees Earned:</>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={500} marginLeft="6px">
                  {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue0?.currency} />
              </RowFixed>
            </RowBetween>
            <RowBetween>
              <Text fontSize={16} fontWeight={500}>
                <>{feeValue1?.currency?.symbol} Fees Earned:</>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={500} marginLeft="6px">
                  {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue1?.currency} />
              </RowFixed>
            </RowBetween>
          </>
        ) : null}
        <VioletProtectedButtonPrimary mt="16px" onClick={onBurn}>
          <>Remove</>
        </VioletProtectedButtonPrimary>
      </AutoColumn>
    )
  }

  const showCollectAsWeth = Boolean(
    liquidityValue0?.currency &&
      liquidityValue1?.currency &&
      (liquidityValue0.currency.isNative ||
        liquidityValue1.currency.isNative ||
        WRAPPED_NATIVE_CURRENCY[liquidityValue0.currency.chainId]?.equals(liquidityValue0.currency.wrapped) ||
        WRAPPED_NATIVE_CURRENCY[liquidityValue1.currency.chainId]?.equals(liquidityValue1.currency.wrapped))
  )
  return (
    <AutoColumn>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txnHash ?? ''}
        content={() =>
          showVioletEmbed && isEnrolled && authorizeProps ? (
            violetError ? (
              <TransactionErrorContent onDismiss={handleDismissConfirmation} message={handleErrorCodes(violetError)} />
            ) : (
              <EmbeddedAuthorization
                ref={embeddedAuthorizationRef}
                authorizeProps={authorizeProps}
                onIssued={({ signature, expiry }: any) => {
                  if (!call) {
                    throw new Error('Missing call following EAT issuance')
                  }
                  handleVioletResponseAndSubmitTransaction({
                    ...signature,
                    expiry,
                    to: call.address,
                    calls: call.calls,
                    value: call.value,
                  })
                }}
                onFailed={(response: any) => {
                  console.error(`Violet Embedded Auth failed: ${JSON.stringify(response, null, 2)}`)
                  setVioletError(JSON.stringify(response?.code))
                }}
              />
            )
          ) : violetError ? (
            <TransactionErrorContent onDismiss={handleDismissConfirmation} message={handleErrorCodes(violetError)} />
          ) : pendingVioletAuth ? (
            <ConfirmationPendingContent onDismiss={handleDismissConfirmation} pendingText={pendingText} />
          ) : (
            <ConfirmationModalContent
              title="Remove Liquidity"
              onDismiss={handleDismissConfirmation}
              topContent={modalHeader}
            />
          )
        }
        pendingText={pendingText}
      />
      <AppBody $maxWidth="unset">
        <AddRemoveTabs
          creating={false}
          adding={false}
          positionID={tokenId.toString()}
          defaultSlippage={DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE}
        />
        <Wrapper>
          {position ? (
            <AutoColumn gap="lg">
              <RowBetween>
                <RowFixed>
                  <DoubleCurrencyLogo
                    currency0={feeValue0?.currency}
                    currency1={feeValue1?.currency}
                    size={20}
                    margin={true}
                  />
                  <ThemedText.DeprecatedLabel
                    ml="10px"
                    fontSize="20px"
                  >{`${feeValue0?.currency?.symbol}/${feeValue1?.currency?.symbol}`}</ThemedText.DeprecatedLabel>
                </RowFixed>
                <RangeBadge removed={removed} inRange={!outOfRange} />
              </RowBetween>
              <LightCard>
                <AutoColumn gap="md">
                  <ThemedText.DeprecatedMain fontWeight={400}>
                    <>Amount</>
                  </ThemedText.DeprecatedMain>
                  <RowBetween>
                    <ResponsiveHeaderText>
                      <>{percentForSlider}%</>
                    </ResponsiveHeaderText>
                    <AutoRow gap="4px" justify="flex-end">
                      <SmallMaxButton onClick={() => onPercentSelect(25)} width="20%">
                        <>25%</>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(50)} width="20%">
                        <>50%</>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(75)} width="20%">
                        <>75%</>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(100)} width="20%">
                        <>Max</>
                      </SmallMaxButton>
                    </AutoRow>
                  </RowBetween>
                  <Slider value={percentForSlider} onChange={onPercentSelectForSlider} />
                </AutoColumn>
              </LightCard>
              <LightCard>
                <AutoColumn gap="md">
                  <RowBetween>
                    <Text fontSize={16} fontWeight={500}>
                      <>Pooled {liquidityValue0?.currency?.symbol}:</>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500} marginLeft="6px">
                        {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
                      </Text>
                      <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue0?.currency} />
                    </RowFixed>
                  </RowBetween>
                  <RowBetween>
                    <Text fontSize={16} fontWeight={500}>
                      <>Pooled {liquidityValue1?.currency?.symbol}:</>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500} marginLeft="6px">
                        {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
                      </Text>
                      <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue1?.currency} />
                    </RowFixed>
                  </RowBetween>
                  {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
                    <>
                      <Break />
                      <RowBetween>
                        <Text fontSize={16} fontWeight={500}>
                          <>{feeValue0?.currency?.symbol} Fees Earned:</>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={500} marginLeft="6px">
                            {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue0?.currency} />
                        </RowFixed>
                      </RowBetween>
                      <RowBetween>
                        <Text fontSize={16} fontWeight={500}>
                          <>{feeValue1?.currency?.symbol} Fees Earned:</>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={500} marginLeft="6px">
                            {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue1?.currency} />
                        </RowFixed>
                      </RowBetween>
                    </>
                  ) : null}
                </AutoColumn>
              </LightCard>

              {showCollectAsWeth && (
                <RowBetween>
                  <ThemedText.DeprecatedMain>
                    <>Collect as {nativeWrappedSymbol}</>
                  </ThemedText.DeprecatedMain>
                  <Toggle
                    id="receive-as-weth"
                    isActive={receiveWETH}
                    toggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
                  />
                </RowBetween>
              )}

              <div style={{ display: 'flex' }}>
                <AutoColumn gap="md" style={{ flex: '1' }}>
                  <ButtonConfirmed
                    confirmed={false}
                    disabled={removed || percent === 0 || !liquidityValue0}
                    onClick={() => setShowConfirm(true)}
                    violetProtected
                  >
                    {removed ? <>Closed</> : error ?? <>Remove</>}
                  </ButtonConfirmed>
                </AutoColumn>
              </div>
            </AutoColumn>
          ) : (
            <Loader />
          )}
        </Wrapper>
      </AppBody>
    </AutoColumn>
  )
}
