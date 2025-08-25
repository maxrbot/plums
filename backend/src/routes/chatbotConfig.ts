import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { ChatbotConfig } from '../models/types'
import conversationalAI from '../services/conversationalAI'

const chatbotConfigRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Add auth middleware to all routes
  fastify.addHook('preHandler', authenticate)

  // GET /api/chatbot-config - Get user's chatbot configuration
  fastify.get('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const config = await db.collection<ChatbotConfig>('chatbotConfigs')
        .findOne({ userId: userDoc._id })

      if (!config) {
        // Return default config structure
        const defaultConfig = {
          botName: 'Farm Assistant',
          personality: 'friendly',
          primaryGoal: 'product_info',
          responseStrategy: 'hybrid',
          welcomeMessage: 'Hi! How can I help you learn about our farm and products?',
          fallbackMessage: "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
          outOfSeasonMessage: 'That product is currently out of season. It will be available again soon.',
          integrationStyle: 'chat_bubble',
          widgetColor: '#10b981',
          extendedKnowledge: {
            businessOperations: {
              farmersMarkets: '',
              farmTours: '',
              csaPrograms: '',
              pickYourOwn: ''
            },
            productInfo: {
              seasonalAvailability: '',
              productSamples: '',
              specialtyItems: '',
              storageHandling: ''
            },
            businessTerms: {
              paymentTerms: '',
              minimumOrders: '',
              deliveryOptions: '',
              pricingPolicy: ''
            },
            farmStory: {
              history: '',
              farmingPractices: '',
              sustainability: '',
              familyStory: ''
            }
          },
          enabledSections: {
            businessOperations: {
              farmersMarkets: false,
              farmTours: false,
              csaPrograms: false,
              pickYourOwn: false
            },
            productInfo: {
              seasonalAvailability: false,
              productSamples: false,
              specialtyItems: false,
              storageHandling: false
            },
            businessTerms: {
              paymentTerms: false,
              minimumOrders: false,
              deliveryOptions: false,
              pricingPolicy: false
            },
            farmStory: {
              history: false,
              farmingPractices: false,
              sustainability: false,
              familyStory: false
            }
          },
          isActive: false
        }
        return reply.send(defaultConfig)
      }

      // Transform _id to id for frontend
      const { _id, ...configData } = config
      reply.send({ id: _id, ...configData })
    } catch (error) {
      console.error('Error fetching chatbot config:', error)
      reply.status(500).send({ error: 'Failed to fetch chatbot configuration' })
    }
  })

  // POST /api/chatbot-config - Create or update chatbot configuration
  fastify.post('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const configData = request.body as Partial<ChatbotConfig>
      
      const updatedConfig = await db.collection<ChatbotConfig>('chatbotConfigs')
        .findOneAndUpdate(
          { userId: userDoc._id },
          { 
            $set: {
              ...configData,
              userId: userDoc._id,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { 
            upsert: true, 
            returnDocument: 'after' 
          }
        )

      if (!updatedConfig) {
        return reply.status(500).send({ error: 'Failed to save configuration' })
      }

      // Note: Cache will be updated when user manually syncs

      // Transform _id to id for frontend
      const { _id, ...responseData } = updatedConfig
      reply.send({ id: _id, ...responseData })
    } catch (error) {
      console.error('Error saving chatbot config:', error)
      reply.status(500).send({ error: 'Failed to save chatbot configuration' })
    }
  })

  // DELETE /api/chatbot-config - Reset chatbot configuration
  fastify.delete('/', async (request, reply) => {
    const { user } = request as AuthenticatedRequest
    
    try {
      const db = database.getDb()
      const userDoc = await db.collection('users').findOne({ id: user.id })
      
      if (!userDoc) {
        return reply.status(404).send({ error: 'User not found' })
      }

      await db.collection<ChatbotConfig>('chatbotConfigs')
        .deleteOne({ userId: userDoc._id })

      // Note: Cache will be updated when user manually syncs

      reply.send({ message: 'Chatbot configuration reset successfully' })
    } catch (error) {
      console.error('Error resetting chatbot config:', error)
      reply.status(500).send({ error: 'Failed to reset chatbot configuration' })
    }
  })
}

export default chatbotConfigRoutes
