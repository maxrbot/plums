import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'

// Normalize company name for fuzzy matching: lowercase, strip punctuation, collapse spaces
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

const produceHuntRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  // Step 1 — Detect matching supplierDirectory entries for this AcreList user
  fastify.get('/claim/detect', async (request, reply) => {
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
        acrelistUserId: null // Only unclaimed entries
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
  fastify.get('/claim/preview/:directoryId', async (request, reply) => {
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
  fastify.post('/claim/confirm', async (request, reply) => {
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

      // Sync user's crops into directory products format
      const userDoc = await db.collection('users').findOne({ id: userId })
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

  // Opt-out — removes the claim link
  fastify.delete('/claim', async (request, reply) => {
    const req = request as AuthenticatedRequest
    const userId = req.user.id

    try {
      const db = database.getDb()

      await db.collection('supplierDirectory').updateOne(
        { acrelistUserId: userId },
        {
          $set: {
            acrelistUserId: null,
            claimed: false,
            'dataSources.acrelist': { verified: false, score: 0 },
            updatedAt: new Date()
          }
        }
      )

      await db.collection('users').updateOne(
        { id: userId },
        { $set: { 'integrations.producehunt': false, updatedAt: new Date() } }
      )

      return { success: true, message: 'Removed from ProduceHunt directory' }

    } catch (error: any) {
      console.error('❌ ProduceHunt opt-out error:', error)
      return reply.status(500).send({ error: 'Failed to opt out', details: error.message })
    }
  })
}

export default produceHuntRoutes
