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

          // Filter products by contact's primary crop interests
          const primaryCrops: string[] = contact.primaryCrops || []
          if (primaryCrops.length > 0) {
            products = products.filter((product: any) => {
              const commodity = (product.commodity || '').toLowerCase()
              return primaryCrops.some((crop: string) => crop.toLowerCase() === commodity)
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
        price?: number
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
          : `$${(item.price || 0).toFixed(2)} per ${item.packageType && item.packageType !== '-' ? item.packageType.toLowerCase() : 'unit'} × [pallet qty]`
        
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

  // Public route - Search products (for ProduceHunt)
  // Returns tiered results:
  //   Tier 1 — AcreList supplier with matching priceSheetProducts on a searchable price sheet (live pricing)
  //   Tier 2 — AcreList supplier with matching directory products but no live pricing
  //   Tier 3 — Directory supplier (unclaimed) with matching products, ranked by verification score
  //   Tier 4 — Company name match only (no product match), ranked by verification score
  fastify.get('/search-products', async (request, reply) => {
    const { q, limit = 20 } = request.query as { q?: string; limit?: number }

    try {
      const db = database.getDb()

      if (!q || !q.trim()) {
        return {
          results: [],
          count: 0,
          query: ''
        }
      }

      const searchTerm = q.toLowerCase().trim()

      // Parse search query for modifiers and commodity terms
      const words = searchTerm.split(/\s+/)

      // Modifier detection
      const modifiers = {
        organic: false
      }

      // Category mappings (citrus -> lemons, oranges, mandarins, etc.)
      const categoryMappings: { [key: string]: string[] } = {
        'citrus': ['lemon', 'lemons', 'orange', 'oranges', 'mandarin', 'mandarins', 'grapefruit', 'lime', 'limes', 'tangerine', 'tangerines', 'clementine', 'clementines'],
        'berries': ['strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries'],
        'stone fruit': ['peach', 'peaches', 'nectarine', 'nectarines', 'plum', 'plums', 'apricot', 'apricots', 'cherry', 'cherries'],
        'tropical': ['mango', 'mangoes', 'pineapple', 'pineapples', 'papaya', 'papayas', 'banana', 'bananas'],
        'melons': ['watermelon', 'watermelons', 'cantaloupe', 'cantaloupes', 'honeydew']
      }

      // Remove modifiers from search words
      const commodityWords = words.filter(word => {
        if (word === 'organic' || word === 'organics') {
          modifiers.organic = true
          return false
        }
        return true
      })

      // Stem a word to its singular base form
      const stem = (word: string): string | null => {
        if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y' // berries -> berry
        if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1) // lemons -> lemon, limes -> lime
        return null
      }

      // Build commodity search terms (include category expansions + singular stems)
      const commoditySearchTerms: string[] = []
      commodityWords.forEach(word => {
        commoditySearchTerms.push(word)
        const singular = stem(word)
        if (singular && singular !== word) commoditySearchTerms.push(singular)
        for (const [category, items] of Object.entries(categoryMappings)) {
          if (category === word || category.includes(word)) {
            commoditySearchTerms.push(...items)
          }
        }
      })

      // Build directory query (products + company name)
      const productMatchQuery: any = {
        $or: [
          ...(commoditySearchTerms.length > 0
            ? commoditySearchTerms.map(term => ({
                products: { $elemMatch: { commodity: { $regex: term, $options: 'i' } } }
              }))
            : [{ products: { $elemMatch: { commodity: { $regex: searchTerm, $options: 'i' } } } }]),
          ...(commoditySearchTerms.length > 0
            ? commoditySearchTerms.map(term => ({
                products: { $elemMatch: { varieties: { $regex: term, $options: 'i' } } }
              }))
            : [{ products: { $elemMatch: { varieties: { $regex: searchTerm, $options: 'i' } } } }]),
          { companyName: { $regex: searchTerm, $options: 'i' } }
        ]
      }

      if (modifiers.organic) {
        productMatchQuery['products'] = { $elemMatch: { isOrganic: true } }
      }

      const suppliers = await db.collection('supplierDirectory')
        .find(productMatchQuery)
        .limit(Math.min(Number(limit) * 3, 60)) // fetch more so tiers have room
        .toArray()

      // Helper: does this supplier's products[] contain a match for the search?
      const hasDirectoryProductMatch = (supplier: any): boolean => {
        return (supplier.products || []).some((p: any) => {
          const commodityMatch = commoditySearchTerms.some(t =>
            p.commodity?.toLowerCase().includes(t)
          ) || p.commodity?.toLowerCase().includes(searchTerm)
          const varietyMatch = (p.varieties || []).some((v: string) =>
            commoditySearchTerms.some(t => v.toLowerCase().includes(t)) ||
            v.toLowerCase().includes(searchTerm)
          )
          const organicMatch = modifiers.organic ? p.isOrganic : true
          return (commodityMatch || varietyMatch) && organicMatch
        })
      }

      // Check which claimed suppliers have live price sheet products matching the search
      const claimedUserIds = suppliers
        .map(s => s.acrelistUserId)
        .filter(Boolean) as string[]

      const pricingSet = new Set<string>()
      const pricingSheetMap = new Map<string, string>()
      const pricingProductMap = new Map<string, any[]>()

      if (claimedUserIds.length > 0) {
        const commodityRegexes = commoditySearchTerms.length > 0
          ? commoditySearchTerms.map(t => new RegExp(t, 'i'))
          : [new RegExp(searchTerm, 'i')]

        const claimedObjectIds = claimedUserIds
          .map(id => { try { return new ObjectId(id) } catch { return null } })
          .filter(Boolean) as ObjectId[]

        const searchablePriceSheets = await db.collection('priceSheets').find({
          searchable: true
        }, { projection: { _id: 1 } }).toArray()
        const searchablePriceSheetObjectIds = searchablePriceSheets.map((ps: any) => ps._id)

        const pricingMatches = searchablePriceSheetObjectIds.length > 0 && claimedObjectIds.length > 0
          ? await db.collection('priceSheetProducts').find({
              userId: { $in: claimedObjectIds },
              priceSheetId: { $in: searchablePriceSheetObjectIds },
              $or: commodityRegexes.map(r => ({ commodity: r }))
            }).toArray()
          : []

        pricingMatches.forEach((pm: any) => {
          const userIdStr = pm.userId?.toString()
          if (!userIdStr) return
          pricingSet.add(userIdStr)
          if (!pricingSheetMap.has(userIdStr)) {
            pricingSheetMap.set(userIdStr, pm.priceSheetId?.toString())
          }
          const existing = pricingProductMap.get(userIdStr) || []
          if (existing.length < 3) {
            existing.push({
              commodity: pm.commodity,
              packageType: pm.packageType,
              price: pm.price,
              unit: pm.unit,
              size: pm.size,
              regionName: pm.regionName // shipping point where this product originates
            })
            pricingProductMap.set(userIdStr, existing)
          }
        })
      }

      // Fetch AcreList user profile locations for claimed suppliers (location fallback)
      const userLocationMap = new Map<string, string>()
      if (claimedUserIds.length > 0) {
        const claimedObjectIds = claimedUserIds
          .map(id => { try { return new ObjectId(id) } catch { return null } })
          .filter(Boolean) as ObjectId[]

        const claimedUsers = await db.collection('users').find(
          { _id: { $in: claimedObjectIds } },
          { projection: { _id: 1, 'profile.address': 1 } }
        ).toArray()

        claimedUsers.forEach(u => {
          const addr = u.profile?.address
          if (addr?.city && addr?.state) {
            userLocationMap.set(u._id.toString(), `${addr.city}, ${addr.state}`)
          } else if (addr?.state) {
            userLocationMap.set(u._id.toString(), addr.state)
          }
        })
      }

      // Build results with tier assignment
      const results = suppliers.map(supplier => {
        const embeddedProducts: any[] = supplier.products || []

        const matchingProduct = embeddedProducts.find(p => {
          const commodityMatch = commoditySearchTerms.some(term =>
            p.commodity?.toLowerCase().includes(term)
          ) || p.commodity?.toLowerCase().includes(searchTerm)
          const varietyMatch = (p.varieties || []).some((v: string) =>
            commoditySearchTerms.some(term => v.toLowerCase().includes(term)) ||
            v.toLowerCase().includes(searchTerm)
          )
          const organicMatch = modifiers.organic ? p.isOrganic : true
          return (commodityMatch || varietyMatch) && organicMatch
        }) || embeddedProducts[0]

        const commodity = matchingProduct?.commodity || 'Unknown'
        const isOrganic = matchingProduct?.isOrganic || false
        const varieties: string[] = matchingProduct?.varieties || []

        const isClaimed = Boolean(supplier.acrelistUserId)
        const hasPricing = isClaimed && pricingSet.has(supplier.acrelistUserId)
        const isProductMatch = hasDirectoryProductMatch(supplier)

        // Tier assignment
        // Tier 1: AcreList supplier with matching searchable price sheet products (live pricing)
        // Tier 2: AcreList supplier with matching directory products, no live pricing
        // Tier 3: Unclaimed directory supplier with matching products
        // Tier 4: Company name match only (no product match in products[])
        let tier: 1 | 2 | 3 | 4
        if (hasPricing && isProductMatch) tier = 1
        else if (isClaimed && isProductMatch) tier = 2
        else if (isProductMatch) tier = 3
        else tier = 4

        // Location: prefer directory data, fall back to AcreList profile address
        const location =
          supplier.location?.full ||
          (supplier.acrelistUserId ? userLocationMap.get(supplier.acrelistUserId) : null) ||
          'Unknown Location'

        return {
          _id: supplier._id,
          productName: `${isOrganic ? 'Organic ' : ''}${commodity}`,
          commodity,
          variety: varieties[0],
          isOrganic,
          regionName: supplier.location?.region,
          packageType: 'Various',
          price: 0,
          availability: hasPricing ? 'Pricing available' : 'Contact for availability',
          source: 'supplier' as const,
          tier,
          hasPricing,
          priceSheetId: hasPricing && supplier.acrelistUserId
            ? pricingSheetMap.get(supplier.acrelistUserId)
            : undefined,
          pricingProducts: hasPricing && supplier.acrelistUserId
            ? (pricingProductMap.get(supplier.acrelistUserId) || [])
            : [],
          supplier: {
            companyName: supplier.companyName || 'Unknown Supplier',
            location,
            email: supplier.contact?.salesEmail,
            slug: supplier.slug || supplier._id.toString(),
            verificationScore: supplier.verificationScore
          }
        }
      })

      // Sort: by tier ascending (1 = best), then within tier by verification score descending
      // Within Tier 1, also prioritize organic if the search requested it
      results.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier
        if (modifiers.organic && a.isOrganic !== b.isOrganic) return a.isOrganic ? -1 : 1
        const aScore = a.supplier.verificationScore?.score || 0
        const bScore = b.supplier.verificationScore?.score || 0
        return bScore - aScore
      })

      return {
        results: results.slice(0, Math.min(Number(limit), 20)),
        count: results.length,
        query: q
      }

    } catch (error: any) {
      console.error('❌ Error searching suppliers:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to search suppliers',
        details: error.message
      })
    }
  })

  // Public route - Get suppliers for directory
  fastify.get('/suppliers', async (request, reply) => {
    try {
      const db = database.getDb()

      const suppliers = await db.collection('supplierDirectory').find({}).toArray()

      const supplierProfiles = suppliers.map(supplier => {
        const embeddedProducts: any[] = supplier.products || []

        // Get unique commodity names for the directory listing
        const products = [...new Set(
          embeddedProducts.map((p: any) => {
            const name = p.commodity || ''
            return name.charAt(0).toUpperCase() + name.slice(1)
          }).filter(Boolean)
        )]

        // Certifications: use stored array, add USDA Organic if any product is organic
        const certifications: string[] = [...(supplier.certifications || [])]
        const hasOrganic = embeddedProducts.some((p: any) => p.isOrganic)
        if (hasOrganic && !certifications.includes('USDA Organic')) {
          certifications.push('USDA Organic')
        }

        return {
          id: supplier._id.toString(),
          slug: supplier.slug,
          companyName: supplier.companyName || 'Unknown Company',
          location: supplier.location || { city: null, state: null, full: 'Unknown Location' },
          products,
          certifications,
          claimed: supplier.claimed !== false,
          email: supplier.contact?.salesEmail,
          dataSources: supplier.dataSources,
          verificationScore: supplier.verificationScore || { score: 0, maxScore: 34, percentage: 0 }
        }
      })

      // Sort: claimed first, then by company name
      supplierProfiles.sort((a, b) => {
        if (a.claimed !== b.claimed) return b.claimed ? 1 : -1
        return a.companyName.localeCompare(b.companyName)
      })

      return {
        suppliers: supplierProfiles,
        count: supplierProfiles.length
      }

    } catch (error: any) {
      console.error('❌ Error fetching suppliers:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch suppliers',
        details: error.message
      })
    }
  })

  // AI-friendly search endpoint (must come before /:slug route)
  fastify.get('/suppliers/search', async (request, reply) => {
    const {
      commodity,
      organic,
      region,
      state,
      scale,
      seasonality,
      volume,
      priceRange,
      tags,
      limit = 20
    } = request.query as {
      commodity?: string
      organic?: string
      region?: string
      state?: string
      scale?: string
      seasonality?: string
      volume?: string
      priceRange?: string
      tags?: string
      limit?: number
    }

    try {
      const db = database.getDb()

      // Build query against supplierDirectory with embedded products
      const supplierQuery: any = {}

      if (state) {
        supplierQuery['location.state'] = { $regex: `^${state}$`, $options: 'i' }
      }
      if (region) {
        supplierQuery['location.region'] = { $regex: region, $options: 'i' }
      }
      if (scale) {
        supplierQuery.scale = scale
      }

      // Product-level filters via $elemMatch
      const productFilter: any = {}
      if (commodity) productFilter.commodity = { $regex: commodity, $options: 'i' }
      if (organic === 'true') productFilter.isOrganic = true
      if (organic === 'false') productFilter.isOrganic = false
      if (seasonality) productFilter['seasonality.type'] = seasonality
      if (volume) productFilter.volume = volume
      if (priceRange) productFilter.priceRange = priceRange
      if (tags) productFilter.tags = { $in: tags.split(',').map((t: string) => t.trim()) }

      if (Object.keys(productFilter).length > 0) {
        supplierQuery.products = { $elemMatch: productFilter }
      }

      const suppliers = await db.collection('supplierDirectory')
        .find(supplierQuery)
        .limit(parseInt(limit as any) || 20)
        .toArray()

      const results = suppliers.map(supplier => {
        const embeddedProducts: any[] = supplier.products || []
        return {
          id: supplier._id.toString(),
          slug: supplier.slug,
          companyName: supplier.companyName || 'Unknown Company',
          location: supplier.location || { full: 'Unknown' },
          commodities: [...new Set(embeddedProducts.map((p: any) => p.commodity).filter(Boolean))],
          products: embeddedProducts.map((p: any) => ({
            commodity: p.commodity,
            varieties: p.varieties || [],
            isOrganic: p.isOrganic,
            seasonality: p.seasonality,
            volume: p.volume,
            priceRange: p.priceRange,
            tags: p.tags
          })),
          scale: supplier.scale,
          claimed: supplier.claimed !== false,
          certifications: supplier.certifications || [],
          website: supplier.contact?.website || supplier.website,
          phone: supplier.contact?.phone
        }
      })

      return {
        results,
        count: results.length,
        filters: { commodity, organic, region, state, scale, seasonality, volume, priceRange, tags },
        suggestions: {
          availableFilters: [
            'organic (true/false)',
            'scale (small/medium/large)',
            'seasonality (year-round/seasonal)',
            'priceRange (budget/standard/premium)',
            'volume (small/medium/large)',
            'state (CA/FL/TX/AZ/WA)',
            'region (e.g., central-valley, ventura-county, fresno-county)'
          ],
          clarifyingQuestions: [
            'Would you like organic suppliers only?',
            'Do you need year-round availability?',
            'What scale of operation? (small farm, medium, large commercial)',
            'What price range fits your budget?',
            'Any specific region preference?'
          ]
        }
      }

    } catch (error: any) {
      console.error('❌ Error in supplier search:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to search suppliers',
        details: error.message
      })
    }
  })

  // Public route - Get single supplier by slug
  fastify.get('/suppliers/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }

    try {
      const db = database.getDb()

      const supplier = await db.collection('supplierDirectory').findOne({ slug })

      if (!supplier) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Supplier not found'
        })
      }

      const embeddedProducts: any[] = supplier.products || []

      // Map embedded products to the shape the profile page expects
      const products = embeddedProducts.map((p: any) => {
        const commodity = p.commodity || ''
        const seasonalityStr = typeof p.seasonality === 'string'
          ? p.seasonality
          : p.seasonality?.description || 'Year-round'

        return {
          commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
          varieties: p.varieties || [],
          isOrganic: p.isOrganic || false,
          seasonality: seasonalityStr,
          volume: p.volume,
          priceRange: p.priceRange,
          minimumOrder: p.minimumOrder || null,
          typicalLotSizes: p.typicalLotSizes || [],
          packaging: p.packaging || []
        }
      })

      // Certifications
      const certifications: string[] = [...(supplier.certifications || [])]
      const hasOrganic = embeddedProducts.some((p: any) => p.isOrganic)
      if (hasOrganic && !certifications.includes('USDA Organic')) {
        certifications.push('USDA Organic')
      }

      return {
        supplier: {
          id: supplier._id.toString(),
          slug: supplier.slug,
          companyName: supplier.companyName || 'Unknown Company',
          claimed: supplier.claimed !== false,
          location: supplier.location || { full: 'Unknown Location' },
          contact: {
            email: supplier.contact?.salesEmail,
            phone: supplier.contact?.phone,
            website: supplier.contact?.website || supplier.website
          },
          products,
          certifications,
          description: supplier.description,
          dataSources: supplier.dataSources || {},
          verificationScore: supplier.verificationScore || { score: 0, maxScore: 34, percentage: 0 }
        }
      }

    } catch (error: any) {
      console.error('❌ Error fetching supplier profile:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch supplier profile',
        details: error.message
      })
    }
  })
}

export default publicRoutes

