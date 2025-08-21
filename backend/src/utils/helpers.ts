import { ObjectId } from 'mongodb'

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id)
}

/**
 * Convert string to ObjectId safely
 */
export const toObjectId = (id: string): ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`)
  }
  return new ObjectId(id)
}

/**
 * Generate a random string for API keys, tokens, etc.
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim()
}

/**
 * Format error messages consistently
 */
export const formatError = (error: any): { error: string; message: string } => {
  if (error.name === 'ValidationError') {
    return {
      error: 'Validation Error',
      message: error.message
    }
  }
  
  if (error.code === 11000) {
    return {
      error: 'Duplicate Entry',
      message: 'A record with this information already exists'
    }
  }
  
  return {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message
  }
}

/**
 * Calculate pagination offset
 */
export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Convert cents to dollars for display
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100
}

/**
 * Convert dollars to cents for storage
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100)
}
