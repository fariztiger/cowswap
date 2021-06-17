import { ChainId, ETHER, WETH } from '@uniswap/sdk'
import { getSigningSchemeApiValue, OrderCreation } from 'utils/signatures'
import { APP_ID } from 'constants/index'
import { registerOnWindow } from '../misc'
import { isDev } from '../environments'
import { FeeInformation, PriceInformation } from 'state/price/reducer'
import OperatorError, { ApiErrorCodeDetails, ApiErrorCodes, ApiErrorObject } from 'utils/operator/errors/OperatorError'
import QuoteError, {
  mapOperatorErrorToQuoteError,
  QuoteErrorCodes,
  QuoteErrorDetails,
  QuoteErrorObject
} from 'utils/operator/errors/QuoteError'

function getOperatorUrl(): Partial<Record<ChainId, string>> {
  if (isDev) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://protocol-mainnet.dev.gnosisdev.com/api',
      [ChainId.RINKEBY]:
        process.env.REACT_APP_API_URL_STAGING_RINKEBY || 'https://protocol-rinkeby.dev.gnosisdev.com/api',
      [ChainId.XDAI]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://protocol-xdai.dev.gnosisdev.com/api'
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://protocol-mainnet.gnosis.io/api',
    [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://protocol-rinkeby.gnosis.io/api',
    [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://protocol-xdai.gnosis.io/api'
  }
}

const API_BASE_URL = getOperatorUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_ID.toString()
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export interface OrderMetaData {
  creationDate: string
  owner: string
  uid: OrderID
  availableBalance: string
  executedBuyAmount: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedFeeAmount: string
  invalidated: false
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: number
  feeAmount: string
  kind: string
  partiallyFillable: false
  signature: string
}

export interface UnsupportedToken {
  [token: string]: {
    address: string
    dateAdded: number
  }
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl + '/v1'
  }
}

export function getOrderLink(chainId: ChainId, orderId: OrderID): string {
  const baseUrl = _getApiBaseUrl(chainId)

  return baseUrl + `/orders/${orderId}`
}

function _post(chainId: ChainId, url: string, data: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

function _fetchGet(chainId: ChainId, url: string) {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS
  })
}

export async function postSignedOrder(params: {
  chainId: ChainId
  order: OrderCreation
  owner: string
}): Promise<OrderID> {
  const { chainId, order, owner } = params
  console.log('[utils:operator] Post signed order for network', chainId, order)

  // Call API
  const response = await _post(chainId, `/orders`, {
    ...order,
    signingScheme: getSigningSchemeApiValue(order.signingScheme),
    from: owner
  })

  // Handle response
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await OperatorError.getErrorFromStatusCode(response)
    throw new Error(errorMessage)
  }

  const uid = (await response.json()) as string
  console.log('[util:operator] Success posting the signed order', uid)
  return uid
}

function checkIfEther(tokenAddress: string, chainId: ChainId) {
  let checkedAddress = tokenAddress
  if (tokenAddress === ETHER.symbol) {
    checkedAddress = WETH[chainId].address
  }

  return checkedAddress
}

export type FeeQuoteParams = Pick<OrderMetaData, 'sellToken' | 'buyToken' | 'kind'> & {
  amount: string
  chainId: ChainId
}

export type PriceQuoteParams = Omit<FeeQuoteParams, 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
}

function toApiAddress(address: string, chainId: ChainId): string {
  if (address === 'ETH') {
    // TODO: Return magical address
    return WETH[chainId].address
  }

  return address
}

const UNHANDLED_QUOTE_ERROR: QuoteErrorObject = {
  errorType: QuoteErrorCodes.UNHANDLED_ERROR,
  description: QuoteErrorDetails.UNHANDLED_ERROR
}

const UNHANDLED_ORDER_ERROR: ApiErrorObject = {
  errorType: ApiErrorCodes.UNHANDLED_ERROR,
  description: ApiErrorCodeDetails.UNHANDLED_ERROR
}

async function _handleQuoteResponse(response: Response) {
  if (!response.ok) {
    const responseNotOkJson: ApiErrorObject = await response.json()
    const errorType = responseNotOkJson.errorType

    // we need to map the backend error codes to match our own for quotes
    const mappedError = mapOperatorErrorToQuoteError(errorType)
    throw new QuoteError(mappedError)
  } else {
    return response.json()
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<PriceInformation> {
  const { baseToken, quoteToken, amount, kind, chainId } = params
  const [checkedBaseToken, checkedQuoteToken] = [checkIfEther(baseToken, chainId), checkIfEther(quoteToken, chainId)]
  console.log('[util:operator] Get price from API', params)

  const response = await _fetchGet(
    chainId,
    `/markets/${toApiAddress(checkedBaseToken, chainId)}-${toApiAddress(checkedQuoteToken, chainId)}/${kind}/${amount}`
  ).catch(error => {
    console.error('Error getting price quote:', error)
    throw new QuoteError(UNHANDLED_QUOTE_ERROR)
  })

  return _handleQuoteResponse(response)
}

export async function getFeeQuote(params: FeeQuoteParams): Promise<FeeInformation> {
  const { sellToken, buyToken, amount, kind, chainId } = params
  const [checkedSellAddress, checkedBuyAddress] = [checkIfEther(sellToken, chainId), checkIfEther(buyToken, chainId)]
  console.log('[util:operator] Get fee from API', params)

  const response = await _fetchGet(
    chainId,
    `/fee?sellToken=${toApiAddress(checkedSellAddress, chainId)}&buyToken=${toApiAddress(
      checkedBuyAddress,
      chainId
    )}&amount=${amount}&kind=${kind}`
  ).catch(error => {
    console.error('Error getting fee quote:', error)
    throw new QuoteError(UNHANDLED_QUOTE_ERROR)
  })

  return _handleQuoteResponse(response)
}

export async function getOrder(chainId: ChainId, orderId: string): Promise<OrderMetaData | null> {
  console.log('[util:operator] Get order for ', chainId, orderId)
  try {
    const response = await _fetchGet(chainId, `/orders/${orderId}`)

    if (!response.ok) {
      const errorResponse: ApiErrorObject = await response.json()
      throw new OperatorError(errorResponse)
    } else {
      return response.json()
    }
  } catch (error) {
    console.error('Error getting order information:', error)
    throw new OperatorError(UNHANDLED_ORDER_ERROR)
  }
}

// Register some globals for convenience
registerOnWindow({ operator: { getFeeQuote, getOrder, postSignedOrder, apiGet: _fetchGet, apiPost: _post } })
