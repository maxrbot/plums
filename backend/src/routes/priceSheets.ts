import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { PriceSheet, PriceSheetProduct } from '../models/types'
import { sendBulkPriceSheetEmails } from '../services/emailService'
import { generateContactHash, generateUniqueSendHash } from '../utils/contactHash'

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
      
      // Get send stats for each price sheet
      const priceSheetIds = priceSheets.map(ps => ps._id)
      
      // Aggregate sent emails to get recipient counts per price sheet
      const sentStats = await db.collection('sentEmails')
        .aggregate([
          {
            $match: {
              priceSheetId: { $in: priceSheetIds },
              success: true
            }
          },
          {
            $group: {
              _id: '$priceSheetId',
              recipientCount: { $sum: 1 },
              lastSentAt: { $max: '$sentAt' },
              recipients: { $addToSet: '$contactEmail' }
            }
          }
        ])
        .toArray()
      
      // Map stats to price sheets
      const statsMap = new Map()
      sentStats.forEach((stat: any) => {
        statsMap.set(stat._id.toString(), {
          recipientCount: stat.recipientCount,
          lastSentAt: stat.lastSentAt,
          recipients: stat.recipients
        })
      })
      
      // Enhance price sheets with sent info
      const enhancedPriceSheets = priceSheets.map(ps => {
        const stats = statsMap.get(ps._id!.toString())
        return {
          ...ps,
          sentTo: stats?.recipients || [],
          recipientCount: stats?.recipientCount || 0,
          lastSentAt: stats?.lastSentAt || null
        }
      })
      
      return { priceSheets: enhancedPriceSheets }
      
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
        priceType: priceSheet.priceType || 'FOB', // Default to FOB if not specified
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
  
  // Archive/unarchive price sheet
  fastify.patch('/:id/archive', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const { archived } = request.body as { archived: boolean }
    
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
      
      const result = await db.collection<PriceSheet>('priceSheets').updateOne(
        { 
          _id: new ObjectId(id),
          userId: userDoc._id
        },
        {
          $set: {
            status: archived ? 'archived' : 'active',
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
      
      return { 
        success: true,
        message: archived ? 'Price sheet archived' : 'Price sheet restored'
      }
      
    } catch (error) {
      console.error('Archive price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to archive price sheet'
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
  
  // Send price sheet via email
  fastify.post('/:id/send', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const { contactIds, subject, customMessage, customEmailContent, customPricing, customPriceType, bccSender } = request.body as {
      contactIds: string[]
      subject?: string
      customMessage?: string
      customEmailContent?: Record<string, { subject?: string; content?: string }>
      customPricing?: Record<string, Record<string, number>> // contactId -> productId -> price
      customPriceType?: Record<string, 'FOB' | 'DELIVERED'> // contactId -> price type
      bccSender?: boolean
    }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
      })
    }
    
    if (!contactIds || contactIds.length === 0) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'At least one contact is required'
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
      
      // Get price sheet
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
      
      // Get contacts
      const contactObjectIds = contactIds
        .filter(cid => ObjectId.isValid(cid))
        .map(cid => new ObjectId(cid))
      
      const contacts = await db.collection('contacts')
        .find({ 
          _id: { $in: contactObjectIds },
          userId: userDoc._id
        })
        .toArray()
      
      if (contacts.length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No valid contacts found'
        })
      }
      
      // Generate base public URL (no pricing)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const baseUrl = `${frontendUrl}/ps/${priceSheet._id}`
      
      // Build a nice "from name" like "Max Wilson - Function Ranch" or just "Function Ranch"
      const userName = userDoc.name || userDoc.profile?.contactName || userDoc.profile?.name
      const companyName = userDoc.companyName || userDoc.profile?.companyName
      
      const fromName = companyName 
        ? (userName ? `${userName} - ${companyName}` : companyName)
        : (userName || userDoc.email)
      
      // Check user's delivery method preference and default message
      const deliveryMethod = userDoc.pricesheetSettings?.deliveryMethod || userDoc.preferences?.pricesheet?.deliveryMethod || 'link'
      const defaultEmailMessage = userDoc.pricesheetSettings?.defaultEmailMessage || userDoc.preferences?.pricesheet?.defaultEmailMessage || "Here's our latest pricing and availability:"
      
      // If inline delivery, fetch products for the price sheet
      let products: any[] = []
      if (deliveryMethod === 'inline') {
        products = await db.collection<PriceSheetProduct>('priceSheetProducts')
          .find({ priceSheetId: priceSheet._id })
          .toArray()
      }
      
      // Send emails - handle custom content per contact
      let sent = 0
      let failed = 0
      const sentEmailRecords: any[] = []
      
      for (const contact of contacts) {
        const contactId = contact._id.toString()
        const customContent = customEmailContent?.[contactId]
        const contactCustomPricing = customPricing?.[contactId]
        const contactPriceType = customPriceType?.[contactId]
        
        // Generate unique hash for this specific send (includes timestamp for uniqueness)
        const contactHash = generateUniqueSendHash(contactId, priceSheet._id.toString())
        
        // Add buyer company name to URL for personalization
        const buyerCompany = contact.company || `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
        const encodedBuyer = encodeURIComponent(buyerCompany)
        const personalizedUrl = `${baseUrl}?c=${contactHash}&buyer=${encodedBuyer}`
        
        const recipient = {
          email: contact.email,
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email
        }
        
        // Use custom subject/message if provided, otherwise use defaults
        const emailSubject = customContent?.subject || subject || priceSheet.title
        const emailMessage = customContent?.content || customMessage || defaultEmailMessage
        
        // Prepare products for inline delivery (with contact-specific pricing if available)
        const emailProducts = deliveryMethod === 'inline' && products.length > 0
          ? products.map(p => {
              const productId = p._id.toString()
              let finalPrice = p.price
              
              // First, check if there's custom pricing from the send/schedule page (edited prices)
              if (contactCustomPricing?.[productId] !== undefined) {
                finalPrice = contactCustomPricing[productId]
              } else {
                // Apply contact-specific pricing adjustments from contact settings
                const pricesheetSettings = contact.pricesheetSettings || {}
                const globalAdjustment = pricesheetSettings.globalAdjustment || 0
                const cropAdjustments = pricesheetSettings.cropAdjustments || []
                
                // Check for crop-specific adjustment
                const cropKey = `${p.cropId}-${p.variationId}`
                const cropAdjustment = cropAdjustments.find((adj: any) => 
                  `${adj.cropId}-${adj.variationId}` === cropKey
                )
                
                // Apply adjustment (crop-specific takes precedence over global)
                const adjustment = cropAdjustment?.adjustment ?? globalAdjustment
                if (adjustment !== 0 && finalPrice) {
                  finalPrice = finalPrice * (1 + adjustment / 100)
                }
              }
              
              return {
                name: p.productName || `${p.variety || ''} ${p.commodity || ''}`.trim(),
                packageType: p.packageType || '',
                size: p.size || '',
                grade: p.grade,
                availability: p.availability || 'Available',
                price: finalPrice,
                overrideComment: p.overrideComment
              }
            })
          : undefined
        
        // Order URL for inline delivery
        const orderUrl = deliveryMethod === 'inline' 
          ? `${personalizedUrl.replace('/ps/', '/ps/').replace('?', '/order?')}`
          : undefined
        
        try {
          await sendBulkPriceSheetEmails([recipient], {
            from: {
              email: userDoc.email,
              name: fromName
            },
            subject: emailSubject,
            priceSheetTitle: priceSheet.title,
            priceSheetId: priceSheet._id.toString(),
            priceSheetUrl: personalizedUrl, // Use personalized URL with hash
            productsCount: priceSheet.productsCount || 0,
            // Use the template with custom message (not customContent)
            ...(emailMessage && { customMessage: emailMessage }),
            // BCC sender if requested
            ...(bccSender && { bcc: userDoc.email }),
            // Contact ID for tracking
            contactId: contactId,
            // Delivery method and products for inline delivery
            deliveryMethod: deliveryMethod,
            ...(emailProducts && { products: emailProducts }),
            ...(orderUrl && { orderUrl: orderUrl })
          })
          
          // Store the sent email record with all custom data
          sentEmailRecords.push({
            priceSheetId: priceSheet._id,
            userId: userDoc._id,
            contactId: contact._id,
            contactEmail: contact.email,
            contactHash: contactHash, // Include the hash!
            subject: emailSubject,
            sentAt: new Date(),
            success: true,
            // Store custom pricing overrides (productId -> price)
            ...(contactCustomPricing && { customPricing: contactCustomPricing }),
            // Store custom price type (FOB or DELIVERED)
            ...(contactPriceType && { priceType: contactPriceType }),
            // Store custom email content (subject and message)
            ...(customContent && { 
              customEmailContent: {
                subject: customContent.subject,
                content: customContent.content
              }
            })
          })
          
          sent++
        } catch (error) {
          console.error(`Failed to send to ${contact.email}:`, error)
          failed++
        }
      }
      
      const emailResult = {
        success: sent > 0,
        sent,
        failed
      }
      
      // Update price sheet status and sentTo
      await db.collection<PriceSheet>('priceSheets').updateOne(
        { _id: priceSheet._id },
        {
          $set: {
            status: 'sent',
            sentAt: new Date(),
            updatedAt: new Date()
          },
          $addToSet: {
            sentTo: { $each: contactObjectIds }
          }
        }
      )
      
      // Log sent emails with custom pricing and email content if provided
      if (sentEmailRecords.length > 0) {
        await db.collection('sentEmails').insertMany(sentEmailRecords)
      }
      
      return {
        success: true,
        sent: emailResult.sent,
        failed: emailResult.failed,
        totalRecipients: contacts.length,
        priceSheetUrl: baseUrl // Return base URL (without hash)
      }
      
    } catch (error) {
      console.error('Send price sheet error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to send price sheet'
      })
    }
  })
}

export default priceSheetsRoutes
