import { ethers, run, upgrades } from "hardhat"
import { Addresses, loadAddresses, saveAddresses } from "../utils/file"
import { Chain } from "../utils/chain"

async function main() {
	const [deployer] = await ethers.getSigners()

	console.log("Upgrading contracts with the account:", deployer.address)
	let deployedAddresses: Addresses = loadAddresses(Chain.BASE, 2)
	console.log("Deployed Addresses:", deployedAddresses)

	// Fetch the existing proxy address (from your saved addresses)
	const proxyAddress = deployedAddresses.multiAccountAddress
	console.log("Proxy address:", proxyAddress)

	if (!proxyAddress) {
		console.error("Proxy address not found. Cannot proceed with the upgrade.")
		return
	}

	const currentImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)
	console.log("Current implementation:", currentImplementation)

	const currentContract = await ethers.getContractFactory("MultiAccount")
	const currentBytecode = currentContract.bytecode
	console.log("Current bytecode hash:", ethers.utils.keccak256(currentBytecode))

	// Fetch the new implementation contract (the upgraded MultiAccount contract with the new features)
	const newMultiAccount = await ethers.getContractFactory("NewMultiAccount")
	console.log("New MultiAccount Implementation Fetched.")

	const newBytecode = newMultiAccount.bytecode
	console.log("New bytecode hash:", ethers.utils.keccak256(newBytecode))

  if (currentBytecode === newBytecode) {
		console.log("WARNING: Bytecodes are identical!")
		return
	}

	await upgrades.forceImport(proxyAddress, newMultiAccount)

	const bytecode = newMultiAccount.bytecode
	console.log("New implementation bytecode length:", bytecode.length)

	// Upgrade the proxy to use the new implementation
	const upgradedContract = await upgrades.upgradeProxy(proxyAddress, newMultiAccount)
	await upgradedContract.deployed()
	console.log("Contract Upgraded.")

	const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)
	console.log("New implementation:", newImplementation)

	if (currentImplementation === newImplementation) {
		console.log("WARNING: Implementation address has not changed!")
		console.log("This might indicate that the deployment failed or the bytecode is identical")
	}

	// Retrieve new implementation address after the upgrade
	const newAddresses = {
		proxy: upgradedContract.address,
		admin: await upgrades.erc1967.getAdminAddress(upgradedContract.address),
		implementation: await upgrades.erc1967.getImplementationAddress(upgradedContract.address),
	}
	console.log("Upgrade Complete. New addresses:", newAddresses)

	// Update the saved addresses with the new implementation address
	deployedAddresses.multiAccountAddress = upgradedContract.address
	saveAddresses(deployedAddresses, Chain.BASE, 2)

	const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
	console.log("Implementation address:", implementationAddress)

	// Verify the new implementation on etherscan
	try {
		console.log("Verifying new implementation contract...")
		await new Promise(r => setTimeout(r, 15000)) // wait a few seconds before verification
		await run("verify:verify", { address: newAddresses.implementation })
		console.log("New implementation contract verified!")
	} catch (e) {
		console.log("Verification failed:", e)
	}
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error("Error during upgrade:", error)
		process.exit(1)
	})
