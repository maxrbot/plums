import { FastifyPluginAsync } from 'fastify'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import database from '../config/database'
import { User, DirectoryPipeline, SupplierDirectory } from '../models/types'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add authentication to all admin routes
  fastify.addHook('preHandler', authenticate)
  
  // Middleware to check if user is admin
  const requireAdmin = async (request: AuthenticatedRequest, reply: any) => {
    if (request.user.subscriptionTier !== 'admin') {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required'
      })
    }
  }
  
  // Get all users (admin only)
  fastify.get('/users', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    const db = database.getDb()
    
    // Get all users with their data counts
    const users = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'cropManagement',
          localField: '_id',
          foreignField: 'userId',
          as: 'crops'
        }
      },
      {
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: 'userId',
          as: 'contacts'
        }
      },
      {
        $lookup: {
          from: 'shippingPoints',
          localField: '_id',
          foreignField: 'userId',
          as: 'shippingPoints'
        }
      },
      {
        $lookup: {
          from: 'priceSheets',
          localField: '_id',
          foreignField: 'userId',
          as: 'priceSheets'
        }
      },
      {
        $lookup: {
          from: 'sentEmails',
          localField: '_id',
          foreignField: 'userId',
          as: 'sentEmails'
        }
      },
      {
        $addFields: {
          cropCount: { $size: '$crops' },
          contactCount: { $size: '$contacts' },
          shippingPointCount: { $size: '$shippingPoints' },
          priceSheetCount: { $size: '$priceSheets' },
          emailsSentCount: { $size: '$sentEmails' },
          lastActivity: {
            $max: [
              { $ifNull: [{ $max: '$priceSheets.createdAt' }, new Date(0)] },
              { $ifNull: [{ $max: '$sentEmails.sentAt' }, new Date(0)] }
            ]
          }
        }
      },
      {
        $project: {
          // Only include what we need (can't mix 0 and 1 in same projection)
          _id: 1,
          id: 1,
          email: 1,
          profile: 1,
          subscriptionTier: 1,
          role: 1,
          orgId: 1,
          createdAt: 1,
          lastSeenAt: 1,
          cropCount: 1,
          contactCount: 1,
          shippingPointCount: 1,
          priceSheetCount: 1,
          emailsSentCount: 1,
          lastActivity: 1,
          'integrations.producehunt': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()

    // Attach ProduceHunt listing status (claimed/listed) — matched by acrelistUserId (string)
    const userIds = users.map((u: any) => u.id).filter(Boolean)
    const dirEntries = userIds.length
      ? await db.collection('supplierDirectory')
          .find({ acrelistUserId: { $in: userIds } }, { projection: { acrelistUserId: 1, claimed: 1, listed: 1 } })
          .toArray()
      : []
    const dirMap: Record<string, { claimed: boolean; listed: boolean }> = {}
    for (const e of dirEntries) {
      if (e.acrelistUserId) dirMap[e.acrelistUserId] = { claimed: !!e.claimed, listed: e.listed !== false }
    }

    const usersWithPh = users.map((u: any) => ({
      ...u,
      phStatus: dirMap[u.id] || null  // null = not joined; { claimed, listed } = joined
    }))

    return { users: usersWithPh }
  })
  
  // Get specific user details (admin only)
  fastify.get('/users/:userId', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    const db = database.getDb()
    const { userId } = request.params as { userId: string }
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return { error: 'User not found' }
    }
    
    // Get user's data
    const crops = await db.collection('crops').find({ userId: new ObjectId(userId) }).toArray()
    const contacts = await db.collection('contacts').find({ userId: new ObjectId(userId) }).toArray()
    const priceSheets = await db.collection('priceSheets').find({ userId: new ObjectId(userId) }).toArray()
    const sentEmails = await db.collection('sentEmails').find({ userId: new ObjectId(userId) }).sort({ sentAt: -1 }).limit(20).toArray()
    
    return {
      user,
      stats: {
        crops: crops.length,
        contacts: contacts.length,
        priceSheets: priceSheets.length,
        emailsSent: sentEmails.length
      },
      recentActivity: {
        sentEmails: sentEmails.map(e => ({
          id: e._id,
          priceSheetId: e.priceSheetId,
          contactEmail: e.contactEmail,
          sentAt: e.sentAt,
          opened: e.opened,
          clicked: e.clicked
        }))
      }
    }
  })
  
  // Impersonate user (admin only)
  fastify.post('/impersonate/:userId', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return
    
    const db = database.getDb()
    const { userId } = request.params as { userId: string }
    
    // Get target user
    const targetUser = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) })
    
    if (!targetUser) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      })
    }
    
    // Generate impersonation token
    const impersonationToken = jwt.sign(
      {
        userId: targetUser.id,
        email: targetUser.email,
        impersonatedBy: authRequest.user.id,
        isImpersonation: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    )
    
    // Log the impersonation
    await db.collection('adminLogs').insertOne({
      adminId: authRequest.user.id,
      adminEmail: authRequest.user.email,
      action: 'impersonate',
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      timestamp: new Date()
    })
    
    return {
      message: 'Impersonation token generated',
      accessToken: impersonationToken,
      refreshToken: impersonationToken, // Same token for simplicity
      user: {
        id: targetUser.id,
        email: targetUser.email,
        subscriptionTier: targetUser.subscriptionTier,
        profile: targetUser.profile,
        isImpersonation: true,
        impersonatedBy: authRequest.user.email
      }
    }
  })
  
  // Get admin activity logs
  fastify.get('/logs', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const db = database.getDb()

    const logs = await db.collection('adminLogs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()

    return { logs }
  })

  // GET /admin/summary — high-level stats for the overview page
  fastify.get('/summary', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const db = database.getDb()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeThisWeek,
      activeToday,
      totalOrgs,
      totalPriceSheets,
      totalEmailsSent,
      totalContacts,
      newUsersThisWeek,
      directoryTotal,
      directoryClaimed,
      pipelinePending,
      pipelinePushed,
      pipelineClaimed,
    ] = await Promise.all([
      db.collection('users').countDocuments({ subscriptionTier: { $ne: 'admin' } }),
      db.collection('users').countDocuments({ lastSeenAt: { $gte: sevenDaysAgo }, subscriptionTier: { $ne: 'admin' } }),
      db.collection('users').countDocuments({ lastSeenAt: { $gte: oneDayAgo }, subscriptionTier: { $ne: 'admin' } }),
      db.collection('organizations').countDocuments(),
      db.collection('priceSheets').countDocuments(),
      db.collection('sentEmails').countDocuments(),
      db.collection('contacts').countDocuments(),
      db.collection('users').countDocuments({ createdAt: { $gte: sevenDaysAgo }, subscriptionTier: { $ne: 'admin' } }),
      db.collection('supplierDirectory').countDocuments(),
      db.collection('supplierDirectory').countDocuments({ claimed: true }),
      db.collection('directoryPipeline').countDocuments({ status: 'pending' }),
      db.collection('directoryPipeline').countDocuments({ status: 'pushed' }),
      db.collection('directoryPipeline').countDocuments({ status: 'claimed' }),
    ])

    // Recent signups (last 5)
    const recentSignups = await db.collection('users')
      .find({ subscriptionTier: { $ne: 'admin' } }, { projection: { email: 1, profile: 1, createdAt: 1, role: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return {
      acrelist: { totalUsers, activeToday, activeThisWeek, newUsersThisWeek, totalOrgs, totalPriceSheets, totalEmailsSent, totalContacts },
      producehunt: { directoryTotal, directoryClaimed, directoryUnclaimed: directoryTotal - directoryClaimed, pipelinePending, pipelinePushed, pipelineClaimed },
      recentSignups,
    }
  })

  // ── ProduceHunt Directory (live supplierDirectory) ────────────────────────

  // GET /admin/directory — all live supplier entries with claim info
  fastify.get('/directory', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const db = database.getDb()
    const entries = await db.collection('supplierDirectory')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // For claimed entries, attach the AcreList user's email
    const claimedUserIds = entries
      .filter(e => e.claimed && e.acrelistUserId)
      .map(e => e.acrelistUserId)

    const claimedUsers = claimedUserIds.length
      ? await db.collection('users')
          .find({ id: { $in: claimedUserIds } }, { projection: { id: 1, email: 1, profile: 1, lastSeenAt: 1 } })
          .toArray()
      : []
    const userMap = Object.fromEntries(claimedUsers.map(u => [u.id, u]))

    return {
      entries: entries.map(e => ({
        id: e._id.toString(),
        slug: e.slug,
        companyName: e.companyName,
        location: e.location,
        website: e.website || e.contact?.website || null,
        contactEmail: e.contact?.salesEmail || null,
        brandStory: e.brandStory || null,
        yearEstablished: e.yearEstablished || e.dataSources?.established?.yearEstablished || null,
        products: e.products || [],
        certifications: e.certifications || [],
        claimed: !!e.claimed,
        listed: e.listed !== false,
        acrelistUserId: e.acrelistUserId || null,
        claimedBy: e.acrelistUserId ? userMap[e.acrelistUserId] || null : null,
        verificationScore: e.verificationScore || null,
        importSource: e.importSource || null,
        operationScale: e.operationScale || null,
        certifiedAcres: e.certifiedAcres || null,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    }
  })

  // PUT /admin/directory/:id — update a live directory entry
  fastify.put('/directory/:id', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const body = request.body as any
    const db = database.getDb()

    const update: Record<string, any> = { updatedAt: new Date() }
    if (body.companyName !== undefined) update.companyName = body.companyName
    if (body.location !== undefined) update.location = body.location
    if (body.website !== undefined) { update.website = body.website; update['contact.website'] = body.website }
    if (body.contactEmail !== undefined) update['contact.salesEmail'] = body.contactEmail
    if (body.brandStory !== undefined) update.brandStory = body.brandStory || undefined
    if (body.yearEstablished !== undefined) update.yearEstablished = body.yearEstablished || undefined
    if (body.products !== undefined) update.products = body.products
    if (body.certifications !== undefined) update.certifications = body.certifications
    if (body.listed !== undefined) update.listed = body.listed
    if (body.operationScale !== undefined) update.operationScale = body.operationScale || undefined

    await db.collection('supplierDirectory').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )
    return { ok: true }
  })

  // DELETE /admin/directory/:id — remove a listing from the live directory
  fastify.delete('/directory/:id', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const db = database.getDb()

    await db.collection('supplierDirectory').deleteOne({ _id: new ObjectId(id) })

    // Reset any matching pipeline entry back to pending
    await db.collection('directoryPipeline').updateOne(
      { supplierDirectoryId: id },
      { $set: { status: 'pending', supplierDirectoryId: undefined, pushedAt: undefined, updatedAt: new Date() } }
    )

    return { ok: true }
  })

  // ── Claim Requests ─────────────────────────────────────────────────────────

  // GET /admin/claim-requests — all pending domain-unverified claims
  fastify.get('/claim-requests', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const db = database.getDb()
    const requests = await db.collection('claimRequests')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Attach directory entry names
    const entryIds = requests.map(r => r.directoryEntryId).filter(Boolean)
    const entries = entryIds.length
      ? await db.collection('supplierDirectory')
          .find({ _id: { $in: entryIds.map((id: string) => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } })
          .toArray()
      : []
    const entryMap = Object.fromEntries(entries.map(e => [e._id.toString(), e]))

    return {
      requests: requests.map(r => ({
        id: r._id.toString(),
        directoryEntryId: r.directoryEntryId,
        companyName: entryMap[r.directoryEntryId]?.companyName || '—',
        location: entryMap[r.directoryEntryId]?.location?.full || '',
        userId: r.userId,
        userEmail: r.userEmail,
        emailDomain: r.emailDomain,
        websiteDomain: r.websiteDomain,
        status: r.status,
        createdAt: r.createdAt,
        reviewNote: r.reviewNote,
      }))
    }
  })

  // POST /admin/claim-requests/:id/approve — approve a pending claim
  fastify.post('/claim-requests/:id/approve', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const { note } = (request.body as any) || {}
    const db = database.getDb()

    const claimReq = await db.collection('claimRequests').findOne({ _id: new ObjectId(id) })
    if (!claimReq) return reply.status(404).send({ error: 'Claim request not found' })
    if (claimReq.status !== 'pending') return reply.status(400).send({ error: 'Already reviewed' })

    const entry = await db.collection('supplierDirectory').findOne({ _id: new ObjectId(claimReq.directoryEntryId) })
    if (!entry) return reply.status(404).send({ error: 'Directory entry not found' })

    // Apply the claim
    await db.collection('supplierDirectory').updateOne(
      { _id: new ObjectId(claimReq.directoryEntryId) },
      {
        $set: {
          acrelistUserId: claimReq.userId,
          claimed: true,
          'dataSources.acrelist': { verified: true, score: 2 },
          updatedAt: new Date(),
        }
      }
    )

    await db.collection('users').updateOne(
      { id: claimReq.userId },
      { $set: { 'integrations.producehunt': true, updatedAt: new Date() } }
    )

    // Sync pipeline entry
    db.collection('directoryPipeline').updateOne(
      { supplierDirectoryId: claimReq.directoryEntryId },
      { $set: { status: 'claimed', updatedAt: new Date() } }
    ).catch(() => {})

    await db.collection('claimRequests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'approved', reviewedAt: new Date(), reviewedBy: authRequest.user.id, reviewNote: note || '', updatedAt: new Date() } }
    )

    return { ok: true }
  })

  // POST /admin/claim-requests/:id/deny — deny a pending claim
  fastify.post('/claim-requests/:id/deny', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const { note } = (request.body as any) || {}
    const db = database.getDb()

    await db.collection('claimRequests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'denied', reviewedAt: new Date(), reviewedBy: (request as AuthenticatedRequest).user.id, reviewNote: note || '', updatedAt: new Date() } }
    )

    return { ok: true }
  })

  // ── Directory Pipeline ─────────────────────────────────────────────────────

  // GET /admin/directory-pipeline — list all entries
  fastify.get('/directory-pipeline', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const db = database.getDb()
    const entries = await db.collection<DirectoryPipeline>('directoryPipeline')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return { entries }
  })

  // POST /admin/directory-pipeline — add a new entry
  fastify.post('/directory-pipeline', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const body = request.body as Partial<DirectoryPipeline>
    if (!body.companyName) return reply.status(400).send({ error: 'companyName required' })

    const db = database.getDb()
    const entry: Omit<DirectoryPipeline, '_id'> = {
      companyName: body.companyName.trim(),
      location: {
        city: body.location?.city?.trim(),
        state: body.location?.state?.trim(),
        full: body.location?.full?.trim() || [body.location?.city, body.location?.state].filter(Boolean).join(', '),
      },
      commodities: body.commodities || [],
      organic: body.organic ?? null,
      size: body.size || undefined,
      type: body.type || undefined,
      website: body.website?.trim() || undefined,
      contactEmail: body.contactEmail?.trim() || undefined,
      contactName: body.contactName?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      status: 'pending',
      outreachSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<DirectoryPipeline>('directoryPipeline').insertOne(entry as any)
    return { _id: result.insertedId, ...entry }
  })

  // PUT /admin/directory-pipeline/:id — update an entry
  fastify.put('/directory-pipeline/:id', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const body = request.body as Partial<DirectoryPipeline>

    const db = database.getDb()
    const update: any = { updatedAt: new Date() }
    if (body.companyName !== undefined) update.companyName = body.companyName.trim()
    if (body.location !== undefined) {
      update.location = {
        city: body.location.city?.trim(),
        state: body.location.state?.trim(),
        full: body.location.full?.trim() || [body.location.city, body.location.state].filter(Boolean).join(', '),
      }
    }
    if (body.commodities !== undefined) update.commodities = body.commodities
    if (body.organic !== undefined) update.organic = body.organic
    if (body.size !== undefined) update.size = body.size || undefined
    if (body.type !== undefined) update.type = body.type || undefined
    if (body.website !== undefined) update.website = body.website.trim() || undefined
    if (body.contactEmail !== undefined) update.contactEmail = body.contactEmail.trim() || undefined
    if (body.contactName !== undefined) update.contactName = body.contactName.trim() || undefined
    if (body.notes !== undefined) update.notes = body.notes.trim() || undefined
    if (body.outreachSent !== undefined) {
      update.outreachSent = body.outreachSent
      if (body.outreachSent) update.outreachSentAt = new Date()
    }

    await db.collection<DirectoryPipeline>('directoryPipeline').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )
    return { ok: true }
  })

  // DELETE /admin/directory-pipeline/:id — remove an entry
  fastify.delete('/directory-pipeline/:id', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const db = database.getDb()
    await db.collection<DirectoryPipeline>('directoryPipeline').deleteOne({ _id: new ObjectId(id) })
    return { ok: true }
  })

  // POST /admin/directory-pipeline/:id/push — push entry to supplierDirectory
  // Accepts optional body overrides: { companyName, location, website, contactEmail, commodities, certifications, dataSources }
  fastify.post('/directory-pipeline/:id/push', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const body = (request.body || {}) as {
      companyName?: string
      location?: { city?: string; state?: string; full?: string }
      website?: string
      contactEmail?: string
      commodities?: string[]
      certifications?: string[]
      dataSources?: Record<string, { verified: boolean; score: number }>
    }
    const db = database.getDb()

    const entry = await db.collection<DirectoryPipeline>('directoryPipeline').findOne({ _id: new ObjectId(id) })
    if (!entry) return reply.status(404).send({ error: 'Entry not found' })
    if (entry.status === 'pushed' || entry.status === 'claimed') {
      return reply.status(400).send({ error: 'Already pushed to directory' })
    }

    // Merge body overrides with pipeline entry data
    const companyName = body.companyName?.trim() || entry.companyName
    const location = body.location
      ? { city: body.location.city || '', state: body.location.state || '', full: body.location.full || [body.location.city, body.location.state].filter(Boolean).join(', ') }
      : entry.location
    const website = body.website?.trim() || entry.website
    const contactEmail = body.contactEmail?.trim() || (entry as any).contactEmail || (entry as any).contact?.email
    const contactPhone = (entry as any).contact?.phone || undefined
    const commodities = body.commodities?.length ? body.commodities : entry.commodities
    const certifications = body.certifications ?? (entry.organic ? ['USDA Organic'] : [])
    // Merge body dataSources on top of Phase 1 dataSources so CSV signals aren't dropped
    const entryDataSources = (entry as any).dataSources || {}
    const dataSources = { ...entryDataSources, ...(body.dataSources ?? {}) }
    const brandStory = body.brandStory?.trim() || entry.brandStory || undefined
    const yearEstablished = body.yearEstablished || (entry.scrapedData as any)?.yearEstablished || (entry as any).dataSources?.established?.yearEstablished || undefined
    const scrapedProducts: Array<{ commodity: string; varieties: Array<{ name: string; availability?: string; organic?: boolean; growingPractices?: string[] }> }> | undefined = body.products?.length ? body.products : undefined
    const operationScale = (entry as any).operationScale || undefined
    const certifiedAcres = (entry as any).certifiedAcres || undefined
    const operationFlags = (entry as any).operationFlags || undefined

    // Compute verification score from dataSources
    const scoreMap: Record<string, number> = { paca: 5, gfsi: 5, established: 5, usdaOrganic: 5, drc: 3, website: 2, acrelist: 2 }
    const scoreTotal = Object.entries(dataSources).reduce((sum, [key, val]: [string, any]) => sum + (val.verified ? (scoreMap[key] ?? 0) : 0), 0)
    const scoreMax = Object.values(scoreMap).reduce((a, b) => a + b, 0)

    // Build a slug, ensure uniqueness
    let slug = slugify(companyName)
    const existing = await db.collection('supplierDirectory').findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const isOrganic = certifications.some(c => c.toLowerCase().includes('organic'))

    const products = scrapedProducts?.length
      ? scrapedProducts.map(p => ({
          commodity: p.commodity,
          varieties: p.varieties || [],
          isOrganic: isOrganic || p.varieties?.some(v => v.organic) || false,
          seasonality: 'year-round' as const,
        }))
      : commodities.map(c => ({
          commodity: c,
          varieties: [] as any[],
          isOrganic,
          seasonality: 'year-round' as const,
        }))

    const supplierEntry: Omit<SupplierDirectory, '_id'> = {
      slug,
      companyName,
      claimed: false,
      listed: true,
      location,
      website,
      certifications,
      products,
      brandStory,
      yearEstablished,
      contact: {
        salesEmail: contactEmail,
        phone: contactPhone,
        website,
      },
      operationScale,
      certifiedAcres,
      operationFlags,
      dataSources: {
        ...dataSources,
        ...(yearEstablished ? {
          established: { verified: true, yearEstablished, yearsInBusiness: new Date().getFullYear() - yearEstablished, score: 5 }
        } : {}),
      },
      verificationScore: scoreTotal > 0 ? { score: scoreTotal, maxScore: scoreMax } : undefined,
      importSource: 'admin-pipeline',
      importDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const dirResult = await db.collection<SupplierDirectory>('supplierDirectory').insertOne(supplierEntry as any)

    await db.collection<DirectoryPipeline>('directoryPipeline').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'pushed', pushedAt: new Date(), supplierDirectoryId: dirResult.insertedId.toString(), updatedAt: new Date() } }
    )

    return { ok: true, supplierDirectoryId: dirResult.insertedId.toString(), slug }
  })

  // ── Dismiss pipeline entry ─────────────────────────────────────────────────
  // POST /admin/pipeline/:id/dismiss
  fastify.post('/pipeline/:id/dismiss', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const { reason } = (request.body as any) || {}
    const db = database.getDb()
    await db.collection('directoryPipeline').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'dismissed', dismissReason: reason || undefined, updatedAt: new Date() } }
    )
    return { ok: true }
  })

  // ── Scrape pipeline entry website ──────────────────────────────────────────
  // POST /admin/pipeline/:id/scrape
  //
  // Smart depth-2 crawler:
  //   1. Fetch homepage, extract internal links
  //   2. Score links by relevance (product/about/farm/grow/variety/contact keywords)
  //   3. Fetch top 6 depth-1 pages in parallel
  //   4. From product/category-looking depth-1 pages, extract their links
  //   5. Fetch top 4 relevant depth-2 pages in parallel
  //   6. Concatenate all page text → single Claude Haiku call
  //   7. Store crawledUrls for debugging, update pipeline entry
  fastify.post('/pipeline/:id/scrape', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const db = database.getDb()

    const entry = await db.collection('directoryPipeline').findOne({ _id: new ObjectId(id) })
    if (!entry) return reply.status(404).send({ error: 'Entry not found' })

    const website = entry.website as string | undefined
    if (!website) return reply.status(400).send({ error: 'Entry has no website URL' })

    const rootUrl = website.match(/^https?:\/\//) ? website : `https://${website}`
    const rootOrigin = new URL(rootUrl).origin

    const UA = 'Mozilla/5.0 (compatible; ProduceHunt-Bot/1.0)'

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Pages that are clearly noise — skip unconditionally
    const SKIP_PATTERNS = [/\/blog\//i, /\/news\//i, /\/press\//i, /\/careers\//i,
      /\/jobs\//i, /\/privacy/i, /\/terms/i, /\/legal/i, /\/cookie/i,
      /\/wp-admin/i, /\/cart/i, /\/checkout/i, /\/account/i, /\/login/i,
      /\/recipe/i, /\/juice/i, /\/menu/i, /\/cocktail/i, /\/smoothie/i,
      /\/store\//i, /\/shop\//i, /\/csa/i, /\/subscription/i, /\/membership/i,
      /\/merchandise/i, /\/merch\//i, /\/gift/i, /\/box\//i,
      /\.(pdf|jpg|jpeg|png|gif|svg|mp4|zip|css|js)$/i,
      /\/\d{4}\/\d{2}\//] // date-based blog paths

    function shouldSkip(href: string): boolean {
      return SKIP_PATTERNS.some(p => p.test(href.toLowerCase()))
    }

    function extractLinks(html: string, base: string): string[] {
      const links: string[] = []
      const re = /href=["']([^"']+)["']/gi
      let m: RegExpExecArray | null
      while ((m = re.exec(html)) !== null) {
        try {
          const abs = new URL(m[1], base).href
          if (abs.startsWith(rootOrigin) && !links.includes(abs)) links.push(abs)
        } catch { /* skip malformed */ }
      }
      return links
    }

    function stripHtml(html: string): string {
      return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    async function fetchPage(url: string): Promise<{ url: string; text: string; html: string } | null> {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) })
        if (!res.ok) return null
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('html')) return null
        const html = await res.text()
        return { url, text: stripHtml(html), html }
      } catch { return null }
    }

    // Extract <loc> URLs from a sitemap XML string (handles both sitemap indexes and regular sitemaps)
    function extractSitemapLocs(xml: string): string[] {
      const locs: string[] = []
      for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) locs.push((m[1] as string).trim())
      return locs
    }

    // ── Sitemap discovery: cheapest way to find all product pages ─────────────
    // Handles both regular sitemaps and sitemap indexes (which point to child sitemaps)
    const sitemapUrls: string[] = []
    try {
      const sitemapRes = await fetch(`${rootOrigin}/sitemap.xml`, {
        headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5000)
      })
      if (sitemapRes.ok) {
        const xml = await sitemapRes.text()
        const locs = extractSitemapLocs(xml)
        const isIndex = /<sitemap>/i.test(xml)

        if (isIndex) {
          // Sitemap index: locs point to child sitemaps — fetch them to get actual page URLs
          const childXmls = await Promise.all(
            locs.filter(u => u.endsWith('.xml')).slice(0, 5).map(async u => {
              try {
                const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5000) })
                return r.ok ? r.text() : null
              } catch { return null }
            })
          )
          for (const childXml of childXmls) {
            if (!childXml) continue
            for (const url of extractSitemapLocs(childXml)) {
              if (url.startsWith(rootOrigin) && !shouldSkip(url) && url !== rootUrl && !sitemapUrls.includes(url))
                sitemapUrls.push(url)
            }
          }
        } else {
          // Regular sitemap: locs are actual page URLs
          for (const url of locs) {
            if (url.startsWith(rootOrigin) && !shouldSkip(url) && url !== rootUrl)
              sitemapUrls.push(url)
          }
        }
      }
    } catch { /* sitemap optional */ }

    // ── Phase 1: fetch homepage ───────────────────────────────────────────────
    const homePage = await fetchPage(rootUrl)
    if (!homePage) return reply.status(502).send({ error: 'Could not fetch homepage' })

    // ── Phase 2: gather candidate pages ──────────────────────────────────────
    // If sitemap found pages, use those (capped at 12). Otherwise fall back to
    // link extraction — take all non-skipped internal links, up to 10.
    const visited = new Set([rootUrl])
    let candidateUrls: string[]

    if (sitemapUrls.length > 0) {
      // Sitemap available: trust it, take up to 12 pages
      candidateUrls = sitemapUrls.filter(u => !visited.has(u)).slice(0, 12)
    } else {
      // No sitemap: extract all non-skipped links from homepage, then from
      // any linked page that looks like a hub (/products, /what-we-grow, etc.)
      const homepageLinks = extractLinks(homePage.html, rootUrl)
        .filter(u => u !== rootUrl && !shouldSkip(u))
        .slice(0, 10)

      // From those pages, collect another layer of links (depth-2)
      const depth1Pages = (await Promise.all(homepageLinks.map(fetchPage))).filter(Boolean) as typeof homePage[]
      const depth1Urls = homepageLinks

      const depth2Urls: string[] = []
      const depth1Visited = new Set([rootUrl, ...depth1Urls])
      for (const page of depth1Pages) {
        const sub = extractLinks(page.html, page.url)
          .filter(u => !depth1Visited.has(u) && !shouldSkip(u))
          .slice(0, 4)
        sub.forEach(u => { depth2Urls.push(u); depth1Visited.add(u) })
      }

      candidateUrls = [...new Set([...depth1Urls, ...depth2Urls])].slice(0, 12)
    }

    candidateUrls.forEach(u => visited.add(u))

    // Fetch all candidate pages in parallel
    const candidatePages = (await Promise.all(candidateUrls.map(fetchPage))).filter(Boolean) as typeof homePage[]

    // ── URL trust classification ──────────────────────────────────────────────
    // Substring match — "lemon" matches /lemons, /our-lemon-grove, /lemon-varieties, etc.
    const PRODUCE_URL_TERMS = [
      // Categories
      'citrus', 'stone-fruit', 'stonefruit', 'pome', 'berry', 'berries', 'tropical',
      'grape', 'vineyard', 'leafy', 'brassica', 'cole-crop', 'root-veg', 'vine-crop',
      'herb', 'specialty', 'tree-nut', 'treenut',

      // Citrus
      'orange', 'navel', 'valencia', 'cara-cara', 'blood-orange', 'mandarin',
      'clementine', 'satsuma', 'tangerine', 'sumo', 'lemon', 'meyer', 'eureka',
      'lisbon', 'lime', 'persian', 'key-lime', 'bearss', 'grapefruit', 'tangelo',

      // Stone fruits
      'peach', 'nectarine', 'cherry', 'plum', 'apricot', 'bing', 'rainier',

      // Pome fruits
      'apple', 'honeycrisp', 'fuji', 'gala', 'granny-smith', 'pink-lady', 'pear',
      'bartlett', 'bosc', 'anjou',

      // Berries
      'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry',

      // Tropical
      'avocado', 'hass', 'fuerte', 'reed', 'lamb-hass', 'mango', 'pineapple',
      'papaya', 'banana',

      // Leafy greens
      'lettuce', 'romaine', 'spinach', 'kale', 'arugula', 'chard', 'celery',
      'microgreen',

      // Brassicas
      'broccoli', 'cauliflower', 'cabbage', 'brussels', 'kohlrabi',

      // Root vegetables
      'carrot', 'potato', 'sweet-potato', 'onion', 'garlic', 'beet', 'turnip', 'leek',

      // Vine crops
      'tomato', 'cucumber', 'pepper', 'zucchini', 'squash', 'melon', 'cantaloupe',
      'watermelon', 'honeydew', 'eggplant',

      // Specialty vegetables
      'asparagus', 'artichoke', 'corn', 'mushroom', 'fennel', 'okra', 'rhubarb',

      // Herbs
      'basil', 'cilantro', 'parsley', 'mint', 'thyme', 'rosemary', 'oregano', 'sage',
      'lavender', 'tarragon', 'chive', 'dill',

      // Specialty fruits
      'fig', 'date', 'pomegranate', 'persimmon', 'quince', 'guava', 'lychee',
      'dragon-fruit', 'dragonfruit', 'passion-fruit', 'passionfruit',

      // Tree nuts
      'almond', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'cashew',

      // Generic product page signals
      'produce', 'crop', 'grow', 'farm', 'harvest', 'variety', 'varieties',
      'what-we-grow', 'we-grow', 'our-crops', 'our-farm', 'our-produce', 'our-fruit',
      'our-veget', 'what-we-sell', 'what-we-offer', 'commodit', 'catalog', 'catalogue',
      'fresh', 'seasonal', 'organic', 'certified', 'grower', 'rancho', 'orchard',
      'grove', 'field', 'acre', 'land', 'plot', 'operation',
    ]

    // Known-bad URL fragments — pages about the business, not what they grow
    const REFERENCE_TERMS = [
      'blog', 'news', 'press', 'article', 'post', 'story', 'stories',
      'about', 'team', 'staff', 'founder', 'history', 'mission', 'vision', 'values',
      'contact', 'location', 'directions', 'map', 'hours',
      'faq', 'help', 'support', 'shipping', 'delivery', 'returns', 'policy',
      'recipe', 'juice', 'smoothie', 'cocktail', 'menu', 'cooking', 'kitchen',
      'event', 'workshop', 'tour', 'visit', 'upick', 'u-pick',
      'career', 'job', 'hire', 'employment',
      'partner', 'vendor', 'supplier', 'wholesale-info',
      'gallery', 'photo', 'video', 'media',
      'newsletter', 'subscribe', 'signup', 'register',
      'store', 'shop', 'csa', 'subscription', 'membership', 'box', 'basket',
      'merchandise', 'merch', 'gift', 'bundle', 'kit',
    ]

    function classifyUrl(url: string): 'product' | 'reference' | 'general' {
      const path = url.toLowerCase().replace(/^https?:\/\/[^/]+/, '')
      if (REFERENCE_TERMS.some(t => path.includes(t))) return 'reference'
      if (PRODUCE_URL_TERMS.some(t => path.includes(t))) return 'product'
      return 'general'
    }

    // ── Assemble all page text ────────────────────────────────────────────────
    const allPages = [homePage, ...candidatePages]
    const crawledUrls = allPages.map(p => p.url)

    const PAGE_LABEL: Record<string, string> = {
      product:   '[PRODUCT PAGE]',
      reference: '[REFERENCE PAGE]',
      general:   '[GENERAL PAGE]',
    }

    const combinedText = allPages
      .map(p => `--- ${PAGE_LABEL[classifyUrl(p.url)]} ${p.url} ---\n${p.text}`)
      .join('\n\n')
      .slice(0, 50000)

    // ── Claude extraction ─────────────────────────────────────────────────────
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) return reply.status(500).send({ error: 'CLAUDE_API_KEY not configured' })

    const PRODUCE_TAXONOMY = `
Citrus Fruits: Orange (Navel, Valencia, Cara Cara, Blood Orange), Mandarin (Clementine, Satsuma, Tangerine, Sumo Citrus, Gold Nugget), Lemon (Eureka, Lisbon, Meyer, Pink Variegated), Lime (Persian, Key Lime, Bearss, Australian Finger Lime), Grapefruit (Ruby Red, White, Pink), Minneola (Minneola Tangelo, Honeybell)
Stone Fruits: Peach (Elberta, Red Haven, White Lady, Saturn, Halford), Nectarine (Red Gold, Fantasia, Arctic Rose), Cherry (Bing, Rainier, Lambert, Montmorency), Plum (Santa Rosa, Greengage, Stanley), Apricot (Blenheim, Moorpark, Goldcot)
Pome Fruits: Apple (Honeycrisp, Gala, Fuji, Cosmic Crisp, Granny Smith, Braeburn, Pink Lady, Envy), Pear (Bartlett, Bosc, Comice, Anjou, Forelle, Seckel)
Berries: Strawberry (Albion, Chandler, Seascape, Monterey), Blueberry (Duke, Bluecrop, Emerald, Jewel), Raspberry (Heritage, Caroline, Anne), Blackberry (Triple Crown, Apache, Natchez), Cranberry (Stevens, Ben Lear)
Tropical Fruits: Avocado (Hass, Fuerte, Bacon, Reed, Lamb Hass, Gem, Zutano, Pinkerton, Carmen Hass, Mexicola Grande), Mango (Tommy Atkins, Ataulfo, Kent, Keitt, Haden), Pineapple (Gold MD2, Smooth Cayenne), Papaya (Maradol, Solo), Banana (Cavendish, Plantain)
Grapes: Table Grape (Thompson Seedless, Flame Seedless, Crimson Seedless, Red Globe, Cotton Candy, Moon Drops)
Leafy Greens: Lettuce (Iceberg, Romaine, Butterhead, Bibb, Little Gem, Red Leaf), Spinach (Baby Spinach, Savoy, Bloomsdale), Kale (Curly, Lacinato), Arugula, Swiss Chard (Rainbow Chard), Celery (Pascal)
Brassicas & Cole Crops: Broccoli (Calabrese, Arcadia, Packman), Cauliflower (Snowball, Romanesco, Cheddar), Cabbage (Green, Red, Savoy, Napa), Brussels Sprouts, Kohlrabi
Root Vegetables: Carrot (Nantes, Imperator, Chantenay, Baby), Potato (Russet, Yukon Gold, Red, Fingerling), Sweet Potato, Onion, Garlic, Beet, Turnip, Leek
Vine Crops: Tomato (Beefsteak, Roma, Heirloom), Cherry Tomato (Sun Gold, Sweet 100), Cucumber, Bell Pepper, Hot Pepper, Zucchini, Summer Squash, Winter Squash, Melon (Cantaloupe, Honeydew, Watermelon), Eggplant
Specialty Vegetables: Asparagus (UC 157, Purple Passion, Jersey Giant), Artichoke (Globe, Baby), Corn (Silver Queen, Honey Select), Mushroom (Button, Cremini, Portobello, Shiitake, Oyster), Microgreens (Broccoli, Pea Shoots, Radish, Sunflower, Arugula, Kale, Amaranth, Mixed), Fennel, Okra
Herbs: Basil, Cilantro, Parsley, Mint, Thyme, Rosemary, Oregano, Sage
Specialty Fruits: Fig (Black Mission, Brown Turkey, Calimyrna, Kadota), Date (Medjool, Deglet Noor, Barhi), Pomegranate (Wonderful, Eversweet), Persimmon (Hachiya, Fuyu, Jiro), Quince, Guava (White, Pink, Strawberry, Pineapple/Feijoa), Lychee (Brewster, Mauritius, Hak Ip), Dragon Fruit (Red/White, Red/Red, Yellow/White)
Tree Nuts: Almond (Nonpareil, Carmel, Monterey), Walnut (Chandler, Howard), Pecan, Pistachio (Kerman), Hazelnut`

    const prompt = `You are extracting structured data about a produce supplier from their website.

Website: ${rootUrl}
Company on file: ${entry.companyName}
Pages crawled: ${crawledUrls.join(', ')}

PRODUCE TAXONOMY — use these exact category and commodity names when mapping what you find:
${PRODUCE_TAXONOMY}

Page trust levels — each section of the combined text is labeled:
- [PRODUCT PAGE]: high trust — extract all products, varieties, organic status, and availability found here
- [GENERAL PAGE]: medium trust — extract products only if clearly stated as something the farm grows or sells
- [REFERENCE PAGE]: low trust — use only for brand story, year established, and contact email; do not extract products from here

Rules for mapping:
- Only include products the farm actively grows or sells — ignore juice/recipe ingredient lists, menu items, blog mentions, or passing references
- If a website says "Citrus", infer the specific commodity from the varieties found (Meyer Lemon → commodity: Lemon; Bearss Lime → commodity: Lime)
- Each variety belongs to exactly one commodity — never list a variety under the wrong commodity
- If a commodity or variety isn't in the taxonomy, use your best judgment for category and commodity name, keep variety name as found
- Do not invent varieties that aren't explicitly mentioned on the site

Combined website text:
${combinedText}

Return ONLY valid JSON (no markdown, no explanation):
{
  "products": [
    {
      "category": "Citrus Fruits",
      "commodity": "Lemon",
      "varieties": [
        { "name": "Meyer Lemon", "availability": "November–April", "organic": true, "growingPractices": ["USDA Organic"] },
        { "name": "Lisbon", "availability": null, "organic": false, "growingPractices": [] },
        { "name": "Eureka", "availability": null, "organic": null, "growingPractices": [] }
      ]
    }
  ],
  "brandStory": "1-2 sentence description of what they grow/sell and their founding story",
  "yearEstablished": 1987,
  "seasonality": "brief note on harvest/shipping windows at the farm level, e.g. 'May–October for stone fruit'",
  "certifications": ["certifications mentioned beyond USDA Organic, e.g. Non-GMO Project, SQF, LGMA"],
  "contactEmail": "sales or general contact email if found"
}

Rules for variety fields:
- availability: any window, season, or month range mentioned near the variety name. null if not mentioned.
- organic: true if the variety/product is explicitly labeled organic or certified organic. false if explicitly described as conventional. null if not stated either way.
- growingPractices: array of practices explicitly mentioned (e.g. "USDA Organic", "Non-GMO", "Sustainable", "Regenerative", "IPM", "Hydroponic"). Empty array if none mentioned.
If a field cannot be determined, use null. For arrays, use [] if nothing found.`

    let scraped: Record<string, unknown> = {}
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const claudeData = await claudeRes.json() as any
      let raw = (claudeData.content?.[0]?.text || '{}').replace(/^```json\n?|\n?```$/g, '').trim()
      // If output was truncated (finish_reason: max_tokens), attempt to close the JSON
      if (claudeData.stop_reason === 'max_tokens') {
        // Try truncating to last complete top-level field by finding last '}' before the products array closes
        const lastBrace = raw.lastIndexOf('},')
        if (lastBrace > 0) raw = raw.slice(0, lastBrace + 1) + ']}'
        else raw = raw + ']}' // best-effort close
      }
      try {
        scraped = JSON.parse(raw)
      } catch {
        // Last resort: extract whatever we can with a relaxed parse
        const productsMatch = raw.match(/"products"\s*:\s*\[/)
        if (!productsMatch) throw new Error('Could not extract any product data from Claude response')
        // Build a minimal object with what we have
        scraped = { products: [], brandStory: null, yearEstablished: null }
      }
    } catch (err: any) {
      return reply.status(502).send({ error: `Claude extraction failed: ${err.message}` })
    }

    // Derive flat commodities[] from products[] for backward compat (pipeline table tags)
    const products = (scraped.products as Array<{ category: string; commodity: string; varieties: Array<{ name: string; availability?: string; organic?: boolean | null; growingPractices?: string[] }> }>) || []
    const derivedCommodities = [...new Set(products.map(p => p.commodity))]

    await db.collection('directoryPipeline').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          scraped: true,
          scrapedAt: new Date(),
          status: 'scraped',
          brandStory: scraped.brandStory || undefined,
          scrapedData: { ...scraped, products, crawledUrls },
          updatedAt: new Date(),
          // Store original phase 1 commodities on first scrape so UI can show confirmed vs new
          ...(!entry.scraped ? { phase1Commodities: entry.commodities || [] } : {}),
        },
      }
    )

    return { ok: true, scraped: { ...scraped, products, derivedCommodities, crawledUrls } }
  })

  // ── Batch Import ───────────────────────────────────────────────────────────
  // POST /admin/import-batch
  // Accepts JSON body: { source, state, commodity, limit }
  // Or with fileData (base64) + fileType ('csv'|'xlsx') for manual file upload
  fastify.post('/import-batch', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { source, state, commodity, limit = 100, fileData, fileType } = request.body as {
      source: 'usda-organic' | 'usda-paca'
      state?: string
      commodity?: string
      limit?: number
      fileData?: string  // base64-encoded file content
      fileType?: 'csv' | 'xlsx'
    }

    if (!source) return reply.status(400).send({ error: 'source is required' })

    const db = database.getDb()

    // ── Commodity keyword → canonical names map ────────────────────────────
    const COMMODITY_KEYWORDS: Record<string, string[]> = {
      lemon: ['Lemon'], lime: ['Lime'], orange: ['Orange'], grapefruit: ['Grapefruit'],
      tangerine: ['Tangerine'], clementine: ['Clementine'], mandarin: ['Mandarin'],
      citrus: ['Lemon', 'Lime', 'Orange', 'Grapefruit', 'Tangerine'],
      strawberr: ['Strawberry'], blueberr: ['Blueberry'], raspberr: ['Raspberry'],
      blackberr: ['Blackberry'], cranberr: ['Cranberry'],
      peach: ['Peach'], nectarine: ['Nectarine'], plum: ['Plum'],
      cherr: ['Cherry'], apricot: ['Apricot'],
      apple: ['Apple'], pear: ['Pear'],
      lettuce: ['Lettuce'], spinach: ['Spinach'], kale: ['Kale'],
      arugula: ['Arugula'], chard: ['Chard'],
      tomato: ['Tomato'], pepper: ['Bell Pepper'], carrot: ['Carrot'],
      broccoli: ['Broccoli'], cauliflower: ['Cauliflower'], celery: ['Celery'],
      cucumber: ['Cucumber'], zucchini: ['Zucchini'], squash: ['Squash'],
      onion: ['Onion'], garlic: ['Garlic'], potato: ['Potato'], corn: ['Corn'],
      asparagus: ['Asparagus'], artichoke: ['Artichoke'],
      avocado: ['Avocado'], grape: ['Grape'], mango: ['Mango'],
      pineapple: ['Pineapple'], watermelon: ['Watermelon'], cantaloupe: ['Cantaloupe'],
      mushroom: ['Mushroom'], herb: ['Basil', 'Mint', 'Cilantro', 'Parsley'],
    }

    function extractCommodities(itemsField: string): string[] {
      if (!itemsField) return []
      const lower = itemsField.toLowerCase()
      const found = new Set<string>()
      for (const [keyword, canonicals] of Object.entries(COMMODITY_KEYWORDS)) {
        if (lower.includes(keyword)) canonicals.forEach(c => found.add(c))
      }
      return [...found]
    }

    // ── Parse CSV (shared for both API and manual upload) ─────────────────
    function col(row: Record<string, string>, ...names: string[]): string {
      for (const n of names) {
        for (const key of Object.keys(row)) {
          if (key.trim().toLowerCase() === n.toLowerCase()) return (row[key] || '').trim()
        }
      }
      return ''
    }

    const STATE_NAMES: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY',
    }
    function normalizeState(s: string): string {
      return STATE_NAMES[s.toLowerCase().trim()] || s.toUpperCase().trim()
    }

    let records: Record<string, string>[] = []

    if (fileData) {
      const buf = Buffer.from(fileData, 'base64')
      if (fileType === 'xlsx') {
        const XLSX = await import('xlsx')
        const wb = XLSX.read(buf, { type: 'buffer' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        records = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
      } else {
        const { parse } = await import('csv-parse/sync')
        records = parse(buf.toString('utf-8'), {
          columns: true, skip_empty_lines: true, trim: true,
          relax_quotes: true, relax_column_count: true,
        })
      }
    } else if (source === 'usda-organic') {
      // USDA Organic Integrity OData API path
      const apiKey = process.env.USDA_API_KEY
      if (!apiKey) {
        return reply.status(400).send({
          error: 'USDA_API_KEY not configured',
          instructions: 'Register free at https://api.data.gov/signup/ then add USDA_API_KEY to your .env',
          fallback: 'Upload a CSV manually using the csvData field instead',
        })
      }

      // OData query — filter by state and operation scope (Crops)
      const params = new URLSearchParams({
        api_key: apiKey,
        '$format': 'json',
        '$top': String(Math.min(limit * 3, 500)), // fetch more than limit to account for filtering
        '$filter': [
          `Status eq 'Certified'`,
          `OperationTypeCode eq 'P'`, // P = Producer/Crops
          state ? `State eq '${state.toUpperCase()}'` : '',
        ].filter(Boolean).join(' and '),
      })

      const url = `https://organicapi.ams.usda.gov/IntegrityPubDataServices/OidPublicDataService.svc/CertifiedOperations?${params}`

      try {
        const res = await fetch(url)
        if (!res.ok) {
          const err = await res.text()
          return reply.status(502).send({
            error: 'USDA API is currently unavailable (HTTP ' + res.status + ')',
            details: err.slice(0, 300),
            instructions: 'Use CSV upload instead: go to organic.ams.usda.gov/integrity/Search, filter by state, click Export to CSV, then upload the file.',
          })
        }
        const json = await res.json() as any
        // OData response wraps in value array
        const items = json?.value ?? json?.d?.results ?? json ?? []
        records = items.map((item: any) => ({
          'Operation Name': item.OperationName || item.Name || '',
          'City': item.City || item.PhysicalCity || '',
          'State': item.State || item.PhysicalState || '',
          'Zip': item.Zip || item.PhysicalZip || '',
          'Certifying Agent': item.CertifyingAgent || item.CertAgentName || '',
          'Items': item.ItemsGrown || item.CertifiedItems || item.Items || '',
          'Certificate': item.CertificateNumber || item.Certificate || '',
          'Web Site': item.Website || item.WebSite || '',
          'Phone': item.Phone || item.PhoneNumber || '',
          'Status': item.Status || 'Certified',
          'Operation Scope': 'Crops',
        }))
      } catch (fetchErr: any) {
        return reply.status(502).send({
          error: 'Failed to reach USDA API: ' + fetchErr.message,
          instructions: 'Use CSV upload instead: go to organic.ams.usda.gov/integrity/Search, filter by state, click Export to CSV, then upload the file.',
        })
      }
    } else {
      return reply.status(400).send({ error: 'For usda-paca, csvData is required (no public API available)' })
    }

    // Log first row columns for debugging
    if (records.length > 0) {
      fastify.log.info({ cols: Object.keys(records[0]), sample: records[0] }, 'import-batch: first row')
    } else {
      fastify.log.warn('import-batch: no records parsed from file')
    }

    // ── Deduplicate ────────────────────────────────────────────────────────
    const existingCerts = new Set<string>()
    const existingDocs = await db.collection('directoryPipeline')
      .find({ 'dataSources.usdaOrganic.certificateNumber': { $exists: true } })
      .project({ 'dataSources.usdaOrganic.certificateNumber': 1 })
      .toArray()
    existingDocs.forEach(e => {
      const cert = e.dataSources?.usdaOrganic?.certificateNumber
      if (cert) existingCerts.add(String(cert))
    })

    // Also dedup by name+state to catch records without cert numbers
    const existingNames = new Set<string>()
    const existingNameDocs = await db.collection('directoryPipeline')
      .find({ importSource: source }, { projection: { companyName: 1, 'location.state': 1 } })
      .toArray()
    existingNameDocs.forEach(e => existingNames.add(`${e.companyName}|${e.location?.state}`))

    // ── Filter ────────────────────────────────────────────────────────────
    let skipped = 0
    const eligible: { row: Record<string, string>; hasWebsite: boolean }[] = []

    for (const row of records) {
      const companyName = col(row, 'Operation Name', 'OperationName', 'Business Name', 'Name')
      const rowState    = col(row, 'Physical Address: State/Province', 'State', 'Physical State', 'PhysicalState')
      const items       = col(row, 'Certified Products Under CROPS Scope', 'Items', 'ItemsGrown', 'Certified Items', 'CertifiedItems')
      const scope       = col(row, 'CROPS Scope Certification Status', 'Operation Scope', 'OperationScope', 'Scope').toLowerCase()
      const status      = col(row, 'Operation Certification Status', 'Status', 'Certificate Status').toLowerCase()
      const certNumber  = col(row, 'Certificate Numbers for Certified Products under CROPS Scope', 'Certificate', 'Certificate Number', 'CertificateNumber')
      const website     = col(row, 'Website URL', 'Web Site', 'Website', 'website')

      if (!companyName) { skipped++; continue }
      if (!status.includes('certif') && !status.includes('active') && status !== '') { skipped++; continue }
      if (source === 'usda-organic' && !scope.includes('crop') && !scope.includes('produc') && !scope.includes('certif') && scope !== '') { skipped++; continue }
      if (state && normalizeState(rowState) !== state.toUpperCase()) { skipped++; continue }
      if (commodity && !items.toLowerCase().includes(commodity.toLowerCase())) { skipped++; continue }
      if (certNumber && existingCerts.has(certNumber)) { skipped++; continue }
      if (existingNames.has(`${companyName}|${rowState}`)) { skipped++; continue }

      eligible.push({ row, hasWebsite: !!website })
    }

    // Prioritize entries with a website URL — they can actually be scraped
    eligible.sort((a, b) => (b.hasWebsite ? 1 : 0) - (a.hasWebsite ? 1 : 0))

    // ── Insert ────────────────────────────────────────────────────────────
    let inserted = 0

    for (const { row } of eligible) {
      if (inserted >= limit) break

      const certNumber  = col(row, 'Certificate Numbers for Certified Products under CROPS Scope', 'Certificate', 'Certificate Number', 'CertificateNumber')
      const companyName = col(row, 'Operation Name', 'OperationName', 'Business Name', 'Name')
      const rowState    = col(row, 'Physical Address: State/Province', 'State', 'Physical State', 'PhysicalState')
      const items       = col(row, 'Certified Products Under CROPS Scope', 'Items', 'ItemsGrown', 'Certified Items', 'CertifiedItems')
      const website     = col(row, 'Website URL', 'Web Site', 'Website', 'website')

      const commodities = extractCommodities(items)

      const certifier    = col(row, 'Certifier Name', 'Certifying Agent', 'CertifyingAgent', 'certifier')
      const city         = col(row, 'Physical Address: City', 'City', 'Physical City', 'PhysicalCity')
      const zip          = col(row, 'Physical Address: ZIP/ Postal Code', 'Zip', 'Physical Zip', 'Zipcode')
      const county       = col(row, 'County')
      const phone        = col(row, 'Phone')
      const email        = col(row, 'Email')
      const effectiveDate = col(row, 'Effective Date of Operation Status', 'Effective Date')
      const acresRaw     = col(row, 'Total Certified Acres')
      const certifiedAcres = acresRaw ? parseFloat(acresRaw) : undefined
      const isCSA        = col(row, 'Community Supported Agriculture (CSA)').toLowerCase() === 'yes'
      const isDistributor = col(row, 'Distributor').toLowerCase() === 'yes'
      const isBroker     = col(row, 'Broker').toLowerCase() === 'yes'
      const isCoPacker   = col(row, 'Co-Packer').toLowerCase() === 'yes'
      const isMarketer   = col(row, 'Marketer/Trader').toLowerCase() === 'yes'
      const isGrowerGroup = col(row, 'Grower Group').toLowerCase() === 'yes'
      const handlingScope = col(row, 'HANDLING Scope Certification Status', 'Handling Scope').toLowerCase()
      const hasHandling  = handlingScope.includes('certif')

      // Derive operation scale from available signals
      const isHandler = isDistributor || isBroker || isMarketer || isCoPacker || hasHandling
      let operationScale: string | undefined
      if (isHandler) {
        operationScale = 'packer-shipper'
      } else if (isCSA && (!certifiedAcres || certifiedAcres < 50)) {
        operationScale = 'direct-market'
      } else if (certifiedAcres !== undefined) {
        if (certifiedAcres >= 500) operationScale = 'major-grower'
        else if (certifiedAcres >= 25) operationScale = 'commercial-farm'
        else operationScale = 'small-farm'
      } else if (isCSA) {
        operationScale = 'direct-market'
      }

      // Parse year established from effective date
      const certYear = effectiveDate ? parseInt(effectiveDate.split('/').pop() || '') : undefined

      const entry: any = {
        companyName,
        location: { city, state: normalizeState(rowState), zip, county: county || undefined, full: [city, normalizeState(rowState)].filter(Boolean).join(', ') },
        commodities,
        organic: source === 'usda-organic' ? true : null,
        website: website || undefined,
        contact: {
          phone: phone || undefined,
          email: email || undefined,
        },
        status: 'pending',
        importSource: source,
        certifiedAcres: certifiedAcres || undefined,
        operationScale: operationScale || undefined,
        operationFlags: {
          csa: isCSA || undefined,
          distributor: isDistributor || undefined,
          broker: isBroker || undefined,
          coPacker: isCoPacker || undefined,
          marketer: isMarketer || undefined,
          growerGroup: isGrowerGroup || undefined,
          handler: hasHandling || undefined,
        },
        dataSources: source === 'usda-organic' ? {
          usdaOrganic: {
            verified: true, score: 5,
            certifier: certifier || undefined,
            certificateNumber: certNumber || undefined,
            effectiveDate: effectiveDate || undefined,
            items,
          },
          ...(certYear ? { established: { verified: true, yearEstablished: certYear, score: 2 } } : {}),
        } : {
          paca: { verified: true, score: 5 },
        },
        certifications: source === 'usda-organic' ? ['USDA Organic'] : [],
        notes: certifier ? `Certified by ${certifier}` : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('directoryPipeline').insertOne(entry)
      if (certNumber) existingCerts.add(certNumber)
      existingNames.add(`${companyName}|${normalizeState(rowState)}`)
      inserted++
    }

    const debugInfo = inserted === 0 && records.length > 0
      ? { debug: `0 inserted from ${records.length} rows. Columns found: ${Object.keys(records[0]).join(' | ')}. First row sample: ${JSON.stringify(records[0]).slice(0, 300)}` }
      : {}

    return {
      ok: true,
      inserted,
      skipped,
      message: `Imported ${inserted} new ${source === 'usda-organic' ? 'USDA Organic' : 'PACA'} entries${skipped > 0 ? `, skipped ${skipped} (duplicates or no commodity match)` : ''}`,
      ...debugInfo,
    }
  })
}

export default adminRoutes

