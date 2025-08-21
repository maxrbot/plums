import { ObjectId } from 'mongodb'

// Base interface for all documents
export interface BaseDocument {
  _id?: ObjectId
  createdAt: Date
  updatedAt: Date
}

// User and Settings
export interface User extends BaseDocument {
  id: string // MongoDB ObjectId as string
  email: string
  password?: string // Optional for responses (excluded in most cases)
  subscriptionTier: 'basic' | 'premium' | 'enterprise'
  
  // Embedded settings (from dashboard/settings tabs)
  profile: {
    companyName: string
    contactName: string
    email: string
    phone: string
    website?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  
  preferences: {
    defaultPriceUnit: string
    timezone: string
    currency: string
    notifications: {
      email: boolean
      priceAlerts: boolean
      marketUpdates: boolean
    }
  }
  
  billing: {
    plan: string
    billingCycle: 'monthly' | 'annual'
    nextBillingDate?: Date
    paymentMethod?: string
  }
  
  integrations: {
    quickbooks: boolean
    hubspot: boolean
    mailchimp: boolean
    customApi?: {
      enabled: boolean
      apiKey?: string
    }
  }
}

// Growing Regions
export interface GrowingRegion extends BaseDocument {
  userId: ObjectId
  name: string
  location: {
    // Google Places API data
    placeId?: string
    formattedAddress?: string
    city?: string
    state?: string
    country?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  farmingTypes: string[] // ["Organic", "Specialty Crops", etc.]
  acreage?: string // "100-500", "500+", etc.
  notes?: string
  source?: 'manual' | 'scraped' // Track origin
}

// Crop Management
export interface CropManagement extends BaseDocument {
  userId: ObjectId
  category: string // "Berries", "Citrus", etc.
  commodity: string // "blueberries", "oranges", etc.
  variations: CropVariation[]
  source?: 'manual' | 'scraped'
}

export interface CropVariation {
  id: string
  subtype?: string // "Blood Orange", "Navel Orange"
  variety?: string // "Cara Cara", "Valencia"
  isOrganic: boolean
  growingRegions: ObjectId[] // References to GrowingRegion
  seasonality?: string
  targetPricing?: {
    minPrice?: number
    maxPrice?: number
    unit: string
  }
  orderRequirements?: {
    minOrder?: number
    orderUnit: string // "pallets", "cases", "dollars"
  }
  growingPractices?: string[]
  certifications?: string[]
  notes?: string
}

// Certifications (simplified from capabilities)
export interface Certification extends BaseDocument {
  userId: ObjectId
  name: string
  type: string // "Organic", "Fair Trade", etc.
  validUntil?: Date
  appliesTo: ObjectId[] // References to CropManagement
  documentUrl?: string
  notes?: string
  source?: 'manual' | 'scraped'
}

// Custom Packaging
export interface CustomPackaging extends BaseDocument {
  userId: ObjectId
  name: string
  type: string // "Clamshell", "Carton", etc.
  sizes: PackagingSize[]
  appliesTo: ObjectId[] // References to CropManagement
  notes?: string
}

export interface PackagingSize {
  id: string
  size: string
  unit: string // "lb", "oz", "count"
  description?: string
}

// Price Sheets (core metadata)
export interface PriceSheet extends BaseDocument {
  userId: ObjectId
  title: string
  status: 'draft' | 'sent' | 'archived'
  productsCount: number
  totalValue?: number
  sentTo?: ObjectId[] // References to Contact
  sentAt?: Date
  notes?: string
}

// Price Sheet Products (individual entries)
export interface PriceSheetProduct extends BaseDocument {
  priceSheetId: ObjectId
  userId: ObjectId
  
  // Product details
  cropId: ObjectId // Reference to CropManagement
  variationId: string // ID within the crop variations
  regionId?: ObjectId // Reference to GrowingRegion
  
  // Pricing and packaging
  packageType: string
  countSize?: string
  grade?: string
  price: number
  marketPrice?: number
  marketPriceUnit?: string
  marketPriceDate?: Date
  
  // Availability and selection
  availability: string
  isSelected: boolean
  
  // Customer-specific
  customNote?: string // For specific customers
  discountPercent?: number // Customer-specific pricing
}

// Contacts
export interface Contact extends BaseDocument {
  userId: ObjectId
  
  // Basic info
  name: string
  email: string
  company: string
  title?: string
  phone?: string
  
  // Business details
  pricingTier?: string
  primaryCrops?: string[]
  tags: string[]
  
  // CRM data
  totalOrders?: number
  lifetimeValue?: number
  lastContact?: Date
  
  notes?: string
  isActive: boolean
}

// Chatbot Configuration (placeholder for future)
export interface ChatbotConfig extends BaseDocument {
  userId: ObjectId
  
  // Knowledge base
  farmKnowledge: {
    autoPopulated: boolean
    extendedKnowledge?: string
  }
  
  // Configuration
  botName?: string
  personality?: string
  integrationStyle?: 'embed' | 'popup'
  responseStrategy?: 'pricing' | 'sales' | 'info' | 'hybrid'
  
  // Deployment
  isDeployed: boolean
  integrationCode?: string
}

// Scraped Data (for future website scraping)
export interface ScrapedData extends BaseDocument {
  userId: ObjectId
  sourceUrl: string
  scrapedAt: Date
  
  extractedData: {
    companyInfo?: {
      name?: string
      description?: string
      confidence: 'high' | 'medium' | 'low'
    }
    regions?: any[]
    commodities?: any[]
    certifications?: any[]
    contact?: any
    sustainability?: any
  }
  
  status: 'pending' | 'reviewed' | 'imported' | 'rejected'
  userActions?: any[]
  importedTo?: {
    regions: ObjectId[]
    commodities: ObjectId[]
    certifications: ObjectId[]
    userProfile: boolean
  }
}
