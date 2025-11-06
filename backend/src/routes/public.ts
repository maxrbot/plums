import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { PriceSheet, PriceSheetProduct } from '../models/types'
import { findContactByHash } from '../utils/contactHash'

// Interface for price sheet views tracking
interface PriceSheetView {
  _id?: ObjectId
  priceSheetId: ObjectId
  userId: ObjectId
  contactEmail?: string
  ipAddress?: string
  userAgent?: string
  viewedAt: Date
  referrer?: string
}

const publicRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Public route - Get price sheet by ID (no auth required)
  fastify.get('/price-sheets/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { c: contactHash, preview } = request.query as { c?: string; preview?: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
      })
    }
    
    try {
      const db = database.getDb()
      
      // Get price sheet (no user verification for public access)
      const priceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: new ObjectId(id)
      })
      
      if (!priceSheet) {
        return reply.status(404).send({
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found or no longer available'
        })
      }
      
      // Get associated products
      let products = priceSheet.productIds && priceSheet.productIds.length > 0
        ? await db.collection<PriceSheetProduct>('priceSheetProducts')
            .find({ _id: { $in: priceSheet.productIds } })
            .sort({ createdAt: 1 })
            .toArray()
        : []
      
      // Get user info for branding (company name, etc.)
      const user = await db.collection('users').findOne({ _id: priceSheet.userId })
      
      // Check if we have a valid contact hash
      let contact = null
      let showPricing = false
      
      if (contactHash) {
        // Look up the sent email by hash (unique per send)
        const sentEmail = await db.collection('sentEmails').findOne({
          priceSheetId: priceSheet._id,
          contactHash: contactHash
        })
        
        if (sentEmail) {
          // Valid hash! Get the contact details
          contact = await db.collection('contacts').findOne({
            _id: sentEmail.contactId,
            userId: priceSheet.userId
          })
          
          if (contact) {
            showPricing = true
            
            // Get custom pricing overrides from this specific send
            const customPricingOverrides = sentEmail.customPricing || {}
            
            // Apply contact-specific pricing adjustments
            const pricesheetSettings = contact.pricesheetSettings || {}
            const globalAdjustment = pricesheetSettings.globalAdjustment || contact.pricingAdjustment || 0
            const cropAdjustments = pricesheetSettings.cropAdjustments || []
            
            // Build a map of crop-specific adjustments for quick lookup
            const cropAdjustmentMap = new Map()
            cropAdjustments.forEach((adj: any) => {
              const key = `${adj.cropId}-${adj.variationId}`
              cropAdjustmentMap.set(key, adj.adjustment)
            })
            
            // Apply pricing adjustments
            products = products.map(product => {
              if (product.price === null) return product
              
              const productId = product._id.toString()
              
              // Check for custom pricing override first (highest priority)
              if (customPricingOverrides[productId] !== undefined) {
                const customValue = customPricingOverrides[productId]
                
                // Check if it's a comment (string) or price (number)
                if (typeof customValue === 'string') {
                  return {
                    ...product,
                    price: null, // Hide price when override comment is set
                    hasOverride: true,
                    overrideComment: customValue
                  }
                } else {
                  return {
                    ...product,
                    price: customValue
                  }
                }
              }
              
              // Otherwise, check for crop-specific adjustment
              const cropKey = `${product.cropId}-${product.variationId}`
              const adjustment = cropAdjustmentMap.get(cropKey) ?? globalAdjustment
              
              return {
                ...product,
                price: adjustment !== 0 
                  ? product.price * (1 + adjustment / 100)
                  : product.price
              }
            })
          }
        }
      }
      
      // If no valid hash, hide all pricing
      if (!showPricing) {
        products = products.map(product => ({
          ...product,
          price: null // Hide pricing
        }))
      }
      
      // Track the view (async, don't wait) - skip if preview mode
      if (preview !== 'true') {
        const viewRecord: Omit<PriceSheetView, '_id'> = {
          priceSheetId: priceSheet._id!,
          userId: priceSheet.userId,
          contactEmail: contact?.email,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          viewedAt: new Date(),
          referrer: request.headers.referer
        }
        
        db.collection<PriceSheetView>('priceSheetViews').insertOne(viewRecord).catch(err => {
          console.error('Failed to track price sheet view:', err)
        })
      }
      
      return { 
        priceSheet: {
          _id: priceSheet._id,
          title: priceSheet.title,
          status: priceSheet.status,
          productsCount: priceSheet.productsCount,
          notes: priceSheet.notes,
          createdAt: priceSheet.createdAt,
          updatedAt: priceSheet.updatedAt
        },
        products,
        showPricing, // Tell frontend whether pricing is visible
        user: user ? {
          companyName: user.profile?.companyName || user.companyName || user.name || 'Farm',
          name: user.profile?.contactName || user.name,
          email: user.email
        } : null
      }
      
    } catch (error) {
      console.error('Get public price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get price sheet'
      })
    }
  })
  
  // Track email opens (for SendGrid webhook)
  fastify.post('/track/email-open', async (request, reply) => {
    const { priceSheetId, contactEmail } = request.body as { 
      priceSheetId: string
      contactEmail: string 
    }
    
    if (!priceSheetId || !ObjectId.isValid(priceSheetId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid data'
      })
    }
    
    try {
      const db = database.getDb()
      
      // Track email open
      await db.collection('emailOpens').insertOne({
        priceSheetId: new ObjectId(priceSheetId),
        contactEmail,
        openedAt: new Date(),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      })
      
      return { success: true }
      
    } catch (error) {
      console.error('Track email open error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to track email open'
      })
    }
  })
}

export default publicRoutes

