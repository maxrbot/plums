/**
 * One-time reset script — clears directoryPipeline and supplierDirectory.
 * Preserves: users, claimRequests, priceSheets, cropManagement, contacts, sentEmails, everything else.
 *
 * Run with: npx tsx src/scripts/resetDirectory.ts
 * Add --confirm to skip the prompt.
 */
import 'dotenv/config'
import { MongoClient } from 'mongodb'
import * as readline from 'readline'

async function confirm(question: string): Promise<boolean> {
  if (process.argv.includes('--confirm')) return true
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()

    const pipelineCount = await db.collection('directoryPipeline').countDocuments()
    const directoryCount = await db.collection('supplierDirectory').countDocuments()

    console.log('⚠️  This will permanently delete:')
    console.log(`   directoryPipeline: ${pipelineCount} entries`)
    console.log(`   supplierDirectory: ${directoryCount} entries`)
    console.log('   Users, price sheets, and all other data are preserved.\n')

    const ok = await confirm('Continue? (y/N) ')
    if (!ok) {
      console.log('Aborted.')
      return
    }

    await db.collection('directoryPipeline').deleteMany({})
    await db.collection('supplierDirectory').deleteMany({})

    console.log('✅ directoryPipeline cleared')
    console.log('✅ supplierDirectory cleared')
    console.log('\nReady for fresh USDA data import.')

  } finally {
    await client.close()
  }
}

main().catch(err => {
  console.error('❌ Reset failed:', err.message)
  process.exit(1)
})
