import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  fastify.addHook('onRequest', authenticate)
  
  // Get analytics overview
  fastify.get('/overview', async (request, reply) => {
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
      
      // Get date range (last 30 days by default)
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = endDate ? new Date(endDate) : new Date()
      
      // Get all sent emails in date range
      const sentEmails = await db.collection('sentEmails')
        .find({
          userId: userDoc._id,
          sentAt: { $gte: start, $lte: end }
        })
        .sort({ sentAt: -1 })
        .toArray()
      
      // Get unique price sheet IDs
      const priceSheetIds = [...new Set(sentEmails.map(email => email.priceSheetId.toString()))]
      
      // Get price sheet details
      const priceSheets = await db.collection('priceSheets')
        .find({
          _id: { $in: sentEmails.map(email => email.priceSheetId) }
        })
        .toArray()
      
      const priceSheetMap = new Map(priceSheets.map(ps => [ps._id.toString(), ps]))
      
      // Get all contacts
      const contactIds = [...new Set(sentEmails.map(email => email.contactId))]
      const contacts = await db.collection('contacts')
        .find({
          _id: { $in: contactIds }
        })
        .toArray()
      
      const contactMap = new Map(contacts.map(c => [c._id.toString(), c]))
      
      // Get view stats for each sent email
      const viewStats = await db.collection('priceSheetViews')
        .aggregate([
          {
            $match: {
              priceSheetId: { $in: sentEmails.map(email => email.priceSheetId) },
              viewedAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                priceSheetId: '$priceSheetId',
                contactEmail: '$contactEmail'
              },
              viewCount: { $sum: 1 },
              lastViewedAt: { $max: '$viewedAt' },
              firstViewedAt: { $min: '$viewedAt' }
            }
          }
        ])
        .toArray()
      
      // Build view map: priceSheetId -> contactEmail -> stats
      const viewMap = new Map()
      for (const stat of viewStats) {
        const psId = stat._id.priceSheetId.toString()
        if (!viewMap.has(psId)) {
          viewMap.set(psId, new Map())
        }
        // Use contactEmail to match views to contacts
        viewMap.get(psId).set(stat._id.contactEmail, {
          viewCount: stat.viewCount,
          lastViewedAt: stat.lastViewedAt,
          firstViewedAt: stat.firstViewedAt
        })
      }
      
      // Group sent emails by price sheet
      const priceSheetSends = new Map()
      
      for (const email of sentEmails) {
        const psId = email.priceSheetId.toString()
        if (!priceSheetSends.has(psId)) {
          priceSheetSends.set(psId, {
            priceSheetId: psId,
            priceSheet: priceSheetMap.get(psId),
            sends: [],
            totalRecipients: 0,
            sheetViews: 0,
            lastSentAt: email.sentAt
          })
        }
        
        const priceSheetData = priceSheetSends.get(psId)
        
        // Update lastSentAt to the most recent send
        if (email.sentAt > priceSheetData.lastSentAt) {
          priceSheetData.lastSentAt = email.sentAt
        }
        
        const contact = contactMap.get(email.contactId.toString())
        const contactViews = viewMap.get(psId)?.get(email.contactEmail) || { viewCount: 0 }
        
        priceSheetData.sends.push({
          emailId: email._id,
          contact: contact ? {
            id: contact._id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            company: contact.company,
            email: contact.email
          } : null,
          sentAt: email.sentAt,
          sheetViews: contactViews.viewCount,
          lastViewedAt: contactViews.lastViewedAt,
          contactHash: email.contactHash // Include hash for preview URLs
        })
        
        priceSheetData.totalRecipients++
        priceSheetData.sheetViews += contactViews.viewCount
      }
      
      // Convert to array and calculate percentages
      const analytics = Array.from(priceSheetSends.values()).map(ps => ({
        ...ps,
        viewRate: ps.totalRecipients > 0 ? Math.round((ps.sheetViews / ps.totalRecipients) * 100) : 0,
        avgViewsPerRecipient: ps.totalRecipients > 0 ? (ps.sheetViews / ps.totalRecipients).toFixed(1) : '0.0'
      }))
      
      // Calculate summary metrics
      const totalSends = sentEmails.length
      const totalSheetViews = analytics.reduce((sum, ps) => sum + ps.sheetViews, 0)
      const uniqueViewers = new Set(
        viewStats.map(stat => stat._id.contactEmail)
      ).size
      
      return {
        summary: {
          totalSends,
          totalSheetViews,
          viewRate: totalSends > 0 ? Math.round((totalSheetViews / totalSends) * 100) : 0,
          uniqueViewers,
          dateRange: {
            start,
            end
          }
        },
        priceSheets: analytics
      }
      
    } catch (error) {
      console.error('Analytics overview error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch analytics'
      })
    }
  })

  // Get contact engagement insights (all-time)
  fastify.get('/contacts', async (request, reply) => {
    const { user } = request as AuthenticatedRequest

    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      if (!userDoc) return reply.status(404).send({ error: 'User Not Found', message: 'User not found' })

      // All sent emails for this user (all time)
      const allSentEmails = await db.collection('sentEmails')
        .find({ userId: userDoc._id, success: true })
        .sort({ sentAt: -1 })
        .toArray()

      // All contacts for this user
      const allContacts = await db.collection('contacts')
        .find({ userId: userDoc._id })
        .toArray()
      const contactMap = new Map(allContacts.map(c => [c._id.toString(), c]))

      // All view stats grouped by contactEmail (all-time)
      const viewStats = await db.collection('priceSheetViews')
        .aggregate([
          { $match: { userId: userDoc._id } },
          {
            $group: {
              _id: '$contactEmail',
              totalViews: { $sum: 1 },
              lastViewedAt: { $max: '$viewedAt' }
            }
          }
        ])
        .toArray()
      const viewsByEmail = new Map(viewStats.map((v: any) => [v._id, { totalViews: v.totalViews, lastViewedAt: v.lastViewedAt }]))

      // Per-contact send stats
      const contactSendMap = new Map<string, { totalSends: number; lastSentAt: Date; contactId: string; contactEmail: string }>()
      for (const email of allSentEmails) {
        const cid = email.contactId.toString()
        if (!contactSendMap.has(cid)) {
          contactSendMap.set(cid, { totalSends: 0, lastSentAt: email.sentAt, contactId: cid, contactEmail: email.contactEmail })
        }
        const entry = contactSendMap.get(cid)!
        entry.totalSends++
        if (email.sentAt > entry.lastSentAt) entry.lastSentAt = email.sentAt
      }

      // Build enriched contact stats
      const contactStats = Array.from(contactSendMap.values()).map(entry => {
        const contact = contactMap.get(entry.contactId)
        const views = viewsByEmail.get(entry.contactEmail) || { totalViews: 0, lastViewedAt: null }
        const daysSinceLastSend = Math.floor((Date.now() - new Date(entry.lastSentAt).getTime()) / 86400000)
        return {
          contactId: entry.contactId,
          firstName: contact?.firstName || '',
          lastName: contact?.lastName || '',
          company: contact?.company || entry.contactEmail,
          email: entry.contactEmail,
          totalSends: entry.totalSends,
          totalViews: views.totalViews,
          openRate: entry.totalSends > 0 ? Math.round((views.totalViews / entry.totalSends) * 100) : 0,
          lastViewedAt: views.lastViewedAt,
          lastSentAt: entry.lastSentAt,
          daysSinceLastSend
        }
      })

      // Top 8 by total views
      const topEngaged = [...contactStats]
        .filter(c => c.totalViews > 0)
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 8)

      // Re-engagement: sent at least once, not sent in 30+ days
      const needsReEngagement = [...contactStats]
        .filter(c => c.daysSinceLastSend >= 30)
        .sort((a, b) => b.daysSinceLastSend - a.daysSinceLastSend)
        .slice(0, 8)

      // Pricing distribution from contacts collection
      const totalContacted = contactSendMap.size
      const customPricingCount = allContacts.filter(c =>
        (c.pricesheetSettings?.globalAdjustment || 0) !== 0 || (c.pricesheetSettings?.cropAdjustments || []).length > 0
      ).length
      const cropFilterCount = allContacts.filter(c => (c.primaryCrops || []).length > 0).length
      const discounts = allContacts
        .map(c => c.pricesheetSettings?.globalAdjustment || 0)
        .filter(a => a !== 0)
      const avgGlobalAdjustment = discounts.length > 0
        ? Math.round((discounts.reduce((s, a) => s + a, 0) / discounts.length) * 10) / 10
        : 0

      return {
        topEngaged,
        needsReEngagement,
        pricingDistribution: {
          totalContacted,
          standardCount: totalContacted - customPricingCount,
          customPricingCount,
          cropFilterCount,
          avgGlobalAdjustment
        }
      }

    } catch (error) {
      console.error('Analytics contacts error:', error)
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to fetch contact insights' })
    }
  })
}

