/**
 * One-time script to create the AcreList admin account.
 * Run with: npx ts-node src/scripts/createAdmin.ts
 */
import 'dotenv/config'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'admin@acrelist.ag'
const ADMIN_PASSWORD = 'AcreAdmin2025!'

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const users = db.collection('users')

    const existing = await users.findOne({ email: ADMIN_EMAIL })
    if (existing) {
      console.log('⚠️  Admin account already exists:', ADMIN_EMAIL)
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const result = await users.insertOne({
      id: '',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      subscriptionTier: 'admin',
      profile: {
        companyName: 'AcreList',
        contactName: 'Admin',
        email: ADMIN_EMAIL,
        phone: '',
        website: 'https://acrelist.ag'
      },
      preferences: {
        defaultPriceUnit: 'lb',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        notifications: { email: false, priceAlerts: false, marketUpdates: false }
      },
      billing: { plan: 'admin', billingCycle: 'monthly' },
      integrations: { quickbooks: false, hubspot: false, mailchimp: false },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Back-fill string id
    const insertedId = result.insertedId.toString()
    await users.updateOne({ _id: result.insertedId }, { $set: { id: insertedId } })

    console.log('✅ Admin account created successfully')
    console.log('   Email:   ', ADMIN_EMAIL)
    console.log('   Password:', ADMIN_PASSWORD)
    console.log('   ID:      ', insertedId)
  } finally {
    await client.close()
  }
}

main().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
