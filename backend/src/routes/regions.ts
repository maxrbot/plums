import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { ShippingPoint, GrowingRegion } from '../models/types'

// Returns the MongoDB filter to scope region/shippingPoint queries.
function regionFilter(user: { id: string; orgId?: string }, userObjectId: ObjectId) {
  return user.orgId ? { orgId: user.orgId } : { userId: userObjectId }
}

const regionsRoutes: FastifyPluginAsync = async (fastify) => {

  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)

  // Get all shipping points (org-scoped or user-scoped for legacy)
  fastify.get('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest

    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }

      const filter = regionFilter(user, userDoc._id)

      // Query both collections during migration period
      const shippingPoints = await db.collection<ShippingPoint>('shippingPoints')
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()

      // Fallback to old collection if new one is empty
      let regions = shippingPoints
      if (regions.length === 0) {
        const oldRegions = await db.collection<GrowingRegion>('growingRegions')
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray()
        regions = oldRegions
      }
      
      // Transform _id to id for frontend compatibility
      const transformedRegions = regions.map(region => ({
        ...region,
        id: region._id ? region._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }))
      
      return { regions: transformedRegions }
      
    } catch (error) {
      console.error('Get shipping points error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get shipping points'
      })
    }
  })
  
  // Get single growing region
  fastify.get('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid region ID'
      })
    }
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const region = await db.collection<GrowingRegion>('growingRegions').findOne({
        _id: new ObjectId(id),
        ...regionFilter(user, userDoc._id)
      })
      
      if (!region) {
        return reply.status(404).send({
          error: 'Region Not Found',
          message: 'Growing region not found'
        })
      }
      
      if (!region) {
        return reply.status(404).send({
          error: 'Region Not Found',
          message: 'Growing region not found'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedRegion = {
        ...region,
        id: region._id ? region._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedRegion }
      
    } catch (error) {
      console.error('Get region error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get growing region'
      })
    }
  })
  
  // Create new growing region (owner only for org accounts)
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest

    if (user.orgId && user.role !== 'owner') {
      return reply.status(403).send({ error: 'Only the account owner can add shipping points' })
    }

    const regionData = request.body as Omit<GrowingRegion, '_id' | 'userId' | 'createdAt' | 'updatedAt'>

    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })

      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }

      const newRegion: Omit<GrowingRegion, '_id'> = {
        ...regionData,
        userId: userDoc._id!,
        ...(user.orgId ? { orgId: user.orgId } : {}),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<GrowingRegion>('growingRegions').insertOne(newRegion)
      
      const createdRegion = await db.collection<GrowingRegion>('growingRegions').findOne({
        _id: result.insertedId
      })
      
      if (!createdRegion) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve created region'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedRegion = {
        ...createdRegion,
        id: createdRegion._id ? createdRegion._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedRegion }
      
    } catch (error) {
      console.error('Create region error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create growing region'
      })
    }
  })
  
  // Update growing region (owner only for org accounts)
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest

    if (user.orgId && user.role !== 'owner') {
      return reply.status(403).send({ error: 'Only the account owner can edit shipping points' })
    }

    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<GrowingRegion>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid region ID'
      })
    }
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      // Remove fields that shouldn't be updated
      const { _id, userId, createdAt, ...allowedUpdates } = updateData
      
      const result = await db.collection<GrowingRegion>('growingRegions').updateOne(
        {
          _id: new ObjectId(id),
          ...regionFilter(user, userDoc._id)
        },
        { 
          $set: {
            ...allowedUpdates,
            updatedAt: new Date()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return reply.status(404).send({
          error: 'Region Not Found',
          message: 'Growing region not found'
        })
      }
      
      const updatedRegion = await db.collection<GrowingRegion>('growingRegions').findOne({
        _id: new ObjectId(id)
      })
      
      if (!updatedRegion) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve updated region'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedRegion = {
        ...updatedRegion,
        id: updatedRegion._id ? updatedRegion._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedRegion }
      
    } catch (error) {
      console.error('Update region error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update growing region'
      })
    }
  })
  
  // Delete growing region (owner only for org accounts)
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest

    if (user.orgId && user.role !== 'owner') {
      return reply.status(403).send({ error: 'Only the account owner can delete shipping points' })
    }

    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid region ID'
      })
    }
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const result = await db.collection<GrowingRegion>('growingRegions').deleteOne({
        _id: new ObjectId(id),
        ...regionFilter(user, userDoc._id)
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Region Not Found',
          message: 'Growing region not found'
        })
      }
      
      return { message: 'Growing region deleted successfully' }
      
    } catch (error) {
      console.error('Delete region error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete growing region'
      })
    }
  })
}

export default regionsRoutes
