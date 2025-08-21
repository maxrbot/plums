import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { User } from '../models/types'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get current user profile
  fastify.get('/profile', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userProfile = await db.collection<User>('users').findOne(
        { id: user.id },
        { projection: { _id: 0 } } // Exclude MongoDB _id
      )
      
      if (!userProfile) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User profile not found'
        })
      }
      
      return userProfile
      
    } catch (error) {
      console.error('Get profile error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get user profile'
      })
    }
  })
  
  // Update user profile
  fastify.put('/profile', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const updateData = request.body as Partial<User>
    
    try {
      const db = database.getDb()
      
      // Remove fields that shouldn't be updated directly
      const { _id, id, createdAt, ...allowedUpdates } = updateData
      
      const result = await db.collection<User>('users').updateOne(
        { id: user.id },
        { 
          $set: {
            ...allowedUpdates,
            updatedAt: new Date()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      // Return updated profile
      const updatedUser = await db.collection<User>('users').findOne(
        { id: user.id },
        { projection: { _id: 0 } }
      )
      
      return updatedUser
      
    } catch (error) {
      console.error('Update profile error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update user profile'
      })
    }
  })
  
  // Update specific settings section
  fastify.put('/settings/:section', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { section } = request.params as { section: string }
    const updateData = request.body
    
    const validSections = ['profile', 'preferences', 'billing', 'integrations']
    
    if (!validSections.includes(section)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: `Invalid section. Must be one of: ${validSections.join(', ')}`
      })
    }
    
    try {
      const db = database.getDb()
      
      const result = await db.collection<User>('users').updateOne(
        { id: user.id },
        { 
          $set: {
            [section]: updateData,
            updatedAt: new Date()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      return { message: `${section} updated successfully` }
      
    } catch (error) {
      console.error(`Update ${section} error:`, error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: `Failed to update ${section}`
      })
    }
  })
  
  // Get user dashboard stats
  fastify.get('/stats', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userId = new ObjectId() // We'll need to map Supabase ID to ObjectId
      
      // Get counts for dashboard
      const [
        regionsCount,
        cropsCount,
        certificationsCount,
        priceSheetsCount,
        contactsCount
      ] = await Promise.all([
        db.collection('growingRegions').countDocuments({ userId }),
        db.collection('cropManagement').countDocuments({ userId }),
        db.collection('certifications').countDocuments({ userId }),
        db.collection('priceSheets').countDocuments({ userId }),
        db.collection('contacts').countDocuments({ userId })
      ])
      
      // Get recent activity
      const recentPriceSheets = await db.collection('priceSheets')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
      
      return {
        counts: {
          regions: regionsCount,
          crops: cropsCount,
          certifications: certificationsCount,
          priceSheets: priceSheetsCount,
          contacts: contactsCount
        },
        recentActivity: {
          priceSheets: recentPriceSheets
        }
      }
      
    } catch (error) {
      console.error('Get stats error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get user stats'
      })
    }
  })
  
  // Delete user account
  fastify.delete('/account', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userId = new ObjectId() // Map Supabase ID to ObjectId
      
      // Delete all user data
      await Promise.all([
        db.collection('users').deleteOne({ id: user.id }),
        db.collection('growingRegions').deleteMany({ userId }),
        db.collection('cropManagement').deleteMany({ userId }),
        db.collection('certifications').deleteMany({ userId }),
        db.collection('customPackaging').deleteMany({ userId }),
        db.collection('priceSheets').deleteMany({ userId }),
        db.collection('priceSheetProducts').deleteMany({ userId }),
        db.collection('contacts').deleteMany({ userId }),
        db.collection('chatbotConfig').deleteMany({ userId }),
        db.collection('scrapedData').deleteMany({ userId })
      ])
      
      return { message: 'Account deleted successfully' }
      
    } catch (error) {
      console.error('Delete account error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete account'
      })
    }
  })
}

export default userRoutes
