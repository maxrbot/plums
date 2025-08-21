import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { Certification } from '../models/types'

const certificationsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's certifications
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
      
      const certifications = await db.collection<Certification>('certifications')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      return { certifications }
      
    } catch (error) {
      console.error('Get certifications error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get certifications'
      })
    }
  })
  
  // Create new certification
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const certData = request.body as Omit<Certification, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const newCertification: Omit<Certification, '_id'> = {
        ...certData,
        userId: userDoc._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<Certification>('certifications').insertOne(newCertification)
      
      const createdCertification = await db.collection<Certification>('certifications').findOne({
        _id: result.insertedId
      })
      
      return { certification: createdCertification }
      
    } catch (error) {
      console.error('Create certification error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create certification'
      })
    }
  })
  
  // Update certification
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<Certification>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid certification ID'
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
      
      const result = await db.collection<Certification>('certifications').updateOne(
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
          error: 'Certification Not Found',
          message: 'Certification not found'
        })
      }
      
      const updatedCertification = await db.collection<Certification>('certifications').findOne({
        _id: new ObjectId(id)
      })
      
      return { certification: updatedCertification }
      
    } catch (error) {
      console.error('Update certification error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update certification'
      })
    }
  })
  
  // Delete certification
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid certification ID'
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
      
      const result = await db.collection<Certification>('certifications').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Certification Not Found',
          message: 'Certification not found'
        })
      }
      
      return { message: 'Certification deleted successfully' }
      
    } catch (error) {
      console.error('Delete certification error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete certification'
      })
    }
  })
}

export default certificationsRoutes
