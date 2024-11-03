import { ethers } from 'ethers'
import TimelockControllerABI from '../abi/Timelock.json'

async function checkRole(
  Timelock: ethers.Contract,
  roles: { admin: string; proposer: string; executor: string }
) {
  const addressToCheck = '0x'
  const isAdmin = await Timelock.hasRole(roles.admin, addressToCheck)
  const isProposer = await Timelock.hasRole(roles.proposer, addressToCheck)
  const isExecutor = await Timelock.hasRole(roles.executor, addressToCheck)

  console.log('Roles for', addressToCheck, {
    isProposer,
    isExecutor,
    isAdmin,
  })
}

async function revokeRole(Timelock: ethers.Contract, roleId: string) {
  const addressToRevoke = '0x'

  // Revoke the role
  const tx = await Timelock.revokeRole(roleId, addressToRevoke)

  // Wait for transaction confirmation
  const receipt = await tx.wait()
  console.log(`Role revoked. Transaction hash: ${receipt.transactionHash}`)
}

async function main() {
  const TIMELOCK_ADDRESS = process.env.IOTAEVM_TIMELOCK_CONTRACT
  const PRIVATE_KEY = process.env.PRIVATE_KEY

  if (!TIMELOCK_ADDRESS || !PRIVATE_KEY)
    throw new Error('Necessary env var is not set.')

  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://json-rpc.evm.iotaledger.net'
    )

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

    const Timelock = new ethers.Contract(
      TIMELOCK_ADDRESS,
      TimelockControllerABI.abi,
      wallet
    )

    const TIMELOCK_ADMIN_ROLE = await Timelock.TIMELOCK_ADMIN_ROLE()
    const PROPOSER_ROLE = await Timelock.PROPOSER_ROLE()
    const EXECUTOR_ROLE = await Timelock.EXECUTOR_ROLE()

    await checkRole(Timelock, {
      admin: TIMELOCK_ADMIN_ROLE,
      proposer: PROPOSER_ROLE,
      executor: EXECUTOR_ROLE,
    })
  } catch (error) {
    console.error('Error: ', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
