import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/authService'
import database from '../config/database'
import { User } from '../models/types'

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string
    email: string
    subscriptionTier: 'basic' | 'premium' | 'enterprise' | 'admin'
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = AuthService.verifyToken(token)
    
    // Get user from our database
    const dbUser = await AuthService.getUserById(decoded.userId)
    
    if (!dbUser) {
      return reply.status(404).send({
        error: 'User Not Found',
        message: 'User not found in database'
      })
    }
    
    // Add user info to request
    ;(request as AuthenticatedRequest).user = {
      id: dbUser.id,
      email: dbUser.email,
      subscriptionTier: dbUser.subscriptionTier
    }
    
  } catch (error) {
    console.error('Authentication error:', error)
    return reply.status(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Failed to authenticate user'
    })
  }
}

// Subscription tier check middleware
export const requireTier = (requiredTier: 'basic' | 'premium' | 'enterprise') => {
  const tierLevels = { basic: 1, premium: 2, enterprise: 3, admin: 999 }
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authRequest = request as AuthenticatedRequest
    
    if (!authRequest.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }
    
    const userTierLevel = tierLevels[authRequest.user.subscriptionTier]
    const requiredTierLevel = tierLevels[requiredTier]
    
    if (userTierLevel < requiredTierLevel) {
      return reply.status(403).send({
        error: 'Insufficient Subscription',
        message: `This feature requires ${requiredTier} subscription or higher`
      })
    }
  }
}
