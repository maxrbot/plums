import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { CustomPackaging } from '../models/types'

const packagingRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's custom packaging
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
      
      const packaging = await db.collection<CustomPackaging>('customPackaging')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      return { packaging }
      
    } catch (error) {
      console.error('Get packaging error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get custom packaging'
      })
    }
  })
  
  // Create new custom packaging
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const packagingData = request.body as Omit<CustomPackaging, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const newPackaging: Omit<CustomPackaging, '_id'> = {
        ...packagingData,
        userId: userDoc._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<CustomPackaging>('customPackaging').insertOne(newPackaging)
      
      const createdPackaging = await db.collection<CustomPackaging>('customPackaging').findOne({
        _id: result.insertedId
      })
      
      return { packaging: createdPackaging }
      
    } catch (error) {
      console.error('Create packaging error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create custom packaging'
      })
    }
  })
  
  // Update custom packaging
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<CustomPackaging>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid packaging ID'
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
      
      const { _id, userId, createdAt, ...allowedUpdates } = updateData
      
      const result = await db.collection<CustomPackaging>('customPackaging').updateOne(
        { 
          _id: new ObjectId(id),
          userId: userDoc._id
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
          error: 'Packaging Not Found',
          message: 'Custom packaging not found'
        })
      }
      
      const updatedPackaging = await db.collection<CustomPackaging>('customPackaging').findOne({
        _id: new ObjectId(id)
      })
      
      return { packaging: updatedPackaging }
      
    } catch (error) {
      console.error('Update packaging error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update custom packaging'
      })
    }
  })
  
  // Delete custom packaging
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid packaging ID'
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
      
      const result = await db.collection<CustomPackaging>('customPackaging').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Packaging Not Found',
          message: 'Custom packaging not found'
        })
      }
      
      return { message: 'Custom packaging deleted successfully' }
      
    } catch (error) {
      console.error('Delete packaging error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete custom packaging'
      })
    }
  })
}

export default packagingRoutes
