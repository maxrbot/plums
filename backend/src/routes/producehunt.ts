import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'

// Normalize company name for fuzzy matching: lowercase, strip punctuation, collapse spaces
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

// Extract root domain from a URL or email domain string
function extractDomain(input: string | undefined | null): string | null {
  if (!input) return null
  try {
    const s = input.trim().toLowerCase()
    // If it looks like a URL, parse it
    const withProto = s.startsWith('http') ? s : `https://${s}`
    const hostname = new URL(withProto).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const produceHuntRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  // Step 1 — Detect matching supplierDirectory entries for this AcreList user
  fastify.get('/listing/lookup', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    try {
      const db = database.getDb()
      const user = await db.collection('users').findOne({ id: userId })

      if (!user) return reply.status(404).send({ error: 'User not found' })

      const companyName = user.profile?.companyName || ''
      if (!companyName) {
        return reply.status(400).send({ error: 'No company name on profile' })
      }

      const normalized = normalizeName(companyName)

      // Find all potential matches — exact normalized match first, then partial
      const allSuppliers = await db.collection('supplierDirectory').find({
        $or: [{ acrelistUserId: null }, { acrelistUserId: { $exists: false } }]
      }).toArray()

      const matches = allSuppliers.filter(s => {
        const sNorm = normalizeName(s.companyName || '')
        return sNorm === normalized || sNorm.includes(normalized) || normalized.includes(sNorm)
      })

      // Check if this user already has a claimed entry (store as string id)
      const existing = await db.collection('supplierDirectory').findOne({
        acrelistUserId: userId
      })

      return {
        matches: matches.map(m => ({
          id: m._id.toString(),
          slug: m.slug,
          companyName: m.companyName,
          location: m.location,
          products: (m.products || []).map((p: any) => p.commodity),
          verificationScore: m.verificationScore,
          certifications: m.certifications || []
        })),
        alreadyClaimed: !!existing,
        claimedEntry: existing ? {
          id: existing._id.toString(),
          slug: existing.slug,
          companyName: existing.companyName
        } : null,
        userCompanyName: companyName
      }

    } catch (error: any) {
      console.error('❌ ProduceHunt detect error:', error)
      return reply.status(500).send({ error: 'Failed to detect matches', details: error.message })
    }
  })

  // Step 2 — Preview: return side-by-side comparison of directory entry vs AcreList user data
  fastify.get('/listing/preview/:directoryId', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id
    const { directoryId } = request.params as { directoryId: string }

    if (!ObjectId.isValid(directoryId)) {
      return reply.status(400).send({ error: 'Invalid directory ID' })
    }

    try {
      const db = database.getDb()
      const [user, directoryEntry] = await Promise.all([
        db.collection('users').findOne({ id: userId }),
        db.collection('supplierDirectory').findOne({ _id: new ObjectId(directoryId) })
      ])

      if (!user) return reply.status(404).send({ error: 'User not found' })
      if (!directoryEntry) return reply.status(404).send({ error: 'Directory entry not found' })
      if (directoryEntry.acrelistUserId) {
        return reply.status(409).send({ error: 'This directory entry is already claimed' })
      }

      // Build AcreList side of the comparison from user profile
      const acrelistData = {
        companyName: user.profile?.companyName || '',
        location: {
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          full: user.profile?.address
            ? `${user.profile.address.city || ''}, ${user.profile.address.state || ''}`.replace(/^,\s*|,\s*$/, '')
            : ''
        },
        contact: {
          salesEmail: user.profile?.email || user.email || '',
          phone: user.profile?.phone || '',
          website: user.profile?.website || ''
        },
        certifications: user.profile?.certifications || []
      }

      // Directory side
      const directoryData = {
        companyName: directoryEntry.companyName || '',
        location: directoryEntry.location || {},
        contact: directoryEntry.contact || {},
        certifications: directoryEntry.certifications || [],
        // These are locked — verified externally, not overridable
        dataSources: directoryEntry.dataSources || {},
        verificationScore: directoryEntry.verificationScore || null,
        products: directoryEntry.products || []
      }

      return {
        directoryId,
        directoryData,
        acrelistData,
        // Locked fields that will always come from the directory
        lockedFields: ['dataSources', 'verificationScore']
      }

    } catch (error: any) {
      console.error('❌ ProduceHunt preview error:', error)
      return reply.status(500).send({ error: 'Failed to generate preview', details: error.message })
    }
  })

  // Step 3 — Confirm: commit the claim with chosen field values
  fastify.post('/listing/link', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    const {
      directoryId,
      // Supplier chooses which value wins for each field (or provides their own)
      companyName,
      location,
      contact,
      certifications
    } = request.body as {
      directoryId: string
      companyName: string
      location: { city?: string; state?: string; full: string }
      contact: { salesEmail?: string; phone?: string; website?: string }
      certifications: string[]
    }

    if (!ObjectId.isValid(directoryId)) {
      return reply.status(400).send({ error: 'Invalid directory ID' })
    }

    try {
      const db = database.getDb()

      // Double-check entry is still unclaimed
      const entry = await db.collection('supplierDirectory').findOne({
        _id: new ObjectId(directoryId)
      })

      if (!entry) return reply.status(404).send({ error: 'Directory entry not found' })
      if (entry.acrelistUserId) {
        return reply.status(409).send({ error: 'Already claimed by another account' })
      }

      // Also check this user hasn't already claimed a different entry
      const existingClaim = await db.collection('supplierDirectory').findOne({
        acrelistUserId: userId
      })
      if (existingClaim) {
        return reply.status(409).send({ error: 'You have already claimed a directory entry' })
      }

      // ── Domain verification ──────────────────────────────────────────────
      const userDoc = await db.collection('users').findOne({ id: userId })
      if (!userDoc) return reply.status(404).send({ error: 'User not found' })

      const emailDomain = userDoc.email?.split('@')[1]?.toLowerCase() || null
      const websiteRaw = entry.website || entry.contact?.website || ''
      const websiteDomain = extractDomain(websiteRaw)

      const domainVerified = !!(emailDomain && websiteDomain && emailDomain === websiteDomain)

      if (!domainVerified) {
        // Create a pending claim request for admin review
        await db.collection('claimRequests').insertOne({
          directoryEntryId: entry._id.toString(),
          userId,
          userEmail: userDoc.email,
          emailDomain,
          websiteDomain,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        return {
          success: true,
          pending: true,
          message: "Your claim is under review. We'll notify you within 24 hours.",
          emailDomain,
          websiteDomain,
        }
      }

      // Sync user's crops into directory products format
      const userCrops = userDoc
        ? await db.collection('cropManagement').find({ userId: userDoc._id }).toArray()
        : []

      const syncedProducts = userCrops.flatMap((crop: any) => {
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
          volume: null,
          priceRange: null,
          tags: [...(isOrganic ? ['organic'] : []), isYearRound ? 'year-round' : 'seasonal'],
          minimumOrder: null,
          typicalLotSizes: [],
          packaging: []
        }]
      })

      // Update the directory entry
      await db.collection('supplierDirectory').updateOne(
        { _id: new ObjectId(directoryId) },
        {
          $set: {
            acrelistUserId: userId,
            claimed: true,
            claimedAt: new Date(),
            companyName,
            location,
            contact,
            certifications,
            products: syncedProducts,
            'dataSources.acrelist': { verified: true, score: 2 },
            updatedAt: new Date()
          }
        }
      )

      // Mark opt-in on the user document
      await db.collection('users').updateOne(
        { id: userId },
        {
          $set: {
            'integrations.producehunt': true,
            updatedAt: new Date()
          }
        }
      )

      // Sync pipeline entry status to 'claimed' (fire-and-forget)
      db.collection('directoryPipeline').updateOne(
        { supplierDirectoryId: entry._id.toString() },
        { $set: { status: 'claimed', updatedAt: new Date() } }
      ).catch(() => {})

      return {
        success: true,
        slug: entry.slug,
        message: 'Successfully joined ProduceHunt directory'
      }

    } catch (error: any) {
      console.error('❌ ProduceHunt confirm error:', error)
      return reply.status(500).send({ error: 'Failed to confirm claim', details: error.message })
    }
  })

  // GET /listing/me — full listing data for the PEO dashboard
  fastify.get('/listing/me', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    try {
      const db = database.getDb()

      const [entry, userDoc] = await Promise.all([
        db.collection('supplierDirectory').findOne({ acrelistUserId: userId }),
        db.collection('users').findOne({ id: userId }, { projection: { email: 1 } })
      ])
      if (!entry) return { listing: null, pendingClaim: null }

      // Check for searchable price sheets (determines tier 1 vs 2)
      const userObjId = (() => { try { return new (require('mongodb').ObjectId)(userId) } catch { return null } })()
      const searchableSheets = userObjId
        ? await db.collection('priceSheets').countDocuments({ userId: userObjId, searchable: true })
        : 0

      // Pending claim requests for this user
      const pendingClaim = await db.collection('claimRequests').findOne(
        { userId, status: 'pending' },
        { sort: { createdAt: -1 } }
      )

      const tier = searchableSheets > 0 ? 1 : 2

      return {
        listing: {
          id: entry._id.toString(),
          slug: entry.slug,
          companyName: entry.companyName,
          location: entry.location,
          products: (entry.products || []).map((p: any) => p.commodity),
          claimed: !!entry.claimed,
          listed: entry.listed !== false,
          verificationScore: entry.verificationScore || null,
          certifications: entry.certifications || [],
          contact: entry.contact || {},
          dataSources: entry.dataSources || {},
          tier,
          searchableSheets,
          claimedAt: entry.claimedAt || null,
          managedBy: userDoc?.email || null,
        },
        pendingClaim: pendingClaim ? {
          id: pendingClaim._id.toString(),
          status: pendingClaim.status,
          createdAt: pendingClaim.createdAt,
          emailDomain: pendingClaim.emailDomain,
          websiteDomain: pendingClaim.websiteDomain,
        } : null,
      }
    } catch (error: any) {
      return reply.status(500).send({ error: 'Failed to load listing', details: error.message })
    }
  })

  // Delist — hides from search but keeps the claim (listed: false, claimed stays true)
  fastify.delete('/listing', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    try {
      const db = database.getDb()

      await db.collection('supplierDirectory').updateOne(
        { acrelistUserId: userId },
        { $set: { listed: false, updatedAt: new Date() } }
      )

      await db.collection('users').updateOne(
        { id: userId },
        { $set: { 'integrations.producehunt': false, updatedAt: new Date() } }
      )

      return { success: true, message: 'Delisted from ProduceHunt search' }

    } catch (error: any) {
      console.error('❌ ProduceHunt delist error:', error)
      return reply.status(500).send({ error: 'Failed to delist', details: error.message })
    }
  })

  // Relist — re-enables search visibility for a delisted (but still claimed) entry
  fastify.post('/listing/relist', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    try {
      const db = database.getDb()

      const entry = await db.collection('supplierDirectory').findOne({ acrelistUserId: userId })
      if (!entry) return reply.status(404).send({ error: 'No claimed listing found' })

      await db.collection('supplierDirectory').updateOne(
        { acrelistUserId: userId },
        { $set: { listed: true, updatedAt: new Date() } }
      )

      await db.collection('users').updateOne(
        { id: userId },
        { $set: { 'integrations.producehunt': true, updatedAt: new Date() } }
      )

      return { success: true, message: 'Relisted on ProduceHunt' }

    } catch (error: any) {
      console.error('❌ ProduceHunt relist error:', error)
      return reply.status(500).send({ error: 'Failed to relist', details: error.message })
    }
  })
}

export default produceHuntRoutes
