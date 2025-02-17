import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import { config as dotenvConfig } from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'
import { resolve } from 'path'
import { Chain } from './utils/chain'

//import "./tasks/deploy"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || './.env'
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

// Ensure that we have all the environment variables we need.
const privateKey: string | undefined = process.env.PRIVATE_KEY
if (!privateKey) throw new Error('Please set your PRIVATE_KEY in a .env file')

const privateKeysStr: string | undefined = process.env.PRIVATE_KEYS_STR
const privateKeyList: string[] = privateKeysStr?.split(',') || []

const mantleAPIKey: string = process.env.MANTLE_API_KEY || ''
const ftmAPIKey: string = process.env.FTM_API_KEY || ''
const bnbApiKey: string = process.env.BNB_API_KEY || ''
const baseApiKey: string = process.env.BASE_API_KEY || ''
const polygonApiKey: string = process.env.POLYGON_API_KEY || ''
const zkEvmApiKey: string = process.env.ZKEVM_API_KEY || ''
const opBnbApiKey: string = process.env.OPBNB_API_KEY || ''

const hardhatDockerUrl: string | undefined =
  process.env.HARDHAT_DOCKER_URL || ''

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  gasReporter: {
    currency: 'USD',
    enabled: true,
    excludeContracts: [],
    src: './contracts',
  },
  networks: {
    hardhat: {
      // forking: {
      //   url: "",
      // },
      allowUnlimitedContractSize: false,
    },
    docker: {
      url: hardhatDockerUrl,
      allowUnlimitedContractSize: false,
      accounts: privateKeyList,
    },
    // fantom: {
    //   url: 'https://1rpc.io/ftm',
    //   accounts: privateKeyList,
    // },
    bnb: {
      url: 'https://1rpc.io/bnb',
      accounts: [privateKey],
    },
    opbnb: {
      url: 'https://opbnb.publicnode.com',
      accounts: [privateKey],
    },
    base: {
      url: 'https://1rpc.io/base',
      accounts: [privateKey],
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: [privateKey],
      gasPrice: 111 * 10 ** 9,
    },
    zkEvm: {
      url: 'https://zkevm-rpc.com',
      accounts: [privateKey],
    },
    blast: {
      url: 'https://rpc.blast.io',
      accounts: [privateKey],
    },
    mantle: {
      url: 'https://1rpc.io/mantle',
      accounts: [privateKey],
    },
    'iota-evm': {
      url: 'https://json-rpc.evm.iotaledger.net',
    },
  },
  etherscan: {
    apiKey: {
      mantle: mantleAPIKey,
      // fantom: ftmAPIKey,
      // bnb: bnbApiKey,
      base: baseApiKey,
      polygon: polygonApiKey,
      zkEvm: zkEvmApiKey,
      opbnb: opBnbApiKey,
      'iota-evm': 'empty',
    },
    customChains: [
      {
        network: 'mantle',
        chainId: 5000,
        urls: {
          apiURL: 'https://explorer.mantle.xyz/api',
          browserURL: 'https://explorer.mantle.xyz',
        },
      },
      {
        network: Chain.BASE,
        chainId: 8453,
        urls: {
          apiURL: `https://api.basescan.org/api?apiKey=${baseApiKey}`,
          browserURL: 'https://basescan.org',
        },
      },
      {
        network: 'zkEvm',
        chainId: 1101,
        urls: {
          apiURL: `https://api-zkevm.polygonscan.com/api?apikey=${zkEvmApiKey}`,
          browserURL: 'https://zkevm.polygonscan.com',
        },
      },
      {
        network: 'opbnb',
        chainId: 204,
        urls: {
          apiURL: `https://api-opbnb.bscscan.com/api?apikey=${opBnbApiKey}`,
          browserURL: 'https://opbnb.bscscan.com',
        },
      },
      {
        network: Chain.IOTA,
        chainId: 8822,
        urls: {
          apiURL: 'https://explorer.evm.iota.org/api',
          browserURL: 'https://explorer.evm.iota.org',
        },
      },
    ],
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.8.27',
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: 'none',
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  typechain: {
    outDir: 'src/types',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 100000000,
  },
}

export default config
