import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import database from '../config/database'
import { User, Organization } from '../models/types'

function generateInviteCode(): string {
  // e.g. "XK92-MF4A" — 8 hex chars split by a dash
  const raw = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  companyName?: string
  contactName?: string
  inviteCode?: string
}

// Converts a company name to a URL/invite-code safe slug: "Riverside Farms" → "riversidefarms"
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export class AuthService {
  
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }
  
  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  
  /**
   * Generate JWT tokens
   */
  static generateTokens(userId: string, email: string): AuthTokens {
    const payload = { userId, email, iat: Math.floor(Date.now() / 1000) }
    const secret = JWT_SECRET as string
    
    const accessToken = jwt.sign(payload, secret)
    const refreshToken = jwt.sign(payload, secret)
    
    return { accessToken, refreshToken }
  }
  
  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as any
      
      return {
        userId: decoded.userId,
        email: decoded.email
      }
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
  
  /**
   * Register a new user.
   * - inviteCode === 'early2025' (or missing): create a new org, user becomes owner
   * - inviteCode matches an existing org slug: join that org as a member
   */
  static async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const db = database.getDb()

    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email: data.email })
    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    const EARLY_ACCESS_CODE = 'early2025'
    const code = (data.inviteCode || '').trim().toLowerCase()
    const isNewOrg = !code || code === EARLY_ACCESS_CODE

    let orgId: string
    let role: 'owner' | 'member'

    if (isNewOrg) {
      // Create a new organisation
      if (!data.companyName) throw new Error('Company name is required to create an account')
      const slug = slugify(data.companyName)
      const existingOrg = await db.collection<Organization>('organizations').findOne({ slug })
      if (existingOrg) throw new Error('An account with that company name already exists')

      const orgResult = await db.collection<Organization>('organizations').insertOne({
        name: data.companyName,
        slug,
        inviteCode: generateInviteCode(),
        ownerId: '', // set after user is created
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      orgId = orgResult.insertedId.toString()
      role = 'owner'
    } else {
      // Join an existing org by invite code
      const org = await db.collection<Organization>('organizations').findOne({ inviteCode: code.toUpperCase() })
      if (!org) throw new Error('Invite code not recognised. Check with your account owner.')
      orgId = org._id!.toString()
      role = 'member'
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password)

    // Create user document
    const newUser: Omit<User, '_id'> = {
      id: '',
      email: data.email,
      password: hashedPassword,
      subscriptionTier: 'basic',
      orgId,
      role,
      profile: {
        companyName: data.companyName || '',
        contactName: data.contactName || '',
        email: data.email,
        phone: '',
        website: ''
      },
      preferences: {
        defaultPriceUnit: 'lb',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        notifications: { email: true, priceAlerts: true, marketUpdates: false }
      },
      billing: { plan: 'Basic', billingCycle: 'monthly' },
      integrations: { quickbooks: false, hubspot: false, mailchimp: false },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<User>('users').insertOne(newUser)
    const userId = result.insertedId.toString()

    // Back-fill the string id
    await db.collection<User>('users').updateOne(
      { _id: result.insertedId },
      { $set: { id: userId } }
    )

    // If this user is the owner, record their id on the org
    if (role === 'owner') {
      const { ObjectId } = await import('mongodb')
      await db.collection<Organization>('organizations').updateOne(
        { _id: new ObjectId(orgId) },
        { $set: { ownerId: userId } }
      )
    }

    const createdUser = await db.collection<User>('users').findOne({ _id: result.insertedId })
    if (!createdUser) throw new Error('Failed to create user')

    const tokens = this.generateTokens(userId, data.email)
    const { password, ...userWithoutPassword } = createdUser

    return { user: userWithoutPassword as User, tokens }
  }
  
  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const db = database.getDb()
    
    // Find user by email
    const user = await db.collection<User & { password: string }>('users').findOne({ 
      email: credentials.email 
    })
    
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    // Verify password
    const isValidPassword = await this.verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }
    
    // Update last login
    await db.collection<User>('users').updateOne(
      { _id: user._id },
      { $set: { updatedAt: new Date() } }
    )
    
    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return {
      user: userWithoutPassword as User,
      tokens
    }
  }
  
  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const db = database.getDb()
    
    const user = await db.collection<User>('users').findOne({ id: userId })
    return user
  }
}
