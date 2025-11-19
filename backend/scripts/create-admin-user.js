/**
 * Script to create an admin user
 * Run with: node backend/scripts/create-admin-user.js
 */

const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')
require('dotenv/config')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db()
    const usersCollection = db.collection('users')
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@acrelist.ag' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      console.log('Email:', existingAdmin.email)
      console.log('Tier:', existingAdmin.subscriptionTier)
      return
    }
    
    // Create admin user
    const password = 'admin123' // Change this!
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const adminUser = {
      id: '', // Will be set after insertion
      email: 'admin@acrelist.ag',
      password: hashedPassword,
      subscriptionTier: 'admin',
      profile: {
        companyName: 'AcreList',
        contactName: 'Admin',
        email: 'admin@acrelist.ag',
        phone: '',
        website: 'https://acrelist.ag'
      },
      preferences: {
        defaultPriceUnit: 'lb',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        notifications: {
          email: true,
          priceAlerts: false,
          marketUpdates: false
        }
      },
      billing: {
        plan: 'Admin',
        billingCycle: 'monthly'
      },
      integrations: {
        quickbooks: false,
        hubspot: false,
        mailchimp: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await usersCollection.insertOne(adminUser)
    
    // Update with MongoDB _id as the id
    const userId = result.insertedId.toString()
    await usersCollection.updateOne(
      { _id: result.insertedId },
      { $set: { id: userId } }
    )
    
    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@acrelist.ag')
    console.log('Password:', password)
    console.log('⚠️  IMPORTANT: Change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await client.close()
  }
}

createAdminUser()

