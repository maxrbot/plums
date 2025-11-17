// Vercel Serverless Function Entry Point
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import database from '../dist/config/database.js'

// Import routes
import authRoutes from '../dist/routes/auth.js'
import userRoutes from '../dist/routes/users.js'
import regionsRoutes from '../dist/routes/regions.js'
import shippingPointsRoutes from '../dist/routes/shippingPoints.js'
import cropsRoutes from '../dist/routes/crops.js'
import certificationsRoutes from '../dist/routes/certifications.js'
import packagingRoutes from '../dist/routes/packaging.js'
import priceSheetsRoutes from '../dist/routes/priceSheets.js'
import contactsRoutes from '../dist/routes/contacts.js'
import chatbotRoutes from '../dist/routes/chatbot.js'
import chatbotConfigRoutes from '../dist/routes/chatbotConfig.js'
import publicRoutes from '../dist/routes/public.js'
import analyticsRoutes from '../dist/routes/analytics.js'
import webhooksRoutes from '../dist/routes/webhooks.js'

const fastify = Fastify({
  logger: false // Disable logging for serverless
})

// Register plugins
async function setup() {
  // CORS
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://acrelist.ag', 'https://www.acrelist.ag', 'https://app.acrelist.ag']
    : true

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })

  // Security
  await fastify.register(helmet, {
    crossOriginResourcePolicy: false
  })

  // Connect to database
  if (!database.isConnected()) {
    await database.connect()
  }

  // Register routes
  await fastify.register(publicRoutes, { prefix: '/api/public' })
  await fastify.register(webhooksRoutes, { prefix: '/api/webhooks' })
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(userRoutes, { prefix: '/api/users' })
  await fastify.register(regionsRoutes, { prefix: '/api/regions' })
  await fastify.register(shippingPointsRoutes, { prefix: '/api/shipping-points' })
  await fastify.register(cropsRoutes, { prefix: '/api/crops' })
  await fastify.register(certificationsRoutes, { prefix: '/api/certifications' })
  await fastify.register(packagingRoutes, { prefix: '/api/packaging' })
  await fastify.register(priceSheetsRoutes, { prefix: '/api/price-sheets' })
  await fastify.register(contactsRoutes, { prefix: '/api/contacts' })
  await fastify.register(chatbotRoutes, { prefix: '/api/chatbot' })
  await fastify.register(chatbotConfigRoutes, { prefix: '/api/chatbot-config' })
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' })

  // Health check
  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: database.isConnected() ? 'connected' : 'disconnected'
    }
  })

  await fastify.ready()
}

// Initialize on first request
let initialized = false

export default async function handler(req, res) {
  if (!initialized) {
    await setup()
    initialized = true
  }

  await fastify.ready()
  fastify.server.emit('request', req, res)
}

