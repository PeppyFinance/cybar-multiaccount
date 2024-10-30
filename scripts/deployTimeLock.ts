const { ethers } = require('hardhat')
const { upgrades } = require('hardhat')

async function main() {
  const minDelay = 3600 // 1 hour delay
  const proposers = [yourAddress] // Addresses allowed to propose
  const executors = [yourAddress] // Addresses allowed to execute
  const proxyAddress = 'your_proxy_address'

  const Timelock = await ethers.getContractFactory('TimelockController')
  const timelock = await Timelock.deploy(minDelay, proposers, executors)
  await timelock.deployed()

  console.log('Timelock deployed at:', timelock.address)

  // Transfer ownership
  await upgrades.admin.transferProxyAdminOwnership(timelock.address)
  console.log(
    'Ownership of the proxy admin transferred to the timelock:',
    timelock.address
  )

  const newAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress)
  console.log('New admin of the proxy:', newAdmin)
}
