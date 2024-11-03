const { ethers } = require('hardhat')
const { upgrades } = require('hardhat')
import { Addresses, loadAddresses, saveAddresses } from '../utils/file'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  let deployedAddresses: Addresses = loadAddresses()
  console.log('Deployed Addresses:', deployedAddresses)

  const proxyAddress = deployedAddresses.multiAccountAddress

  if (!proxyAddress) {
    console.error(
      'Proxy address not found. Cannot proceed with the timelock deployment.'
    )
    return
  }

  const minDelay = 60 * 60 * 24 * 3 // 3 day delay

  const proposersEnv = process.env.PROPOSERS || ''
  const proposers = proposersEnv.split(',').map((addr) => addr.trim())
  const executorsEnv = process.env.EXECUTORS || ''
  const executors = executorsEnv.split(',').map((addr) => addr.trim())
  const timelockAdmin = process.env.TIMELOCK_ADMIN_ROLE

  console.log(`Proposers: ${proposers}.`)
  console.log(`Executors: ${executors}.`)

  try {
    const currentAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress)
    console.log('Current admin of the proxy:', currentAdmin)

    const Timelock = await ethers.getContractFactory('TimelockController')
    const timelock = await Timelock.deploy(
      minDelay,
      proposers,
      executors,
      timelockAdmin
    )
    await timelock.deployed()
    console.log('Timelock deployed at:', timelock.address)

    // Transfer ownership
    await upgrades.admin.transferProxyAdminOwnership(timelock)
    console.log(
      'Ownership of the proxy admin transferred to the timelock:',
      timelock
    )
    const newAdmin = await upgrades.erc1967.getAdminAddress('0x')
    console.log('New admin of the proxy:', newAdmin)
  } catch (error) {
    console.error('Error occurred:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
