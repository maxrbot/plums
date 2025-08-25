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
import cropsRoutes from './routes/crops'
import certificationsRoutes from './routes/certifications'
import packagingRoutes from './routes/packaging'
import priceSheetsRoutes from './routes/priceSheets'
  import contactsRoutes from './routes/contacts'
  import chatbotRoutes from './routes/chatbot'
  import chatbotConfigRoutes from './routes/chatbotConfig'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
})

// Register plugins
async function registerPlugins() {
  // Security
  await fastify.register(helmet)
  
  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
  
  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })
}

// Register routes
async function registerRoutes() {
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(userRoutes, { prefix: '/api/users' })
  await fastify.register(regionsRoutes, { prefix: '/api/regions' })
  await fastify.register(cropsRoutes, { prefix: '/api/crops' })
  await fastify.register(certificationsRoutes, { prefix: '/api/certifications' })
  await fastify.register(packagingRoutes, { prefix: '/api/packaging' })
  await fastify.register(priceSheetsRoutes, { prefix: '/api/price-sheets' })
      await fastify.register(contactsRoutes, { prefix: '/api/contacts' })
    await fastify.register(chatbotRoutes, { prefix: '/api/chatbot' })
    await fastify.register(chatbotConfigRoutes, { prefix: '/api/chatbot-config' })
}

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
