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
        products: (e.products || []).map((p: any) => p.commodity),
        claimed: !!e.claimed,
        listed: e.listed !== false,  // default true for legacy entries
        acrelistUserId: e.acrelistUserId || null,
        claimedBy: e.acrelistUserId ? userMap[e.acrelistUserId] || null : null,
        verificationScore: e.verificationScore || null,
        certifications: e.certifications || [],
        importSource: e.importSource || null,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    }
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
  fastify.post('/directory-pipeline/:id/push', async (request, reply) => {
    const authRequest = request as AuthenticatedRequest
    await requireAdmin(authRequest, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const db = database.getDb()

    const entry = await db.collection<DirectoryPipeline>('directoryPipeline').findOne({ _id: new ObjectId(id) })
    if (!entry) return reply.status(404).send({ error: 'Entry not found' })
    if (entry.status === 'pushed' || entry.status === 'claimed') {
      return reply.status(400).send({ error: 'Already pushed to directory' })
    }

    // Build a slug, ensure uniqueness
    let slug = slugify(entry.companyName)
    const existing = await db.collection('supplierDirectory').findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const supplierEntry: Omit<SupplierDirectory, '_id'> = {
      slug,
      companyName: entry.companyName,
      claimed: false,
      listed: true,
      location: entry.location,
      website: entry.website,
      certifications: entry.organic ? ['USDA Organic'] : [],
      products: entry.commodities.map(c => ({
        commodity: c,
        varieties: [],
        isOrganic: entry.organic === true,
        seasonality: 'year-round' as const,
      })),
      contact: {
        salesEmail: entry.contactEmail,
        website: entry.website,
      },
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
}

export default adminRoutes

