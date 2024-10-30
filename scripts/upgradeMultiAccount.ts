import { ethers, run, upgrades } from 'hardhat'
import { Addresses, loadAddresses, saveAddresses } from '../utils/file'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Upgrading contracts with the account:', deployer.address)
  let deployedAddresses: Addresses = loadAddresses()
  console.log('Deployed Addresses:', deployedAddresses)

  // Fetch the existing proxy address (from your saved addresses)
  const proxyAddress = deployedAddresses.multiAccountAddress

  if (!proxyAddress) {
    console.error('Proxy address not found. Cannot proceed with the upgrade.')
    return
  }

  // Fetch the new implementation contract (the upgraded MultiAccount contract with the new delegateAccesses function)
  const MultiAccountV2 = await ethers.getContractFactory('MultiAccount')
  console.log('New MultiAccount Implementation Fetched.')

  // Upgrade the proxy to use the new implementation
  const upgradedContract = await upgrades.upgradeProxy(
    proxyAddress,
    MultiAccountV2
  )
  await upgradedContract.deployed()
  console.log('Contract Upgraded.')

  // Retrieve new implementation address after the upgrade
  const newAddresses = {
    proxy: upgradedContract.address,
    admin: await upgrades.erc1967.getAdminAddress(upgradedContract.address),
    implementation: await upgrades.erc1967.getImplementationAddress(
      upgradedContract.address
    ),
  }
  console.log('Upgrade Complete. New addresses:', newAddresses)

  // Update the saved addresses with the new implementation address
  deployedAddresses.multiAccountAddress = upgradedContract.address
  saveAddresses(deployedAddresses)

  // Verify the new implementation on etherscan
  try {
    console.log('Verifying new implementation contract...')
    await new Promise((r) => setTimeout(r, 15000)) // wait a few seconds before verification
    await run('verify:verify', { address: newAddresses.implementation })
    console.log('New implementation contract verified!')
  } catch (e) {
    console.log('Verification failed:', e)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during upgrade:', error)
    process.exit(1)
  })
