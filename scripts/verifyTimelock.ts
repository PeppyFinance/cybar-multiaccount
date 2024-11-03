import { run } from 'hardhat'

async function main() {
  const TIMELOCK_ADDRESS = '0x'
  const MIN_DELAY = 259200 // 3 days in seconds (60 * 60 * 24 * 3)

  const proposersEnv = process.env.PROPOSERS || ''
  const proposers = proposersEnv.split(',').map((addr) => addr.trim())
  const executorsEnv = process.env.EXECUTORS || ''
  const executors = executorsEnv.split(',').map((addr) => addr.trim())
  const timelockAdmin = process.env.TIMELOCK_ADMIN_ROLE

  console.log('Verifying with parameters:')
  console.log('MinDelay:', MIN_DELAY)
  console.log('Proposers:', proposers)
  console.log('Executors:', executors)
  console.log('Admin:', timelockAdmin)

  try {
    console.log('Verifying TimelockController...')

    await run('verify:verify', {
      address: TIMELOCK_ADDRESS,
      constructorArguments: [MIN_DELAY, proposers, executors, timelockAdmin],
      contract: 'contracts/timelock/TimeLock.sol:Timelock',
    })

    console.log('✅ Contract verified successfully')
  } catch (error) {
    console.error('Error during verification:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
