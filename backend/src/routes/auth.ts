import { FastifyPluginAsync } from 'fastify'
import { AuthService, LoginCredentials, RegisterData } from '../services/authService'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Register new user
  fastify.post('/register', async (request, reply) => {
    const registerData = request.body as RegisterData
    
    if (!registerData.email || !registerData.password) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Email and password are required'
      })
    }
    
    if (registerData.password.length < 6) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Password must be at least 6 characters long'
      })
    }
    
    try {
      const result = await AuthService.register(registerData)
      
      return {
        message: 'User registered successfully',
        user: result.user,
        tokens: result.tokens
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error instanceof Error && error.message === 'User already exists with this email') {
        return reply.status(409).send({
          error: 'Conflict',
          message: error.message
        })
      }
      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to register user'
      })
    }
  })
  
  // Login user
  fastify.post('/login', async (request, reply) => {
    const credentials = request.body as LoginCredentials
    
    if (!credentials.email || !credentials.password) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Email and password are required'
      })
    }
    
    try {
      const result = await AuthService.login(credentials)
      
      return {
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens
      }
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error instanceof Error && error.message === 'Invalid email or password') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: error.message
        })
      }
      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to login user'
      })
    }
  })
  
  // Verify token (for frontend to check if user is still authenticated)
  fastify.get('/verify', async (request, reply) => {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      })
    }
    
    const token = authHeader.substring(7)
    
    try {
      const decoded = AuthService.verifyToken(token)
      const user = await AuthService.getUserById(decoded.userId)
      
      if (!user) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        })
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user
      
      return {
        user: userWithoutPassword,
        valid: true
      }
      
    } catch (error) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      })
    }
  })
  
  // Logout (simple - just tells frontend to remove token)
  fastify.post('/logout', async (request, reply) => {
    // With JWT, logout is handled client-side by removing the token
    // In a production app, you might want to maintain a blacklist of tokens
    return { message: 'Logged out successfully' }
  })
}

export default authRoutes
