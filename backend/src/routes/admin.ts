import { FastifyPluginAsync } from 'fastify'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import database from '../config/database'
import { User } from '../models/types'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add authentication to all admin routes
  fastify.addHook('preHandler', authenticate)
  
  // Middleware to check if user is admin
  const requireAdmin = async (request: AuthenticatedRequest, reply: any) => {
    if (request.user.subscriptionTier !== 'admin') {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required'
      })
    }
  }
  
  // Get all users (admin only)
  fastify.get('/users', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    const db = database.getDb()
    
    // Get all users with their data counts
    const users = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'cropManagement',
          localField: '_id',
          foreignField: 'userId',
          as: 'crops'
        }
      },
      {
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: 'userId',
          as: 'contacts'
        }
      },
      {
        $lookup: {
          from: 'shippingPoints',
          localField: '_id',
          foreignField: 'userId',
          as: 'shippingPoints'
        }
      },
      {
        $lookup: {
          from: 'priceSheets',
          localField: '_id',
          foreignField: 'userId',
          as: 'priceSheets'
        }
      },
      {
        $lookup: {
          from: 'sentEmails',
          localField: '_id',
          foreignField: 'userId',
          as: 'sentEmails'
        }
      },
      {
        $addFields: {
          cropCount: { $size: '$crops' },
          contactCount: { $size: '$contacts' },
          shippingPointCount: { $size: '$shippingPoints' },
          priceSheetCount: { $size: '$priceSheets' },
          emailsSentCount: { $size: '$sentEmails' },
          lastActivity: {
            $max: [
              { $ifNull: [{ $max: '$priceSheets.createdAt' }, new Date(0)] },
              { $ifNull: [{ $max: '$sentEmails.sentAt' }, new Date(0)] }
            ]
          }
        }
      },
      {
        $project: {
          password: 0, // Never return passwords
          crops: 0,
          contacts: 0,
          shippingPoints: 0,
          priceSheets: 0,
          sentEmails: 0,
          // Explicitly include lastSeenAt to ensure it's returned
          lastSeenAt: 1,
          email: 1,
          profile: 1,
          subscriptionTier: 1,
          createdAt: 1,
          cropCount: 1,
          contactCount: 1,
          shippingPointCount: 1,
          priceSheetCount: 1,
          emailsSentCount: 1,
          lastActivity: 1,
          _id: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()
    
    return { users }
  })
  
  // Get specific user details (admin only)
  fastify.get('/users/:userId', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    const db = database.getDb()
    const { userId } = request.params as { userId: string }
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return { error: 'User not found' }
    }
    
    // Get user's data
    const crops = await db.collection('crops').find({ userId: new ObjectId(userId) }).toArray()
    const contacts = await db.collection('contacts').find({ userId: new ObjectId(userId) }).toArray()
    const priceSheets = await db.collection('priceSheets').find({ userId: new ObjectId(userId) }).toArray()
    const sentEmails = await db.collection('sentEmails').find({ userId: new ObjectId(userId) }).sort({ sentAt: -1 }).limit(20).toArray()
    
    return {
      user,
      stats: {
        crops: crops.length,
        contacts: contacts.length,
        priceSheets: priceSheets.length,
        emailsSent: sentEmails.length
      },
      recentActivity: {
        sentEmails: sentEmails.map(e => ({
          id: e._id,
          priceSheetId: e.priceSheetId,
          contactEmail: e.contactEmail,
          sentAt: e.sentAt,
          opened: e.opened,
          clicked: e.clicked
        }))
      }
    }
  })
  
  // Impersonate user (admin only)
  fastify.post('/impersonate/:userId', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    
    const db = database.getDb()
    const { userId } = request.params as { userId: string }
    
    // Get target user
    const targetUser = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) })
    
    if (!targetUser) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      })
    }
    
    // Generate impersonation token
    const impersonationToken = jwt.sign(
      {
        userId: targetUser.id,
        email: targetUser.email,
        impersonatedBy: authRequest.user.id,
        isImpersonation: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    )
    
    // Log the impersonation
    await db.collection('adminLogs').insertOne({
      adminId: authRequest.user.id,
      adminEmail: authRequest.user.email,
      action: 'impersonate',
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      timestamp: new Date()
    })
    
    return {
      message: 'Impersonation token generated',
      accessToken: impersonationToken,
      refreshToken: impersonationToken, // Same token for simplicity
      user: {
        id: targetUser.id,
        email: targetUser.email,
        subscriptionTier: targetUser.subscriptionTier,
        profile: targetUser.profile,
        isImpersonation: true,
        impersonatedBy: authRequest.user.email
      }
    }
  })
  
  // Get admin activity logs
  fastify.get('/logs', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    
    const db = database.getDb()
    
    const logs = await db.collection('adminLogs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()
    
    return { logs }
  })
}

export default adminRoutes

