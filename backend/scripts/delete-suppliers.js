const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
const DB_NAME = MONGODB_URI.includes('mongodb+srv')
  ? MONGODB_URI.split('/')[3].split('?')[0]
  : 'markethunt'

async function deleteSuppliers() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // Delete supplier users
    const usersResult = await db.collection('users').deleteMany({ role: 'supplier' })
    console.log(`Deleted ${usersResult.deletedCount} supplier users`)
    
    // Delete crops
    const cropsResult = await db.collection('cropManagement').deleteMany({})
    console.log(`Deleted ${cropsResult.deletedCount} crop records`)
    
    // Delete data sources
    const sourcesResult = await db.collection('supplierDataSources').deleteMany({})
    console.log(`Deleted ${sourcesResult.deletedCount} data source records`)
    
  } finally {
    await client.close()
  }
}

deleteSuppliers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
