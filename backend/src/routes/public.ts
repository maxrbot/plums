import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { PriceSheet, PriceSheetProduct } from '../models/types'
import { findContactByHashFromDb } from '../utils/contactHash'

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
      let sentEmail: any = null
      
      if (contactHash) {
        // Look up the sent email by hash (unique per send)
        sentEmail = await db.collection('sentEmails').findOne({
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
              if (product.price === null) return product as any
              
              const productId = product._id.toString()
              
              // Check for custom pricing override first (highest priority)
              if (customPricingOverrides[productId] !== undefined) {
                const customValue = customPricingOverrides[productId]
                
                // Check if it's a comment (string) or price (number)
                if (typeof customValue === 'string') {
                  return {
                    ...product,
                    price: null as any, // Hide price when override comment is set
                    hasOverride: true,
                    overrideComment: customValue
                  } as any
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
          price: null as any // Hide pricing
        })) as any
      }
      
      // Track the view (async, don't wait) - skip if preview mode
      const isPreviewMode = preview === 'true' || (preview as any) === true
      console.log('🔍 Preview mode check:', { preview, isPreviewMode, willTrack: !isPreviewMode })
      
      if (!isPreviewMode) {
        const viewRecord: any = {
          priceSheetId: priceSheet._id!,
          userId: priceSheet.userId,
          contactEmail: contact?.email,
          contactHash: contactHash || undefined, // Save the hash for lookup later
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          viewedAt: new Date(),
          referrer: request.headers.referer
        }
        
        console.log('📊 Tracking view for:', { priceSheetId: priceSheet._id, contactEmail: contact?.email, contactHash })
        db.collection<PriceSheetView>('priceSheetViews').insertOne(viewRecord).catch(err => {
          console.error('Failed to track price sheet view:', err)
        })
      } else {
        console.log('👁️ Preview mode - NOT tracking view')
      }
      
      // Determine price type: use contact-specific if available, otherwise use price sheet default
      const finalPriceType = sentEmail?.priceType || priceSheet.priceType || 'FOB'
      
      return { 
        priceSheet: {
          _id: priceSheet._id,
          title: priceSheet.title,
          status: priceSheet.status,
          productsCount: priceSheet.productsCount,
          notes: priceSheet.notes,
          priceType: finalPriceType, // Use contact-specific or default
          createdAt: priceSheet.createdAt,
          updatedAt: priceSheet.updatedAt
        },
        products,
        showPricing, // Tell frontend whether pricing is visible
        user: user ? {
          companyName: user.profile?.companyName || user.companyName || user.name || 'Farm',
          name: user.profile?.contactName || user.name,
          email: user.email,
          logo: user.pricesheetSettings?.companyLogo || null
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

  // Public route - Send order request email
  fastify.post('/order-request', async (request, reply) => {
    const { 
      priceSheetId, 
      contactHash, 
      buyerName,
      customSubject,
      orderItems, 
      orderComments, 
      orderTotal,
      hasPalletItems 
    } = request.body as {
      priceSheetId: string
      contactHash?: string
      buyerName?: string
      customSubject?: string
      orderItems: Array<{
        productName: string
        packageType: string
        size?: string
        grade?: string
        quantity: number
        unit: string
        subtotal: number | null
      }>
      orderComments?: string
      orderTotal: number
      hasPalletItems: boolean
    }

    if (!ObjectId.isValid(priceSheetId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid price sheet ID'
      })
    }

    try {
      const db = database.getDb()
      
      // Get price sheet
      const priceSheet = await db.collection<PriceSheet>('priceSheets').findOne({
        _id: new ObjectId(priceSheetId)
      })
      
      if (!priceSheet) {
        return reply.status(404).send({
          error: 'Price Sheet Not Found',
          message: 'Price sheet not found'
        })
      }

      // Get user info
      const user = await db.collection('users').findOne({
        _id: priceSheet.userId
      })

      if (!user) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }

      // Get contact email from price sheet views (where we track who viewed the sheet)
      let contactEmail = null
      if (contactHash) {
        console.log('🔍 Looking up contact email from views with hash:', contactHash)
        
        // Look up the email from priceSheetViews collection
        const view = await db.collection('priceSheetViews').findOne({
          priceSheetId: priceSheet._id,
          contactHash: contactHash
        })
        
        if (view) {
          contactEmail = view.contactEmail
          console.log('📇 Contact email found from views:', contactEmail)
        } else {
          console.log('❌ No view found with this hash')
        }
      } else {
        console.log('⚠️ No contact hash provided in request')
      }
      
      // Try to get full contact info from contacts collection
      let contactInfo = null
      if (contactEmail) {
        contactInfo = await db.collection('contacts').findOne({
          userId: priceSheet.userId,
          email: contactEmail
        })
        console.log('📇 Full contact info:', contactInfo ? { email: contactInfo.email, firstName: contactInfo.firstName } : 'Not in contacts')
      }

      // Build email content
      const orderSummary = orderItems.map(item => {
        const priceDisplay = item.subtotal !== null 
          ? `$${item.subtotal.toFixed(2)}`
          : 'Price TBD (Pallet Configuration Required)'
        
        // Format: quantity units - productName (packageType) - price
        // Don't include size or grade to match preview
        const itemDetails = `${item.quantity} ${item.unit} - ${item.productName} (${item.packageType}) - ${priceDisplay}`
        
        return itemDetails
      }).join('\n')

      const commentsSection = orderComments?.trim() 
        ? `\n\nAdditional Comments:\n${orderComments}\n` 
        : ''

      const subject = customSubject || `Order Request - ${priceSheet.title}`
      // Simple email body - no totals, just the order items and comments
      const body = `Hi,\n\nI'm interested in the following items from your price sheet:\n\n${orderSummary}${commentsSection}\nPlease confirm availability.\n\nThank you!`

      // Send email using SendGrid
      const sgMail = require('@sendgrid/mail')
      
      // Initialize SendGrid API key
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY not configured')
        return reply.status(500).send({
          error: 'Configuration Error',
          message: 'Email service not configured'
        })
      }
      
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      const verifiedSendingEmail = process.env.SENDGRID_VERIFIED_EMAIL || 'noreply@acrelist.ag'

      // Determine reply-to email and BCC
      let replyToEmail = verifiedSendingEmail
      let bccEmail = undefined
      
      // Use contactEmail (from views) or contactInfo.email (from contacts) or buyerName if it's an email
      if (contactEmail) {
        replyToEmail = contactEmail
        bccEmail = contactEmail
      } else if (contactInfo?.email) {
        replyToEmail = contactInfo.email
        bccEmail = contactInfo.email
      } else if (buyerName && buyerName.includes('@')) {
        replyToEmail = buyerName
        bccEmail = buyerName
      }

      // Build "from" field with contact's company name
      // Format: "Company Name <noreply@acrelist.ag>"
      let fromField = verifiedSendingEmail
      if (buyerName && !buyerName.includes('@')) {
        // buyerName is a company name, not an email
        fromField = `${buyerName} <${verifiedSendingEmail}>`
      } else if (contactInfo?.companyName) {
        // Use contact's company name from database
        fromField = `${contactInfo.companyName} <${verifiedSendingEmail}>`
      }

      console.log('📧 Email configuration:', {
        to: user.email,
        from: fromField,
        replyTo: replyToEmail,
        bcc: bccEmail,
        contactEmail,
        contactInfo: contactInfo ? { email: contactInfo.email, firstName: contactInfo.firstName, companyName: contactInfo.companyName } : null,
        buyerName
      })

      // Build BCC array: always include platform history email, plus buyer if available
      const bccArray = ['acrelisthistory@gmail.com'] // Platform oversight
      if (bccEmail) {
        bccArray.push(bccEmail) // Buyer gets a copy
      }
      
      console.log('📧 Order request BCC:', bccArray.join(', '))

      const msg = {
        to: user.email,
        from: fromField,
        replyTo: replyToEmail,
        bcc: bccArray,
        subject: subject,
        text: body,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <p>Hi,</p>
            
            <p>I'm interested in the following items from your price sheet:</p>
            
            <pre style="font-family: monospace; font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin: 20px 0;">${orderSummary}</pre>
            
            ${orderComments ? `
              <div style="margin: 20px 0;">
                <strong>Additional Comments:</strong>
                <p style="white-space: pre-wrap; margin: 10px 0;">${orderComments}</p>
              </div>
            ` : ''}
            
            <p>Please confirm availability.</p>
            
            <p style="margin-top: 30px;">Thank you!</p>
          </div>
        `
      }

      await sgMail.send(msg)

      return reply.status(200).send({
        success: true,
        message: 'Order request sent successfully'
      })

    } catch (error: any) {
      console.error('❌ Error sending order request:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.body
      })
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to send order request',
        details: error.message
      })
    }
  })
}

export default publicRoutes

