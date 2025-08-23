import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { Contact } from '../models/types'

const contactsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get all user's contacts
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
      
      const contacts = await db.collection<Contact>('contacts')
        .find({ userId: userDoc._id })
        .sort({ createdAt: -1 })
        .toArray()
      
      // Transform _id to id for frontend compatibility
      const transformedContacts = contacts.map(contact => ({
        ...contact,
        id: contact._id.toString(),
        _id: undefined // Remove _id to avoid confusion
      }))
      
      return { contacts: transformedContacts }
      
    } catch (error) {
      console.error('Get contacts error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get contacts'
      })
    }
  })
  
  // Get single contact
  fastify.get('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid contact ID'
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
      
      const contact = await db.collection<Contact>('contacts').findOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (!contact) {
        return reply.status(404).send({
          error: 'Contact Not Found',
          message: 'Contact not found'
        })
      }
      
      // Transform _id to id for frontend compatibility
      const transformedContact = {
        ...contact,
        id: contact._id.toString(),
        _id: undefined // Remove _id to avoid confusion
      }
      
      return { contact: transformedContact }
      
    } catch (error) {
      console.error('Get contact error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get contact'
      })
    }
  })
  
  // Create new contact
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const contactData = request.body as Omit<Contact, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const newContact: Omit<Contact, '_id'> = {
        ...contactData,
        userId: userDoc._id!,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection<Contact>('contacts').insertOne(newContact)
      
      const createdContact = await db.collection<Contact>('contacts').findOne({
        _id: result.insertedId
      })
      
      return { contact: createdContact }
      
    } catch (error) {
      console.error('Create contact error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create contact'
      })
    }
  })
  
  // Update contact
  fastify.put('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    const updateData = request.body as Partial<Contact>
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid contact ID'
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
      
      const result = await db.collection<Contact>('contacts').updateOne(
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
          error: 'Contact Not Found',
          message: 'Contact not found'
        })
      }
      
      const updatedContact = await db.collection<Contact>('contacts').findOne({
        _id: new ObjectId(id)
      })
      
      return { contact: updatedContact }
      
    } catch (error) {
      console.error('Update contact error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update contact'
      })
    }
  })
  
  // Delete contact
  fastify.delete('/:id', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { id } = request.params as { id: string }
    
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid contact ID'
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
      
      const result = await db.collection<Contact>('contacts').deleteOne({
        _id: new ObjectId(id),
        userId: userDoc._id
      })
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          error: 'Contact Not Found',
          message: 'Contact not found'
        })
      }
      
      return { message: 'Contact deleted successfully' }
      
    } catch (error) {
      console.error('Delete contact error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete contact'
      })
    }
  })
  
  // Search contacts
  fastify.get('/search', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const { q, tags } = request.query as { q?: string; tags?: string }
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      const filter: any = { userId: userDoc._id }
      
      // Text search
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } }
        ]
      }
      
      // Tag filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim())
        filter.tags = { $in: tagArray }
      }
      
      const contacts = await db.collection<Contact>('contacts')
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()
      
      return { contacts }
      
    } catch (error) {
      console.error('Search contacts error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to search contacts'
      })
    }
  })
}

export default contactsRoutes
