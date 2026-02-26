import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { CropManagement } from '../models/types'

// Keep supplierDirectory.products in sync whenever a user's crops change
async function syncDirectoryProducts(db: any, userId: string, userMongoId: any) {
  const dirEntry = await db.collection('supplierDirectory').findOne({ acrelistUserId: userId })
  if (!dirEntry) return // user hasn't claimed a listing, nothing to sync

  const crops = await db.collection('cropManagement').find({ userId: userMongoId }).toArray()
  const products = crops.flatMap((crop: any) => {
    const varieties = [...new Set(
      (crop.variations || []).map((v: any) => v.variety).filter(Boolean)
    )] as string[]
    const isOrganic = (crop.variations || []).some((v: any) => v.isOrganic)
    const isYearRound = (crop.variations || []).some((v: any) =>
      v.shippingPoints?.some((sp: any) => sp.availability?.isYearRound)
    )
    return [{
      commodity: crop.commodity
        ? crop.commodity.charAt(0).toUpperCase() + crop.commodity.slice(1)
        : crop.commodity,
      varieties,
      isOrganic,
      seasonality: { type: isYearRound ? 'year-round' : 'seasonal', description: isYearRound ? 'Year-round' : 'Seasonal' },
      volume: null, priceRange: null,
      tags: [...(isOrganic ? ['organic'] : []), isYearRound ? 'year-round' : 'seasonal'],
      minimumOrder: null, typicalLotSizes: [], packaging: []
    }]
  })

  await db.collection('supplierDirectory').updateOne(
    { acrelistUserId: userId },
    { $set: { products, updatedAt: new Date() } }
  )
}

const cropsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's crops
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
      
      const crops = await db.collection<CropManagement>('cropManagement')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      // Transform _id to id for frontend compatibility
      const transformedCrops = crops.map(crop => ({
        ...crop,
        id: crop._id ? crop._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }))
      
      return { crops: transformedCrops }
      
    } catch (error) {
      console.error('Get crops error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get crops'
      })
    }
  })
  
  // Get single crop
  fastify.get('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid crop ID'
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
      
      const crop = await db.collection<CropManagement>('cropManagement').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (!crop) {
        return reply.status(404).send({
          error: 'Crop Not Found',
          message: 'Crop not found'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedCrop = {
        ...crop,
        id: crop._id ? crop._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { crop: transformedCrop }
      
    } catch (error) {
      console.error('Get crop error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get crop'
      })
    }
  })
  
  // Create new crop
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const cropData = request.body as Omit<CropManagement, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const newCrop: Omit<CropManagement, '_id'> = {
        ...cropData,
        userId: userDoc._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<CropManagement>('cropManagement').insertOne(newCrop)
      
      const createdCrop = await db.collection<CropManagement>('cropManagement').findOne({
        _id: result.insertedId
      })
      
      if (!createdCrop) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve created crop'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedCrop = {
        ...createdCrop,
        id: createdCrop._id ? createdCrop._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }

      // Sync directory listing in the background
      syncDirectoryProducts(db, user.id, userDoc._id).catch(() => {})

      return { crop: transformedCrop }

    } catch (error) {
      console.error('Create crop error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create crop'
      })
    }
  })
  
  // Update crop
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<CropManagement>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid crop ID'
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
      
      const result = await db.collection<CropManagement>('cropManagement').updateOne(
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
          error: 'Crop Not Found',
          message: 'Crop not found'
        })
      }
      
      const updatedCrop = await db.collection<CropManagement>('cropManagement').findOne({
        _id: new ObjectId(id)
      })
      
      if (!updatedCrop) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve updated crop'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedCrop = {
        ...updatedCrop,
        id: updatedCrop._id ? updatedCrop._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }

      // Sync directory listing in the background
      syncDirectoryProducts(db, user.id, userDoc._id).catch(() => {})

      return { crop: transformedCrop }

    } catch (error) {
      console.error('Update crop error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update crop'
      })
    }
  })
  
  // Delete crop
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid crop ID'
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
      
      const result = await db.collection<CropManagement>('cropManagement').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Crop Not Found',
          message: 'Crop not found'
        })
      }
      
      // Sync directory listing in the background (crop removed, so products list shrinks)
      syncDirectoryProducts(db, user.id, userDoc._id).catch(() => {})

      return { message: 'Crop deleted successfully' }

    } catch (error) {
      console.error('Delete crop error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete crop'
      })
    }
  })
}

export default cropsRoutes
