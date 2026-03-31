import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { Organization, User } from '../models/types'

const teamRoutes: FastifyPluginAsync = async (fastify) => {

  // Public — look up org by slug for signup flow (returns name only)
  fastify.get('/org-by-slug', async (request, reply) => {
    const { slug } = request.query as { slug?: string }
    if (!slug) return reply.status(400).send({ error: 'slug required' })
    const db = database.getDb()
    const org = await db.collection<Organization>('organizations').findOne({ slug: slug.toLowerCase() })
    if (!org) return reply.status(404).send({ error: 'Not found' })
    return { name: org.name, slug: org.slug }
  })

  fastify.addHook('preHandler', authenticate)

  // GET /team — list org members + org info (owner only)
  fastify.get('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    if (user.role !== 'owner') {
      return reply.status(403).send({ error: 'Owner access required' })
    }
    if (!user.orgId) {
      return reply.status(400).send({ error: 'No organisation found' })
    }

    const db = database.getDb()
    const org = await db.collection<Organization>('organizations').findOne({
      _id: new ObjectId(user.orgId)
    })
    if (!org) return reply.status(404).send({ error: 'Organisation not found' })

    const members = await db.collection<User>('users')
      .find({ orgId: user.orgId }, {
        projection: { password: 0 }
      })
      .sort({ createdAt: 1 })
      .toArray()

    const membersWithStats = await Promise.all(members.map(async m => {
      const emailCount = await db.collection('sentEmails').countDocuments({ userId: m.id })
      return {
        id: m.id,
        email: m.email,
        name: m.profile?.contactName || '',
        role: m.role,
        lastSeenAt: m.lastSeenAt ?? null,
        emailsSent: emailCount,
        createdAt: m.createdAt,
      }
    }))

    return {
      org: {
        id: org._id!.toString(),
        name: org.name,
        slug: org.slug,
        inviteCode: org.slug,
        memberCount: members.length,
      },
      members: membersWithStats,
    }
  })

  // DELETE /team/:userId — remove a member (owner only, can't remove self)
  fastify.delete('/:userId', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { userId } = request.params as { userId: string }

    if (user.role !== 'owner') {
      return reply.status(403).send({ error: 'Owner access required' })
    }
    if (userId === user.id) {
      return reply.status(400).send({ error: 'Cannot remove yourself from the team' })
    }

    const db = database.getDb()
    const target = await db.collection<User>('users').findOne({ id: userId, orgId: user.orgId! })
    if (!target) {
      return reply.status(404).send({ error: 'Member not found in your organisation' })
    }

    // Detach from org rather than deleting the account entirely
    await db.collection<User>('users').updateOne(
      { id: userId },
      { $unset: { orgId: '', role: '' }, $set: { updatedAt: new Date() } }
    )

    return { ok: true }
  })

  // GET /team/org — get org details for any authenticated user (members need the invite code display)
  fastify.get('/org', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    if (!user.orgId) return reply.status(404).send({ error: 'No organisation' })

    const db = database.getDb()
    const org = await db.collection<Organization>('organizations').findOne({
      _id: new ObjectId(user.orgId)
    })
    if (!org) return reply.status(404).send({ error: 'Organisation not found' })

    return {
      id: org._id!.toString(),
      name: org.name,
      slug: org.slug,
      inviteCode: org.slug,
    }
  })
}

export default teamRoutes
