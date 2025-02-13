import { ChainId } from '@uniswap/sdk'

// TODO: fill contract deploymentblocks
// to start checking for orders from that point
export const ContractDeploymentBlocks: Partial<Record<ChainId, number>> = {
  [ChainId.MAINNET]: 11469934,
  [ChainId.RINKEBY]: 7724701,
  [ChainId.XDAI]: 13566914
}

export const OPERATOR_API_POLL_INTERVAL = 10000 // in ms
