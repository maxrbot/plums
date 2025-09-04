import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { PriceSheet, PriceSheetProduct } from '../models/types'

const priceSheetsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's price sheets
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
      
      const priceSheets = await db.collection<PriceSheet>('priceSheets')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      return { priceSheets }
      
    } catch (error) {
      console.error('Get price sheets error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get price sheets'
      })
    }
  })
  
  // Get single price sheet with products
  fastify.get('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
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
      
      const priceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (!priceSheet) {
        return reply.status(404).send({
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found'
        })
      }
      
      // Get associated products using productIds array for efficiency
      const products = priceSheet.productIds && priceSheet.productIds.length > 0
        ? await db.collection<PriceSheetProduct>('priceSheetProducts')
            .find({ _id: { $in: priceSheet.productIds } })
            .sort({ createdAt: 1 })
            .toArray()
        : []
      
      return { 
        priceSheet,
        products
      }
      
    } catch (error) {
      console.error('Get price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get price sheet'
      })
    }
  })
  
  // Create new price sheet with products
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { priceSheet, products } = request.body as {
      priceSheet: Omit<PriceSheet, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
      products: Omit<PriceSheetProduct, '_id' | 'priceSheetId' | 'userId' | 'createdAt' | 'updatedAt'>[]
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
      
      // First create products (without priceSheetId)
      const newProducts = products.map(product => {
        const baseProduct = {
          ...product,
          priceSheetId: null as any, // Will be updated after price sheet creation
          userId: userDoc._id!,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Convert cropId to ObjectId if it's a valid ObjectId string
        try {
          if (product.cropId && ObjectId.isValid(product.cropId)) {
            baseProduct.cropId = new ObjectId(product.cropId)
          } else {
            // Keep as string if not a valid ObjectId
            baseProduct.cropId = product.cropId
          }
        } catch (error) {
          console.warn('Invalid cropId, keeping as string:', product.cropId)
          baseProduct.cropId = product.cropId
        }
        
        // Convert regionId to ObjectId if it exists and is valid
        if (product.regionId) {
          try {
            if (ObjectId.isValid(product.regionId)) {
              return {
                ...baseProduct,
                regionId: new ObjectId(product.regionId)
              }
            } else {
              // Keep as string if not a valid ObjectId
              return {
                ...baseProduct,
                regionId: product.regionId
              }
            }
          } catch (error) {
            console.warn('Invalid regionId, keeping as string:', product.regionId)
            return {
              ...baseProduct,
              regionId: product.regionId
            }
          }
        }
        
        return baseProduct
      })
      
      let productIds: any[] = []
      if (newProducts.length > 0) {
        const productsResult = await db.collection<PriceSheetProduct>('priceSheetProducts').insertMany(newProducts)
        productIds = Object.values(productsResult.insertedIds)
      }

      // Create price sheet with product IDs
      const newPriceSheet: Omit<PriceSheet, '_id'> = {
        ...priceSheet,
        userId: userDoc._id!,
        productIds: productIds,
        productsCount: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const priceSheetResult = await db.collection<PriceSheet>('priceSheets').insertOne(newPriceSheet)
      
      // Update products with priceSheetId
      if (productIds.length > 0) {
        await db.collection<PriceSheetProduct>('priceSheetProducts').updateMany(
          { _id: { $in: productIds } },
          { $set: { priceSheetId: priceSheetResult.insertedId } }
        )
      }
      
      // Get created price sheet with products
      const createdPriceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: priceSheetResult.insertedId
      })
      
      const createdProducts = await db.collection<PriceSheetProduct>('priceSheetProducts')
        .find({ priceSheetId: priceSheetResult.insertedId })
        .toArray()
      
      return { 
        priceSheet: createdPriceSheet,
        products: createdProducts
      }
      
    } catch (error) {
      console.error('Create price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create price sheet'
      })
    }
  })
  
  // Update price sheet
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<PriceSheet>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
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
      
      const result = await db.collection<PriceSheet>('priceSheets').updateOne(
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
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found'
        })
      }
      
      const updatedPriceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: new ObjectId(id)
      })
      
      return { priceSheet: updatedPriceSheet }
      
    } catch (error) {
      console.error('Update price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update price sheet'
      })
    }
  })
  
  // Delete price sheet and associated products
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
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
      
      const priceSheetId = new ObjectId(id)
      
      // Delete products first
      await db.collection<PriceSheetProduct>('priceSheetProducts').deleteMany({
        priceSheetId
      })
      
      // Delete price sheet
      const result = await db.collection<PriceSheet>('priceSheets').deleteOne({
        _id: priceSheetId,
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found'
        })
      }
      
      return { message: 'Price sheet deleted successfully' }
      
    } catch (error) {
      console.error('Delete price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete price sheet'
      })
    }
  })
  
  // Get products for a price sheet
  fastify.get('/:id/products', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
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
      
      // Verify price sheet exists and belongs to user
      const priceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (!priceSheet) {
        return reply.status(404).send({
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found'
        })
      }
      
      const products = await db.collection<PriceSheetProduct>('priceSheetProducts')
        .find({ priceSheetId: priceSheet._id })
        .sort({ createdAt: 1 })
        .toArray()
      
      return { products }
      
    } catch (error) {
      console.error('Get price sheet products error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get price sheet products'
      })
    }
  })
}

export default priceSheetsRoutes
