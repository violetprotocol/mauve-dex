import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Percent } from '@violetprotocol/mauve-sdk-core'
import { EATMulticall, FeeAmount, NonfungiblePositionManager } from '@violetprotocol/mauve-v3-sdk'
import { EAT, EmbeddedAuthorization, useAuthorization, useEnrollment } from '@violetprotocol/sdk'
import { useEmbeddedAuthorizationRef } from '@violetprotocol/sdk-web3-react'
import { useWeb3React } from '@web3-react/core'
import useAnalyticsContext from 'components/analytics/useSegmentAnalyticsContext'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { Call, handleErrorCodes } from 'hooks/useVioletAuthorize'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import {
  useRangeHopCallbacks,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks'
import { useTheme } from 'styled-components/macro'
import { logErrorWithNewRelic } from 'utils/newRelicErrorIngestion'
import { AnalyticsEvent } from 'utils/violet/analyticsEvents'
import { getVioletAuthzPayloadFromCall } from 'utils/violet/authorizeProps'

import {
  ButtonError,
  ButtonLight,
  ButtonPrimary,
  ButtonText,
  ButtonYellow,
  VioletProtectedButtonPrimary,
} from '../../components/Button'
import { OutlineCard, YellowCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import FeeSelector from '../../components/FeeSelector'
import HoverInlineText from '../../components/HoverInlineText'
import LiquidityChartRangeInput from '../../components/LiquidityChartRangeInput'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { PositionPreview } from '../../components/PositionPreview'
import RangeSelector from '../../components/RangeSelector'
import PresetsButtons from '../../components/RangeSelector/PresetsButtons'
import RateToggle from '../../components/RateToggle'
import Row, { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent,
} from '../../components/TransactionConfirmationModal'
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '../../constants/addresses'
import { ZERO_PERCENT } from '../../constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useArgentWalletContract } from '../../hooks/useArgentWalletContract'
import { useV3NFTPositionManagerContract } from '../../hooks/useContract'
import { useDerivedPositionInfo } from '../../hooks/useDerivedPositionInfo'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useV3PositionFromTokenId } from '../../hooks/useV3Positions'
import { useToggleWalletModal } from '../../state/application/hooks'
import { Bound, Field } from '../../state/mint/v3/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import approveAmountCalldata from '../../utils/approveAmountCalldata'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { Dots } from '../Pool/styleds'
import { Review } from './Review'
import {
  CurrencyDropdown,
  DynamicSection,
  HideMedium,
  MediumOnly,
  PageWrapper,
  ResponsiveTwoColumns,
  RightContainer,
  ScrollablePage,
  StackedContainer,
  StackedItem,
  StyledInput,
  Wrapper,
} from './styled'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function AddLiquidity() {
  const navigate = useNavigate()
  const {
    currencyIdA,
    currencyIdB,
    feeAmount: feeAmountFromUrl,
    tokenId,
  } = useParams<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>()
  const { account, chainId, provider } = useWeb3React()

  const [call, setCall] = useState<Call | null>(null)
  const [showVioletEmbed, setShowVioletEmbed] = useState(false)
  const [violetError, setVioletError] = useState<string>('')
  const [pendingVioletAuth, setPendingVioletAuth] = useState(false)
  const { authorize } = useAuthorization()
  const { isEnrolled } = useEnrollment({
    userAddress: account,
  })
  const embeddedAuthRef = useEmbeddedAuthorizationRef()
  const { analytics } = useAnalyticsContext()

  // Segment Page view analytics
  useEffect(() => {
    analytics.track(AnalyticsEvent.ADD_LIQUIDITY_PAGE_VIEWED)
  }, [analytics])

  const theme = useTheme()

  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected
  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const parsedQs = useParsedQueryString()

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    tokenId ? BigNumber.from(tokenId) : undefined
  )
  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  // mint state
  const { independentField, typedValue, startPriceTypedValue, rightRangeTypedValue, leftRangeTypedValue } =
    useV3MintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  } = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onBothRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState(false)

  useEffect(() => setShowCapitalEfficiencyWarning(false), [baseCurrency, quoteCurrency, feeAmount])

  useEffect(() => {
    if (
      parsedQs.minPrice &&
      typeof parsedQs.minPrice === 'string' &&
      parsedQs.minPrice !== leftRangeTypedValue &&
      !isNaN(parsedQs.minPrice as any)
    ) {
      onLeftRangeInput(parsedQs.minPrice)
    }

    if (
      parsedQs.maxPrice &&
      typeof parsedQs.maxPrice === 'string' &&
      parsedQs.maxPrice !== rightRangeTypedValue &&
      !isNaN(parsedQs.maxPrice as any)
    ) {
      onRightRangeInput(parsedQs.maxPrice)
    }
  }, [parsedQs, rightRangeTypedValue, leftRangeTypedValue, onRightRangeInput, onLeftRangeInput])

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const usdcValues = {
    [Field.CURRENCY_A]: useStablecoinValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useStablecoinValue(parsedAmounts[Field.CURRENCY_B]),
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  const argentWalletContract = useArgentWalletContract()

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : parsedAmounts[Field.CURRENCY_A],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    argentWalletContract ? undefined : parsedAmounts[Field.CURRENCY_B],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined
  )

  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  async function submitTransaction({ to, data, value }: { to: string; data: string; value: string }) {
    if (!chainId || !provider || !baseCurrency || !quoteCurrency || !position) {
      throw new Error('Missing parameters to submit the transaction')
    }

    setAttemptingTxn(true)

    let txn: { to: string; data: string; value: string } = {
      to,
      data,
      value,
    }

    if (argentWalletContract) {
      const amountA = parsedAmounts[Field.CURRENCY_A]
      const amountB = parsedAmounts[Field.CURRENCY_B]
      const batch = [
        ...(amountA && amountA.currency.isToken
          ? [approveAmountCalldata(amountA, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])]
          : []),
        ...(amountB && amountB.currency.isToken
          ? [approveAmountCalldata(amountB, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])]
          : []),
        {
          to: txn.to,
          data: txn.data,
          value: txn.value,
        },
      ]
      const data = argentWalletContract.interface.encodeFunctionData('wc_multiCall', [batch])
      txn = {
        to: argentWalletContract.address,
        data,
        value: '0x0',
      }
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
            setAttemptingTxn(false)
            addTransaction(response, {
              type: TransactionType.ADD_LIQUIDITY_V3_POOL,
              baseCurrencyId: currencyId(baseCurrency),
              quoteCurrencyId: currencyId(quoteCurrency),
              createPool: Boolean(noLiquidity),
              expectedAmountBaseRaw: parsedAmounts[Field.CURRENCY_A]?.quotient?.toString() ?? '0',
              expectedAmountQuoteRaw: parsedAmounts[Field.CURRENCY_B]?.quotient?.toString() ?? '0',
              feeAmount: position.pool.fee,
            })
            setTxHash(response.hash)
            hasExistingPosition
              ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_TRANSACTION_SUCCESSFUL)
              : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_TRANSACTION_SUCCESSFUL)
          })
      })
      .catch((error) => {
        console.error('Failed to send transaction', error)
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          // TODO: Handle error gracefully if the EAT is expired
          console.error(error)
          hasExistingPosition
            ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_TRANSACTION_USER_REJECTED)
            : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_TRANSACTION_USER_REJECTED)
        }
        hasExistingPosition
          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_TRANSACTION_FAILED)
          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_TRANSACTION_FAILED)
        logErrorWithNewRelic({ error, errorString: 'violet add liquidity' })
      })
      .finally(() => {
        setShowVioletEmbed(false)
        setCall(null)
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
    to,
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
          to,
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

    return submitTransaction({ to, data: calldata, value })
  }

  // Main function triggered when "Add" is clicked on the Add Liquidity preview modal
  async function onAdd() {
    if (
      !chainId ||
      !provider ||
      !account ||
      !positionManager ||
      !baseCurrency ||
      !quoteCurrency ||
      !position ||
      !account ||
      !deadline
    ) {
      return
    }

    const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined

    const { calls, value } =
      hasExistingPosition && tokenId
        ? NonfungiblePositionManager.addCallParameters(position, {
            tokenId,
            slippageTolerance: allowedSlippage,
            deadline: deadline.toString(),
            useNative,
          })
        : NonfungiblePositionManager.addCallParameters(position, {
            slippageTolerance: allowedSlippage,
            recipient: account,
            deadline: deadline.toString(),
            useNative,
            createPool: noLiquidity,
          })

    const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]

    try {
      const { functionSignature, parameters } = await EATMulticall.encodePresignMulticall(calls)

      // If the user is already enrolled, we take a shortcut and
      // use Violet iFrame (embedded authentication)
      if (isEnrolled) {
        // TODO: address is confusing! It can be confused with the user's address
        setCall({ calls, value, functionSignature, parameters, address: to })
        setShowVioletEmbed(true)

        return
      }

      setPendingVioletAuth(true)

      const response = await authorize({
        transaction: {
          data: parameters,
          functionSignature,
          targetContract: to,
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
        hasExistingPosition
          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_VIOLET_FAILED_CALL)
          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_VIOLET_FAILED_CALL)
        setVioletError(error?.code ?? 'FAILED_CALL')
        return
      }
      const eat = violet.eat

      if (!eat?.signature || !eat?.expiry) {
        setVioletError(error?.code ?? 'FAILED_CALL')
        hasExistingPosition
          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_VIOLET_FAILED_CALL)
          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_VIOLET_FAILED_CALL)
        return
      }

      return handleVioletResponseAndSubmitTransaction({ ...eat.signature, expiry: eat.expiry, to, value, calls })
    } catch (error) {
      console.error('Error generating an EAT: ', error)
      setVioletError(error)
      hasExistingPosition
        ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_VIOLET_FAILED_CALL)
        : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_VIOLET_FAILED_CALL)
      logErrorWithNewRelic({ error, errorString: 'Failed generating a Violet EAT' })
      return
    }
  }

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === 'ETH' ||
          (chainId !== undefined && currencyIdNew === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === 'ETH' ||
            (chainId !== undefined && currencyIdOther === WRAPPED_NATIVE_CURRENCY[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        navigate(`/add/${idA}`)
      } else {
        navigate(`/add/${idA}/${idB}`)
      }
      analytics.track(AnalyticsEvent.POOL_NEW_POSITION_CURRENCY_A_SELECTED)
    },
    [handleCurrencySelect, currencyIdB, navigate, analytics]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        navigate(`/add/${idB}`)
      } else {
        navigate(`/add/${idA}/${idB}`)
      }
      analytics.track(AnalyticsEvent.POOL_NEW_POSITION_CURRENCY_B_SELECTED)
    },
    [handleCurrencySelect, currencyIdA, navigate, analytics]
  )

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('')
      onRightRangeInput('')
      navigate(`/add/${currencyIdA}/${currencyIdB}/${newFeeAmount}`)
    },
    [currencyIdA, currencyIdB, navigate, onLeftRangeInput, onRightRangeInput]
  )

  const handleDismissConfirmation = useCallback(() => {
    hasExistingPosition
      ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_PREVIEW_DISMISSED)
      : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_PREVIEW_DISMISSED)

    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
      // dont jump to pool page if creating
      navigate('/pool')
    }
    setTxHash('')
    setPendingVioletAuth(false)
    setVioletError('')
  }, [navigate, onFieldAInput, txHash, analytics, hasExistingPosition])

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const clearAll = useCallback(() => {
    onFieldAInput('')
    onFieldBInput('')
    onLeftRangeInput('')
    onRightRangeInput('')
    navigate(`/add`)
  }, [navigate, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput])

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  const clearAndSetFullRange = () => {
    onBothRangeInput('', '')
    getSetFullRange()
  }

  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA =
    !argentWalletContract && approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB =
    !argentWalletContract && approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : ''} ${
    !depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
  } ${!outOfRange ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : ''} ${
    !depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''
  }`

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

  const Buttons = () =>
    addIsUnsupported ? (
      <ButtonPrimary disabled={true} $borderRadius="12px" padding="12px">
        <ThemedText.DeprecatedMain mb="4px">
          <>Unsupported Asset</>
        </ThemedText.DeprecatedMain>
      </ButtonPrimary>
    ) : !account ? (
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
        properties={{ received_swap_quote: false }}
        element={InterfaceElementName.CONNECT_WALLET_BUTTON}
      >
        <ButtonLight onClick={toggleWalletModal} $borderRadius="12px" padding="12px">
          <>Connect Wallet</>
        </ButtonLight>
      </TraceEvent>
    ) : (
      <AutoColumn gap="md">
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
          isValid && (
            <RowBetween>
              {showApprovalA && (
                <ButtonPrimary
                  onClick={approveACallback}
                  disabled={approvalA === ApprovalState.PENDING}
                  width={showApprovalB ? '48%' : '100%'}
                >
                  {approvalA === ApprovalState.PENDING ? (
                    <Dots>
                      <>Approving {currencies[Field.CURRENCY_A]?.symbol}</>
                    </Dots>
                  ) : (
                    <>Approve {currencies[Field.CURRENCY_A]?.symbol}</>
                  )}
                </ButtonPrimary>
              )}
              {showApprovalB && (
                <ButtonPrimary
                  onClick={approveBCallback}
                  disabled={approvalB === ApprovalState.PENDING}
                  width={showApprovalA ? '48%' : '100%'}
                >
                  {approvalB === ApprovalState.PENDING ? (
                    <Dots>
                      <>Approving {currencies[Field.CURRENCY_B]?.symbol}</>
                    </Dots>
                  ) : (
                    <>Approve {currencies[Field.CURRENCY_B]?.symbol}</>
                  )}
                </ButtonPrimary>
              )}
            </RowBetween>
          )}
        <ButtonError
          onClick={() => {
            setShowConfirm(true)
            hasExistingPosition
              ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_PREVIEW_CLICKED)
              : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_PREVIEW_CLICKED)
          }}
          disabled={
            !isValid ||
            (!argentWalletContract && approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
            (!argentWalletContract && approvalB !== ApprovalState.APPROVED && !depositBDisabled)
          }
          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <>Preview</>}</Text>
        </ButtonError>
      </AutoColumn>
    )

  return (
    <>
      <ScrollablePage>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={() =>
            showVioletEmbed && isEnrolled && authorizeProps ? (
              violetError ? (
                <TransactionErrorContent
                  onDismiss={handleDismissConfirmation}
                  message={handleErrorCodes(violetError)}
                />
              ) : (
                <EmbeddedAuthorization
                  ref={embeddedAuthRef}
                  authorizationParameters={authorizeProps}
                  onAuthorized={({ signature, expiry }: any) => {
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
                title="Add Liquidity"
                onDismiss={handleDismissConfirmation}
                topContent={() => (
                  <Review
                    parsedAmounts={parsedAmounts}
                    position={position}
                    existingPosition={existingPosition}
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    outOfRange={outOfRange}
                    ticksAtLimit={ticksAtLimit}
                  />
                )}
                bottomContent={() => (
                  <VioletProtectedButtonPrimary
                    style={{ marginTop: '1rem' }}
                    onClick={() => {
                      hasExistingPosition
                        ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_CONFIRM_CLICKED)
                        : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_CONFIRM_CLICKED)
                      onAdd()
                    }}
                  >
                    <Text fontWeight={500} fontSize={20}>
                      <>Add</>
                    </Text>
                  </VioletProtectedButtonPrimary>
                )}
              />
            )
          }
          pendingText={pendingText}
        />
        <PageWrapper wide={!hasExistingPosition}>
          <AddRemoveTabs
            creating={false}
            adding={true}
            positionID={tokenId}
            defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
            showBackLink={!hasExistingPosition}
          >
            {!hasExistingPosition && (
              <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
                <MediumOnly>
                  <ButtonText onClick={clearAll} margin="0 15px 0 0">
                    <ThemedText.DeprecatedBlue fontSize="12px">
                      <>Clear All</>
                    </ThemedText.DeprecatedBlue>
                  </ButtonText>
                </MediumOnly>
                {baseCurrency && quoteCurrency ? (
                  <RateToggle
                    currencyA={baseCurrency}
                    currencyB={quoteCurrency}
                    handleRateToggle={() => {
                      if (!ticksAtLimit[Bound.LOWER] && !ticksAtLimit[Bound.UPPER]) {
                        onLeftRangeInput((invertPrice ? priceLower : priceUpper?.invert())?.toSignificant(6) ?? '')
                        onRightRangeInput((invertPrice ? priceUpper : priceLower?.invert())?.toSignificant(6) ?? '')
                        onFieldAInput(formattedAmounts[Field.CURRENCY_B] ?? '')
                      }
                      navigate(
                        `/add/${currencyIdB as string}/${currencyIdA as string}${feeAmount ? '/' + feeAmount : ''}`
                      )
                    }}
                  />
                ) : null}
              </Row>
            )}
          </AddRemoveTabs>
          <Wrapper>
            <ResponsiveTwoColumns wide={!hasExistingPosition}>
              <AutoColumn gap="lg">
                {!hasExistingPosition && (
                  <>
                    <AutoColumn gap="md">
                      <RowBetween paddingBottom="20px">
                        <ThemedText.DeprecatedLabel>
                          <>Select Pair</>
                        </ThemedText.DeprecatedLabel>
                      </RowBetween>
                      <RowBetween>
                        <CurrencyDropdown
                          value={formattedAmounts[Field.CURRENCY_A]}
                          onUserInput={onFieldAInput}
                          hideInput={true}
                          onMax={() => {
                            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                          }}
                          onCurrencySelect={handleCurrencyASelect}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                          currency={currencies[Field.CURRENCY_A] ?? null}
                          id="add-liquidity-input-tokena"
                          showCommonBases
                        />

                        <div style={{ width: '12px' }} />

                        <CurrencyDropdown
                          value={formattedAmounts[Field.CURRENCY_B]}
                          hideInput={true}
                          onUserInput={onFieldBInput}
                          onCurrencySelect={handleCurrencyBSelect}
                          onMax={() => {
                            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                          }}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                          currency={currencies[Field.CURRENCY_B] ?? null}
                          id="add-liquidity-input-tokenb"
                          showCommonBases
                        />
                      </RowBetween>

                      <FeeSelector
                        disabled={!quoteCurrency || !baseCurrency}
                        feeAmount={feeAmount}
                        handleFeePoolSelect={handleFeePoolSelect}
                        currencyA={baseCurrency ?? undefined}
                        currencyB={quoteCurrency ?? undefined}
                      />
                    </AutoColumn>{' '}
                  </>
                )}
                {hasExistingPosition && existingPosition && (
                  <PositionPreview
                    position={existingPosition}
                    title="Selected Range"
                    inRange={!outOfRange}
                    ticksAtLimit={ticksAtLimit}
                  />
                )}
              </AutoColumn>
              <div>
                <DynamicSection
                  disabled={tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange}
                >
                  <AutoColumn gap="md">
                    <ThemedText.DeprecatedLabel>
                      {hasExistingPosition ? <>Add more liquidity</> : <>Deposit Amounts</>}
                    </ThemedText.DeprecatedLabel>

                    <CurrencyInputPanel
                      value={formattedAmounts[Field.CURRENCY_A]}
                      onUserInput={(value: string) => {
                        onFieldAInput(value)
                        hasExistingPosition
                          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_DEPOSIT_CURRENCY_A_INPUT)
                          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_DEPOSIT_CURRENCY_A_INPUT)
                      }}
                      onMax={() => {
                        onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                        hasExistingPosition
                          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_DEPOSIT_CURRENCY_A_MAX)
                          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_DEPOSIT_CURRENCY_A_MAX)
                      }}
                      showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                      currency={currencies[Field.CURRENCY_A] ?? null}
                      id="add-liquidity-input-tokena"
                      fiatValue={usdcValues[Field.CURRENCY_A]}
                      showCommonBases
                      locked={depositADisabled}
                    />

                    <CurrencyInputPanel
                      value={formattedAmounts[Field.CURRENCY_B]}
                      onUserInput={(value: string) => {
                        onFieldBInput(value)
                        hasExistingPosition
                          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_DEPOSIT_CURRENCY_B_INPUT)
                          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_DEPOSIT_CURRENCY_B_INPUT)
                      }}
                      onMax={() => {
                        onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                        hasExistingPosition
                          ? analytics.track(AnalyticsEvent.POOL_INCREASE_LIQUIDITY_DEPOSIT_CURRENCY_B_MAX)
                          : analytics.track(AnalyticsEvent.ADD_LIQUIDITY_DEPOSIT_CURRENCY_B_MAX)
                      }}
                      showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                      fiatValue={usdcValues[Field.CURRENCY_B]}
                      currency={currencies[Field.CURRENCY_B] ?? null}
                      id="add-liquidity-input-tokenb"
                      showCommonBases
                      locked={depositBDisabled}
                    />
                  </AutoColumn>
                </DynamicSection>
              </div>

              {!hasExistingPosition ? (
                <>
                  <HideMedium>
                    <Buttons />
                  </HideMedium>
                  <RightContainer gap="lg">
                    <DynamicSection gap="md" disabled={!feeAmount || invalidPool}>
                      {!noLiquidity ? (
                        <>
                          <RowBetween>
                            <ThemedText.DeprecatedLabel>
                              <>Set Price Range</>
                            </ThemedText.DeprecatedLabel>
                          </RowBetween>

                          {price && baseCurrency && quoteCurrency && !noLiquidity && (
                            <AutoRow gap="4px" justify="center" style={{ marginTop: '0.5rem' }}>
                              <>
                                <ThemedText.DeprecatedMain
                                  fontWeight={500}
                                  textAlign="center"
                                  fontSize={12}
                                  color="text1"
                                >
                                  Current Price:
                                </ThemedText.DeprecatedMain>
                                <ThemedText.DeprecatedBody
                                  fontWeight={500}
                                  textAlign="center"
                                  fontSize={12}
                                  color="text1"
                                >
                                  <HoverInlineText
                                    maxCharacters={20}
                                    text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                                  />
                                </ThemedText.DeprecatedBody>
                                <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                                  {quoteCurrency?.symbol} per {baseCurrency.symbol}
                                </ThemedText.DeprecatedBody>
                              </>
                            </AutoRow>
                          )}

                          <LiquidityChartRangeInput
                            currencyA={baseCurrency ?? undefined}
                            currencyB={quoteCurrency ?? undefined}
                            feeAmount={feeAmount}
                            ticksAtLimit={ticksAtLimit}
                            price={
                              price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
                            }
                            priceLower={priceLower}
                            priceUpper={priceUpper}
                            onLeftRangeInput={onLeftRangeInput}
                            onRightRangeInput={onRightRangeInput}
                            interactive={!hasExistingPosition}
                          />
                        </>
                      ) : (
                        <AutoColumn gap="md">
                          <RowBetween>
                            <ThemedText.DeprecatedLabel>
                              <>Set Starting Price</>
                            </ThemedText.DeprecatedLabel>
                          </RowBetween>
                          {noLiquidity && (
                            <OutlineCard
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: '1rem 1rem',
                              }}
                            >
                              <ThemedText.DeprecatedBody
                                fontSize={14}
                                style={{ fontWeight: 500 }}
                                textAlign="left"
                                color={theme.accentAction}
                              >
                                <>
                                  This pool must be initialized before you can add liquidity. To initialize, select a
                                  starting price for the pool. Then, enter your liquidity price range and deposit
                                  amount. Gas fees will be higher than usual due to the initialization transaction.
                                </>
                              </ThemedText.DeprecatedBody>
                            </OutlineCard>
                          )}
                          <OutlineCard padding="12px">
                            <StyledInput
                              className="start-price-input"
                              value={startPriceTypedValue}
                              onUserInput={onStartPriceInput}
                            />
                          </OutlineCard>
                          <RowBetween
                            style={{
                              backgroundColor: theme.backgroundSurface,
                              padding: '12px',
                              borderRadius: '12px',
                            }}
                          >
                            <ThemedText.DeprecatedMain>
                              <>Current {baseCurrency?.symbol} Price:</>
                            </ThemedText.DeprecatedMain>
                            <ThemedText.DeprecatedMain>
                              {price ? (
                                <ThemedText.DeprecatedMain>
                                  <RowFixed>
                                    <HoverInlineText
                                      maxCharacters={20}
                                      text={invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)}
                                    />{' '}
                                    <span style={{ marginLeft: '4px' }}>{quoteCurrency?.symbol}</span>
                                  </RowFixed>
                                </ThemedText.DeprecatedMain>
                              ) : (
                                '-'
                              )}
                            </ThemedText.DeprecatedMain>
                          </RowBetween>
                        </AutoColumn>
                      )}
                    </DynamicSection>

                    <DynamicSection
                      gap="md"
                      disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
                    >
                      <StackedContainer>
                        <StackedItem
                          style={{
                            opacity: showCapitalEfficiencyWarning ? '0.05' : 1,
                          }}
                        >
                          <AutoColumn gap="md">
                            {noLiquidity && (
                              <RowBetween>
                                <ThemedText.DeprecatedLabel>
                                  <>Set Price Range</>
                                </ThemedText.DeprecatedLabel>
                              </RowBetween>
                            )}
                            <RangeSelector
                              priceLower={priceLower}
                              priceUpper={priceUpper}
                              getDecrementLower={getDecrementLower}
                              getIncrementLower={getIncrementLower}
                              getDecrementUpper={getDecrementUpper}
                              getIncrementUpper={getIncrementUpper}
                              onLeftRangeInput={onLeftRangeInput}
                              onRightRangeInput={onRightRangeInput}
                              currencyA={baseCurrency}
                              currencyB={quoteCurrency}
                              feeAmount={feeAmount}
                              ticksAtLimit={ticksAtLimit}
                            />
                            {!noLiquidity && (
                              <PresetsButtons
                                setFullRange={() => {
                                  setShowCapitalEfficiencyWarning(true)
                                }}
                              />
                            )}
                          </AutoColumn>
                        </StackedItem>

                        {showCapitalEfficiencyWarning && (
                          <StackedItem zIndex={1}>
                            <YellowCard
                              padding="15px"
                              $borderRadius="12px"
                              height="100%"
                              style={{
                                borderColor: theme.accentWarning,
                                border: '1px solid',
                              }}
                            >
                              <AutoColumn gap="sm" style={{ height: '100%' }}>
                                <RowFixed>
                                  <AlertTriangle stroke={theme.accentWarning} size="16px" />
                                  <ThemedText.DeprecatedYellow ml="12px" fontSize="15px">
                                    <>Efficiency Comparison</>
                                  </ThemedText.DeprecatedYellow>
                                </RowFixed>
                                <RowFixed>
                                  <ThemedText.DeprecatedYellow ml="12px" fontSize="13px" margin={0} fontWeight={400}>
                                    <>Full range positions may earn less fees than concentrated positions.</>
                                  </ThemedText.DeprecatedYellow>
                                </RowFixed>
                                <Row>
                                  <ButtonYellow
                                    padding="8px"
                                    marginRight="8px"
                                    $borderRadius="8px"
                                    width="auto"
                                    onClick={() => {
                                      setShowCapitalEfficiencyWarning(false)
                                      clearAndSetFullRange()
                                    }}
                                  >
                                    <ThemedText.DeprecatedBlack fontSize={13} color="black">
                                      <>I understand</>
                                    </ThemedText.DeprecatedBlack>
                                  </ButtonYellow>
                                </Row>
                              </AutoColumn>
                            </YellowCard>
                          </StackedItem>
                        )}
                      </StackedContainer>

                      {outOfRange ? (
                        <YellowCard padding="8px 12px" $borderRadius="12px">
                          <RowBetween>
                            <AlertTriangle stroke={theme.accentWarning} size="16px" />
                            <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                              <>
                                Your position will not earn fees or be used in trades until the market price moves into
                                your range.
                              </>
                            </ThemedText.DeprecatedYellow>
                          </RowBetween>
                        </YellowCard>
                      ) : null}

                      {invalidRange ? (
                        <YellowCard padding="8px 12px" $borderRadius="12px">
                          <RowBetween>
                            <AlertTriangle stroke={theme.accentWarning} size="16px" />
                            <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                              <>Invalid range selected. The min price must be lower than the max price.</>
                            </ThemedText.DeprecatedYellow>
                          </RowBetween>
                        </YellowCard>
                      ) : null}
                    </DynamicSection>

                    <MediumOnly>
                      <Buttons />
                    </MediumOnly>
                  </RightContainer>
                </>
              ) : (
                <Buttons />
              )}
            </ResponsiveTwoColumns>
          </Wrapper>
        </PageWrapper>
        {addIsUnsupported && (
          <UnsupportedCurrencyFooter
            show={addIsUnsupported}
            currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          />
        )}
      </ScrollablePage>
      <SwitchLocaleLink />
    </>
  )
}
