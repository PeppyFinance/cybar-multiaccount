import { ethers, run, upgrades } from 'hardhat'
import { Addresses, loadAddresses, saveAddresses } from '../utils/file'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const admin = process.env.ADMIN_PUBLIC_KEY_IOTAEVM
  console.log('The admin account: ', admin)

  let deployedAddresses: Addresses = loadAddresses()
  console.log('Deployed Addresses:', deployedAddresses)

  const SymmioPartyA = await ethers.getContractFactory('SymmioPartyA')

  const Factory = await ethers.getContractFactory('MultiAccount')
  console.log('Factory Deployed. ')

  const contract = await upgrades.deployProxy(
    Factory,
    [admin, deployedAddresses.symmioAddress, SymmioPartyA.bytecode],
    {
      initializer: 'initialize',
      timeout: 600000, // Example: extend timeout to 10 minutes
      pollingInterval: 4000, // Example: check every 4 seconds
    }
  )
  await contract.deployed()
  console.log('Contract Deployed.')

  const addresses = {
    proxy: contract.address,
    admin: await upgrades.erc1967.getAdminAddress(contract.address),
    implementation: await upgrades.erc1967.getImplementationAddress(
      contract.address
    ),
  }
  console.log(addresses)

  deployedAddresses.multiAccountAddress = contract.address
  saveAddresses(deployedAddresses)

  try {
    console.log('Verifying contract...')
    await new Promise((r) => setTimeout(r, 15000))
    await run('verify:verify', { address: addresses.implementation })
    console.log('Contract verified!')
  } catch (e) {
    console.log(e)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
