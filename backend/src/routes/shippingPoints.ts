import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { ShippingPoint, GrowingRegion } from '../models/types'

const shippingPointsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's shipping points
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
      
      // Query shipping points collection first
      let shippingPoints = await db.collection<ShippingPoint>('shippingPoints')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      // If no shipping points exist, migrate from old growing regions
      if (shippingPoints.length === 0) {
        const oldRegions = await db.collection<GrowingRegion>('growingRegions')
          .find({ userId: userDoc._id })
          .sort({ createdAt: -1 })
          .toArray()
        
        // Auto-migrate old regions to shipping points
        if (oldRegions.length > 0) {
          const migratedPoints: Omit<ShippingPoint, '_id'>[] = oldRegions.map(region => ({
            userId: region.userId,
            name: region.name,
            facilityType: 'warehouse', // Default facility type
            location: region.location,
            operationTypes: region.farmingTypes || [],
            capacity: region.acreage || '',
            notes: region.notes || '',
            source: 'manual',
            shipping: {
              zones: [],
              methods: ['Truck'],
              leadTime: 2
            },
            createdAt: region.createdAt,
            updatedAt: new Date()
          }))
          
          // Insert migrated points
          const result = await db.collection<ShippingPoint>('shippingPoints').insertMany(migratedPoints)
          
          // Fetch the newly created points
          shippingPoints = await db.collection<ShippingPoint>('shippingPoints')
            .find({ _id: { $in: Object.values(result.insertedIds) } })
            .sort({ createdAt: -1 })
            .toArray()
          
          console.log(`✅ Auto-migrated ${oldRegions.length} regions to shipping points for user ${user.id}`)
        }
      }
      
      // Transform _id to id for frontend compatibility
      const transformedPoints = shippingPoints.map(point => ({
        ...point,
        id: point._id ? point._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }))
      
      return { regions: transformedPoints } // Keep 'regions' key for backward compatibility
      
    } catch (error) {
      console.error('Get shipping points error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get shipping points'
      })
    }
  })
  
  // Get single shipping point
  fastify.get('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid shipping point ID'
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
      
      const shippingPoint = await db.collection<ShippingPoint>('shippingPoints').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (!shippingPoint) {
        return reply.status(404).send({
          error: 'Shipping Point Not Found',
          message: 'Shipping point not found'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedPoint = {
        ...shippingPoint,
        id: shippingPoint._id ? shippingPoint._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedPoint } // Keep 'region' key for backward compatibility
      
    } catch (error) {
      console.error('Get shipping point error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get shipping point'
      })
    }
  })
  
  // Create new shipping point
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const pointData = request.body as Omit<ShippingPoint, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const newShippingPoint: Omit<ShippingPoint, '_id'> = {
        ...pointData,
        userId: userDoc._id!,
        facilityType: pointData.facilityType || 'warehouse',
        operationTypes: pointData.operationTypes || [],
        source: 'manual',
        shipping: {
          zones: pointData.shipping?.zones || [],
          methods: pointData.shipping?.methods || ['Truck'],
          leadTime: pointData.shipping?.leadTime || 2,
          minimumOrder: pointData.shipping?.minimumOrder || undefined
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<ShippingPoint>('shippingPoints').insertOne(newShippingPoint)
      
      const createdPoint = await db.collection<ShippingPoint>('shippingPoints').findOne({
        _id: result.insertedId
      })
      
      if (!createdPoint) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve created shipping point'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedPoint = {
        ...createdPoint,
        id: createdPoint._id ? createdPoint._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedPoint } // Keep 'region' key for backward compatibility
      
    } catch (error) {
      console.error('Create shipping point error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create shipping point'
      })
    }
  })
  
  // Update shipping point
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<Omit<ShippingPoint, '_id' | 'userId' | 'createdAt'>>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid shipping point ID'
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
      
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      }
      
      // Get the old shipping point first (before updating) to know the old name
      const oldShippingPoint = await db.collection<ShippingPoint>('shippingPoints').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      const result = await db.collection<ShippingPoint>('shippingPoints').findOneAndUpdate(
        { _id: new ObjectId(id), userId: userDoc._id },
        { $set: updatePayload },
        { returnDocument: 'after' }
      )
      
      if (!result) {
        return reply.status(404).send({
          error: 'Shipping Point Not Found',
          message: 'Shipping point not found'
        })
      }
      
      // If the name changed, update all crop variations that reference this shipping point
      if (updateData.name && oldShippingPoint) {
        const oldName = oldShippingPoint.name
        console.log(`🔄 Updating crop variations for shipping point ${id} (old name: "${oldName}") with new name: "${updateData.name}"`)
        
        // First, let's see what's actually in the database
        const allCrops = await db.collection('cropManagement').find({
          userId: userDoc._id,
          'variations.shippingPoints': { $exists: true }
        }).toArray()
        
        console.log(`📋 Found ${allCrops.length} crops with shipping points`)
        
        // Show all unique shipping point names and IDs
        const allShippingPoints = new Set<string>()
        allCrops.forEach((crop: any) => {
          crop.variations?.forEach((variation: any) => {
            variation.shippingPoints?.forEach((sp: any) => {
              allShippingPoints.add(`ID: ${sp.regionId} | Name: ${sp.regionName}`)
            })
          })
        })
        
        console.log(`📋 All shipping points in crops:`)
        allShippingPoints.forEach(sp => console.log(`   - ${sp}`))
        
        // Get the Google Places ID from the shipping point (if it exists)
        const placeId = oldShippingPoint.location?.placeId
        console.log(`📍 Shipping point has placeId: ${placeId || 'none'}`)
        
        // Update using regionId/regionName (the actual field names used in the database)
        // Try to match by MongoDB ObjectId first
        const updateResult = await db.collection('cropManagement').updateMany(
          { 
            userId: userDoc._id,
            'variations.shippingPoints.regionId': id
          },
          { 
            $set: { 
              'variations.$[].shippingPoints.$[point].regionName': updateData.name 
            } 
          },
          {
            arrayFilters: [{ 'point.regionId': id }]
          }
        )
        
        // Try to match by Google Places ID (the actual ID stored in old variations)
        let updateByPlaceIdResult = { modifiedCount: 0 }
        if (placeId) {
          updateByPlaceIdResult = await db.collection('cropManagement').updateMany(
            { 
              userId: userDoc._id,
              'variations.shippingPoints.regionId': placeId
            },
            { 
              $set: { 
                'variations.$[].shippingPoints.$[point].regionName': updateData.name 
              } 
            },
            {
              arrayFilters: [{ 'point.regionId': placeId }]
            }
          )
        }
        
        // Also try to match by the old name (for variations that might have been created with name-based IDs)
        const updateByNameResult = await db.collection('cropManagement').updateMany(
          { 
            userId: userDoc._id,
            'variations.shippingPoints.regionName': oldName
          },
          { 
            $set: { 
              'variations.$[].shippingPoints.$[point].regionName': updateData.name 
            } 
          },
          {
            arrayFilters: [{ 'point.regionName': oldName }]
          }
        )
        
        console.log(`✅ Updated ${updateResult.modifiedCount} by MongoDB ID + ${updateByPlaceIdResult.modifiedCount} by Places ID + ${updateByNameResult.modifiedCount} by name = ${updateResult.modifiedCount + updateByPlaceIdResult.modifiedCount + updateByNameResult.modifiedCount} total documents`)
      }
      
      // Transform _id to id for frontend compatibility
      const transformedPoint = {
        ...result,
        id: result._id ? result._id.toString() : undefined,
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { region: transformedPoint } // Keep 'region' key for backward compatibility
      
    } catch (error) {
      console.error('Update shipping point error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update shipping point'
      })
    }
  })
  
  // Delete shipping point
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid shipping point ID'
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
      
      const result = await db.collection<ShippingPoint>('shippingPoints').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Shipping Point Not Found',
          message: 'Shipping point not found'
        })
      }
      
      return { success: true, message: 'Shipping point deleted successfully' }
      
    } catch (error) {
      console.error('Delete shipping point error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete shipping point'
      })
    }
  })
}

export default shippingPointsRoutes
