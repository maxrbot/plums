import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'

interface ContactBatch {
  _id?: ObjectId
  userId: ObjectId
  name: string
  contactIds: ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const contactBatchesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  // Get all batches for user
  fastify.get('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      if (!userDoc) return reply.status(404).send({ error: 'User not found' })

      const batches = await db.collection<ContactBatch>('contactBatches')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()

      return {
        batches: batches.map(b => ({
          ...b,
          id: b._id!.toString(),
          contactIds: b.contactIds.map(id => id.toString()),
        }))
      }
    } catch {
      return reply.status(500).send({ error: 'Failed to get contact batches' })
    }
  })

  // Create a batch
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { name, contactIds } = request.body as { name: string; contactIds: string[] }

    if (!name?.trim()) return reply.status(400).send({ error: 'Batch name is required' })
    if (!contactIds?.length) return reply.status(400).send({ error: 'At least one contact is required' })

    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      if (!userDoc) return reply.status(404).send({ error: 'User not found' })

      const validIds = contactIds
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id))

      const batch: Omit<ContactBatch, '_id'> = {
        userId: userDoc._id,
        name: name.trim(),
        contactIds: validIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection<ContactBatch>('contactBatches').insertOne(batch)
      return {
        batch: {
          ...batch,
          id: result.insertedId.toString(),
          contactIds: validIds.map(id => id.toString()),
        }
      }
    } catch {
      return reply.status(500).send({ error: 'Failed to create contact batch' })
    }
  })

  // Delete a batch
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }

    if (!ObjectId.isValid(id)) return reply.status(400).send({ error: 'Invalid batch ID' })

    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      if (!userDoc) return reply.status(404).send({ error: 'User not found' })

      const result = await db.collection<ContactBatch>('contactBatches').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id,
      })

      if (result.deletedCount === 0) return reply.status(404).send({ error: 'Batch not found' })
      return { success: true }
    } catch {
      return reply.status(500).send({ error: 'Failed to delete contact batch' })
    }
  })
}

export default contactBatchesRoutes
