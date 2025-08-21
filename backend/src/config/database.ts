import { MongoClient, Db } from 'mongodb'

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db()
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      console.error('❌ MongoDB connection error:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      console.log('🔌 Disconnected from MongoDB')
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null
  }
}

export const database = new Database()
export default database
