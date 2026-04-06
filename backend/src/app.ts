import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import database from './config/database'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import regionsRoutes from './routes/regions'
import shippingPointsRoutes from './routes/shippingPoints'
import cropsRoutes from './routes/crops'
import certificationsRoutes from './routes/certifications'
import packagingRoutes from './routes/packaging'
import priceSheetsRoutes from './routes/priceSheets'
import adminRoutes from './routes/admin'
  import contactsRoutes from './routes/contacts'
  import chatbotRoutes from './routes/chatbot'
  import chatbotConfigRoutes from './routes/chatbotConfig'
import publicRoutes from './routes/public'
import analyticsRoutes from './routes/analytics'
import webhooksRoutes from './routes/webhooks'
import produceHuntRoutes from './routes/producehunt'
import retailSalesRoutes from './routes/retailSales'
import usdaMarketRoutes from './routes/usdaMarket'
import teamRoutes from './routes/team'
import contactBatchesRoutes from './routes/contactBatches'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
})

// Register plugins
async function registerPlugins() {
  // CORS - Register BEFORE helmet!
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://acrelist.ag',
        'https://www.acrelist.ag',
        'https://app.acrelist.ag',
        'https://acrelist-platform.vercel.app',
        'https://acrelist-marketing.vercel.app'
      ]
    : true // Allow all origins in development
  
  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
  
  // Security
  await fastify.register(helmet, {
    crossOriginResourcePolicy: false // Allow CORS
  })
  
  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })
}

// Register routes
async function registerRoutes() {
  // Public routes (no auth required)
  await fastify.register(publicRoutes, { prefix: '/api/public' })
  await fastify.register(webhooksRoutes, { prefix: '/api/webhooks' })
  
  // Protected routes (auth required)
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
  await fastify.register(adminRoutes, { prefix: '/api/admin' })
  await fastify.register(produceHuntRoutes, { prefix: '/api/directory' })
  await fastify.register(retailSalesRoutes, { prefix: '/api' })
  await fastify.register(usdaMarketRoutes, { prefix: '/api' })
  await fastify.register(teamRoutes, { prefix: '/api/team' })
  await fastify.register(contactBatchesRoutes, { prefix: '/api/contact-batches' })
}

// Public invite code validation (no auth — used during signup)
fastify.get('/api/team/verify-invite', async (request, reply) => {
  const { code } = request.query as { code?: string }
  if (!code) return reply.status(400).send({ error: 'code required' })
  const db = database.getDb()
  const org = await db.collection('organizations').findOne({ inviteCode: code.trim().toUpperCase() })
  if (!org) return reply.status(404).send({ error: 'Invalid invite code' })
  return { valid: true, orgName: org.name }
})

// Health check
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? 'connected' : 'disconnected'
  }
})

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error)
  
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    })
    return
  }
  
  if (error.statusCode) {
    reply.status(error.statusCode).send({
      error: error.name,
      message: error.message
    })
    return
  }
  
  reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message
  })
})

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down gracefully...')
  
  try {
    await fastify.close()
    await database.disconnect()
    console.log('✅ Server closed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const start = async () => {
  try {
    // Connect to database
    await database.connect()
    
    // Register plugins and routes
    await registerPlugins()
    await registerRoutes()
    
    // Start server
    const port = parseInt(process.env.PORT || '3001', 10)
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
    
    await fastify.listen({ port, host })
    console.log(`🚀 MarketHunt API server running on http://${host}:${port}`)
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

start()
