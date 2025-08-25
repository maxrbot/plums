import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest, requireTier } from '../middleware/auth'
import { ChatbotConfig, ChatRequest, ChatResponse } from '../models/types'
import conversationalAI from '../services/conversationalAI'

const chatbotRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)
  
  // Get user's chatbot configuration
  fastify.get('/config', async (request, reply) => {
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
      
      const config = await db.collection('chatbotConfig').findOne({
        userId: userDoc._id
      })
      
      if (!config) {
        // Create default config - using old interface for compatibility
        const defaultConfig = {
          userId: userDoc._id!,
          farmKnowledge: {
            autoPopulated: false
          },
          isDeployed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const result = await db.collection('chatbotConfig').insertOne(defaultConfig)
        const createdConfig = await db.collection('chatbotConfig').findOne({
          _id: result.insertedId
        })
        
        return { config: createdConfig }
      }
      
      return { config }
      
    } catch (error) {
      console.error('Get chatbot config error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get chatbot configuration'
      })
    }
  })
  
  // Update chatbot configuration
  fastify.put('/config', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    const updateData = request.body as Partial<ChatbotConfig>
    
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
      
      const result = await db.collection('chatbotConfig').updateOne(
        { userId: userDoc._id },
        { 
          $set: {
            ...allowedUpdates,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
      
      const updatedConfig = await db.collection('chatbotConfig').findOne({
        userId: userDoc._id
      })
      
      return { config: updatedConfig }
      
    } catch (error) {
      console.error('Update chatbot config error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update chatbot configuration'
      })
    }
  })
  
  // Auto-populate farm knowledge from existing data
  fastify.post('/populate-knowledge', async (request, reply) => {
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
      
      // Gather data from user's existing records
      const [regions, crops, certifications, packaging] = await Promise.all([
        db.collection('growingRegions').find({ userId: userDoc._id }).toArray(),
        db.collection('cropManagement').find({ userId: userDoc._id }).toArray(),
        db.collection('certifications').find({ userId: userDoc._id }).toArray(),
        db.collection('customPackaging').find({ userId: userDoc._id }).toArray()
      ])
      
      // Build knowledge base summary
      const knowledgeBase = {
        farmName: userDoc.profile?.companyName || '',
        contact: {
          name: userDoc.profile?.contactName || '',
          email: userDoc.profile?.email || '',
          phone: userDoc.profile?.phone || ''
        },
        locations: regions.map(r => ({
          name: r.name,
          location: r.location,
          farmingTypes: r.farmingTypes,
          acreage: r.acreage
        })),
        crops: crops.map(c => ({
          category: c.category,
          commodity: c.commodity,
          variations: c.variations.map((v: any) => ({
            subtype: v.subtype,
            variety: v.variety,
            isOrganic: v.isOrganic,
            seasonality: v.seasonality
          }))
        })),
        certifications: certifications.map(c => ({
          name: c.name,
          type: c.type,
          validUntil: c.validUntil
        })),
        packaging: packaging.map(p => ({
          name: p.name,
          type: p.type,
          sizes: p.sizes
        }))
      }
      
      // Update chatbot config with populated knowledge
      await db.collection('chatbotConfig').updateOne(
        { userId: userDoc._id },
        { 
          $set: {
            farmKnowledge: {
              autoPopulated: true,
              extendedKnowledge: JSON.stringify(knowledgeBase)
            },
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
      
      return { 
        message: 'Farm knowledge populated successfully',
        knowledgeBase
      }
      
    } catch (error) {
      console.error('Populate knowledge error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to populate farm knowledge'
      })
    }
  })
  
  // Deploy chatbot (premium feature)
  fastify.post('/deploy', {
    preHandler: [requireTier('premium')]
  }, async (request, reply) => {
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
      
      // Generate integration code
      const integrationCode = `
<!-- MarketHunt Chatbot -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://api.markethunt.com/chatbot/widget.js';
    script.setAttribute('data-user-id', '${user.id}');
    document.head.appendChild(script);
  })();
</script>
      `.trim()
      
      // Update config as deployed
      await db.collection('chatbotConfig').updateOne(
        { userId: userDoc._id },
        { 
          $set: {
            isDeployed: true,
            integrationCode,
            updatedAt: new Date()
          }
        }
      )
      
      return { 
        message: 'Chatbot deployed successfully',
        integrationCode
      }
      
    } catch (error) {
      console.error('Deploy chatbot error:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to deploy chatbot'
      })
    }
  })
  
  // POST /api/chatbot/chat - Handle chat messages with AI
  fastify.post('/chat', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const chatRequest = request.body as ChatRequest
      
      // Process chat with conversational AI
      const response: ChatResponse = await conversationalAI.processChat(user.id, chatRequest)

      reply.send(response)
    } catch (error) {
      console.error('Error processing chat:', error)
      reply.status(500).send({ 
        error: 'Failed to process chat message',
        message: "I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date()
      })
    }
  })

  // POST /api/chatbot/rebuild-cache - Manually rebuild knowledge cache
  fastify.post('/rebuild-cache', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      await conversationalAI.invalidateKnowledgeCache(user.id)
      reply.send({ message: 'Knowledge cache rebuilt successfully' })
    } catch (error) {
      console.error('Error rebuilding cache:', error)
      reply.status(500).send({ error: 'Failed to rebuild knowledge cache' })
    }
  })

  // Test chatbot (mock endpoint for now)
  fastify.post('/test', async (request, reply) => {
    const { message } = request.body as { message: string }
    
    // Mock chatbot response for now
    const responses = [
      "Thanks for your interest! We grow organic blueberries and citrus fruits on our 500-acre farm in California.",
      "Our blueberries are available from April through September. Would you like current pricing information?",
      "We offer various packaging options including 1lb clamshells, 2lb clamshells, and bulk 18lb flats.",
      "All our products are certified organic and we use sustainable farming practices. How can I help you today?"
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return {
      response: randomResponse,
      timestamp: new Date().toISOString()
    }
  })
}

export default chatbotRoutes
