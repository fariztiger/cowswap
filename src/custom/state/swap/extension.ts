import { Token, TokenAmount, JSBI, Currency, CurrencyAmount, TradeType } from '@uniswap/sdk'
import { QuoteInformationObject } from 'state/price/reducer'
import TradeGp, { _constructTradePrice } from './TradeGp'

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  quote?: QuoteInformationObject
}

export const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactInWithFee({
  parsedAmount: parsedInputAmount,
  outputCurrency,
  quote
}: Omit<TradeParams, 'inputCurrency'>) {
  // make sure we have a typed in amount, a fee, and a price
  // else we can assume the trade will be null
  if (!parsedInputAmount || !outputCurrency || !quote?.fee || !quote?.price?.amount) return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, parsedInputAmount.currency)
  // Check that fee amount is not greater than the user's input amt
  const isValidFee = feeAsCurrency.lessThan(parsedInputAmount)
  // If the feeAsCurrency value is higher than we are inputting, return undefined
  // this makes sure `useTradeExactIn` returns null === no trade
  const feeAdjustedAmount = isValidFee ? parsedInputAmount.subtract(feeAsCurrency) : undefined
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }

  // external price output as Currency
  const outputAmount = stringToCurrency(quote.price.amount, outputCurrency)

  // set the Price object to attach to final Trade object
  // Price = (quote.price.amount) / inputAmountAdjustedForFee
  const executionPrice = _constructTradePrice({
    // pass in our parsed sell amount (CurrencyAmount)
    sellToken: feeAdjustedAmount,
    // pass in our feeless outputAmount (CurrencyAmount)
    buyToken: outputAmount,
    kind: 'sell',
    price: quote?.price
  })

  // no price object or feeAdjusted amount? no trade
  if (!executionPrice || !feeAdjustedAmount) return null

  // calculate our output without any fee, consuming price
  // useful for calculating fees in buy token
  const outputAmountWithoutFee = executionPrice.quote(parsedInputAmount)

  return new TradeGp({
    inputAmount: parsedInputAmount,
    inputAmountWithFee: feeAdjustedAmount,
    outputAmount,
    outputAmountWithoutFee,
    fee,
    executionPrice,
    tradeType: TradeType.EXACT_INPUT
  })
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactOutWithFee({
  parsedAmount: parsedOutputAmount,
  inputCurrency,
  quote
}: Omit<TradeParams, 'outputCurrency'>) {
  if (!parsedOutputAmount || !inputCurrency || !quote?.fee || !quote?.price?.amount) return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }

  // inputAmount without fee applied
  // this is required for the Trade sdk to calculate slippage adjusted amounts
  const inputAmountWithoutFee = stringToCurrency(quote.price.amount, inputCurrency)
  // We need to determine the fee after, as the parsedOutputAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  const inputAmountWithFee = inputAmountWithoutFee.add(feeAsCurrency)

  // per unit price
  const executionPrice = _constructTradePrice({
    // pass in our calculated inputAmount (CurrencyAmount)
    sellToken: inputAmountWithoutFee,
    // pass in our parsed buy amount (CurrencyAmount)
    buyToken: parsedOutputAmount,
    kind: 'buy',
    price: quote.price
  })

  // no price object? no trade
  if (!executionPrice) return null

  // We need to override the Trade object to use different values as we are intercepting initial inputs
  return new TradeGp({
    inputAmount: inputAmountWithFee,
    inputAmountWithFee,
    outputAmount: parsedOutputAmount,
    outputAmountWithoutFee: parsedOutputAmount,
    fee,
    executionPrice,
    tradeType: TradeType.EXACT_OUTPUT
  })
}
