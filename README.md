[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gnosis/gp-swap-ui)

<p align="center">
  <img width="400" src="docs/images/logo-cow-swap.png">
</p>

[![Lint](https://github.com/gnosis/dex-swap/workflows/Lint/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ALint)
[![Tests](https://github.com/gnosis/dex-swap/workflows/Tests/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ATests)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source fork of Uniswap to Swap in Gnosis Protocol v2 -- a protocol for decentralized exchange of Ethereum tokens.

- 🐮**Official Website**🐮: <https://cowswap.exchange/>
    * ENS Website (alternative): <https://cowswap.eth.link>, or <https://cowswap.eth/> if you have MetaMask or an ENS compatible browser.
    * The website can also be run locally, or from IPFS. Every release will have an IPFS hash associated, available in the [Releases](https://github.com/gnosis/gp-swap-ui/releases) section.

- Twitter: [@gnosisPM](https://twitter.com/gnosisPM)
- Reddit: [/r/gnosisPM](https://www.reddit.com/r/gnosisPM)
- Discord: <https://chat.cowswap.exchange>

Please see the:

- [Gnosis Protocol: Smart contracts](https://github.com/gnosis/gp-v2-contracts)
- [Gnosis Protocol: Services](https://github.com/gnosis/gp-v2-services)

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Unit testing

```bash
yarn test
```

### Integration test

Normally:

```bash
yarn build
yarn integration-test
```

If we want to use the Cypress UI:

```bash
yarn build
yarn serve
yarn cypress
```

If we want to use the Cypress UI, and live reloading on the web app:

```bash
yarn start:default
yarn cypress
```

## Configuring the environment (optional)
The app has some default configuration, but it's highly encouraged to define your own.

### Local configuration
Make a copy of `.env` named `.env.local`, this will allow you to set your own configuration only in your local environment.

### Production configuration
Modify the environment variables in `.env.production`, or override them in build time.

### App Id
The app id is included in all signed transaction, although the Gnosis Protocol is not using this information for now, it
could be used for implementing incentive programs.

To set your own, change `REACT_APP_ID` environment variable. Ask for your id at [chat.gnosis.io](https://chat.gnosis.io)


### Supported networks
You can change the supported networks and their RPC endpoint.

To have the interface default to a different network when a wallet is not connected:

1. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`. This will be your default network id
2. Define your own list of supported networks:

```ini
REACT_APP_SUPPORTED_CHAIN_IDS="1,4,100"
REACT_APP_NETWORK_URL_1=https://mainnet.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_4=https://rinkeby.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_100=https://rpc.xdaichain.com
```


### API endpoints
Fee quote requests and posting orders are sent to an API. This API has the responsibility of collecting orders and 
handing them to the solvers. 

The reference implementation of th API is [gp-v2-services](https://github.com/gnosis/gp-v2-services). 

The API endpoint is configured using the environment variable `REACT_APP_API_STAGING_URL_{XDAI|RINKEBY|MAINNET}` to e.g. `"http://localhost:8080/api"` when running the services locally.


### Wallet Connect bridge
Wallet Connect allows to connect the app to any [Wallet Connect supported wallet](https://walletconnect.org/wallets).

In order to do so, it uses a Websocket, that can be configured using: the env var `WALLET_CONNECT_BRIDGE`.
