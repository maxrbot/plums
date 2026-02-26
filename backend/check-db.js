// Quick script to check database contents
const { MongoClient } = require('mongodb')
require('dotenv').config()

async function checkDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('\n📁 Collections in database:')
    collections.forEach(c => console.log(`  - ${c.name}`))

    // Check priceSheetProducts count
    const productCount = await db.collection('priceSheetProducts').countDocuments()
    console.log(`\n📦 priceSheetProducts count: ${productCount}`)

    // Get a sample product
    if (productCount > 0) {
      const sample = await db.collection('priceSheetProducts').findOne()
      console.log('\n📋 Sample product:')
      console.log(JSON.stringify(sample, null, 2))
    }

    // Check users count
    const userCount = await db.collection('users').countDocuments()
    console.log(`\n👥 users count: ${userCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

checkDatabase()
