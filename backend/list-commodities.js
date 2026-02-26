// List all unique commodities in the database
const { MongoClient } = require('mongodb')
require('dotenv').config()

async function listCommodities() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    // Get distinct commodities
    const commodities = await db.collection('priceSheetProducts')
      .distinct('commodity')

    console.log('🥬 Commodities in database:')
    commodities.sort().forEach(c => console.log(`  - ${c}`))
    console.log(`\nTotal: ${commodities.length} unique commodities`)

    // Get count by commodity
    const counts = await db.collection('priceSheetProducts')
      .aggregate([
        { $group: { _id: '$commodity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray()

    console.log('\n📊 Products by commodity:')
    counts.forEach(c => console.log(`  ${c._id}: ${c.count} products`))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

listCommodities()
