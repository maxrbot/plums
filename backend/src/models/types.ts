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
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
    industry?: string
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
    pricesheet?: {
      deliveryMethod?: 'link' | 'inline'
      defaultEmailMessage?: string
      companyLogo?: string | null
    }
  }
  
  pricesheetSettings?: {
    deliveryMethod?: 'link' | 'inline'
    defaultEmailMessage?: string
    companyLogo?: string | null
  }
  
  packagingStructure?: {
    [commodityId: string]: {
      packageTypes: Array<{ id: string; name: string }>
      sizeGrades: Array<{ id: string; name: string }>
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

// Shipping Points (formerly Growing Regions)
export interface ShippingPoint extends BaseDocument {
  userId: ObjectId
  name: string
  facilityType?: 'cooler' | 'warehouse' | 'packing_house' | 'distribution_center' | 'farm_direct'
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
  operationTypes: string[] // ["Organic", "Conventional", "Specialty", etc.]
  capacity?: string // "50,000 cases", "1,000 pallets", etc.
  notes?: string
  source?: 'manual' | 'erp_import' // Track origin
  // New shipping capabilities
  shipping?: {
    zones?: string[] // ["West Coast", "Southwest", etc.]
    methods?: string[] // ["Truck", "Rail", "Air", etc.]
    leadTime?: number // Days
    minimumOrder?: number // Cases/pallets
  }
  // Legacy fields for backward compatibility
  farmingTypes?: string[]
  acreage?: string
}

// Keep the old interface for backward compatibility during migration
export interface GrowingRegion extends ShippingPoint {
  // This is now an alias for ShippingPoint
}

// Crop Management
export interface CropManagement extends BaseDocument {
  userId: ObjectId
  category: string // "Berries", "Citrus", etc.
  commodity: string // "blueberries", "oranges", etc.
  variations: CropVariation[]
  source?: 'manual' | 'scraped'
}

export interface GrowingRegionConfig {
  regionId: string
  regionName: string
  seasonality: {
    startMonth: number
    endMonth: number
    isYearRound: boolean
  }
}

export interface CropVariation {
  id: string
  subtype?: string // "Blood Orange", "Navel Orange"
  variety?: string // "Cara Cara", "Valencia"
  isOrganic: boolean
  growingRegions: GrowingRegionConfig[] // Array of region configurations
  targetPricing?: {
    minPrice?: number
    maxPrice?: number
    unit: string
    notes?: string
  }
  growingPractices?: string[]
  minOrder?: number
  orderUnit?: string // "pallets", "cases", "dollars"
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
  status: 'draft' | 'active' | 'sent' | 'archived'
  productIds: ObjectId[] // Array of PriceSheetProduct IDs
  productsCount: number // Computed from productIds.length
  totalValue?: number
  sentTo?: ObjectId[] // References to Contact
  sentAt?: Date
  notes?: string
  priceType?: 'FOB' | 'DELIVERED' // Price type for the entire sheet
}

// Price Sheet Products (individual entries)
export interface PriceSheetProduct extends BaseDocument {
  priceSheetId: ObjectId
  userId: ObjectId
  
  // References (for data integrity)
  cropId: ObjectId // Reference to CropManagement
  variationId: string // ID within the crop variations
  regionId?: ObjectId // Reference to GrowingRegion
  
  // Denormalized product details (for performance)
  productName: string // e.g., "Organic Lime Key Lime"
  category: string // e.g., "citrus"
  commodity: string // e.g., "lime"
  variety?: string // e.g., "Key Lime"
  subtype?: string // e.g., "Conventional" or "Organic"
  isOrganic: boolean
  regionName?: string // e.g., "Central Valley - Fresno"
  
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

// Chatbot Configuration
export interface ChatbotConfig extends BaseDocument {
  userId: ObjectId
  
  // Bot Configuration
  botName: string
  personality: 'friendly' | 'professional'
  primaryGoal: 'product_info' | 'lead_generation'
  responseStrategy: 'hybrid'
  welcomeMessage: string
  fallbackMessage: string
  outOfSeasonMessage: string
  integrationStyle: 'chat_bubble' | 'coming_soon'
  widgetColor: string
  
  // Extended Knowledge
  extendedKnowledge: {
    businessOperations: {
      farmersMarkets: string
      farmTours: string
      csaPrograms: string
      pickYourOwn: string
    }
    productInfo: {
      seasonalAvailability: string
      productSamples: string
      specialtyItems: string
      storageHandling: string
    }
    businessTerms: {
      paymentTerms: string
      minimumOrders: string
      deliveryOptions: string
      pricingPolicy: string
    }
    farmStory: {
      history: string
      farmingPractices: string
      sustainability: string
      familyCompanyStory: string
    }
    marketingInfo: {
      marketAvailability: string
      retailDistribution: string
      frequentlyAskedQuestions: string
    }
  }
  
  // Toggle States
  enabledSections: {
    businessOperations: {
      farmersMarkets: boolean
      farmTours: boolean
      csaPrograms: boolean
      pickYourOwn: boolean
    }
    productInfo: {
      seasonalAvailability: boolean
      productSamples: boolean
      specialtyItems: boolean
      storageHandling: boolean
    }
    businessTerms: {
      paymentTerms: boolean
      minimumOrders: boolean
      deliveryOptions: boolean
      pricingPolicy: boolean
    }
    farmStory: {
      history: boolean
      farmingPractices: boolean
      sustainability: boolean
      familyCompanyStory: boolean
    }
    marketingInfo: {
      marketAvailability: boolean
      retailDistribution: boolean
      frequentlyAskedQuestions: boolean
    }
  }
  
  // Status
  isActive: boolean
}

// Farm Knowledge Cache - aggregated data for fast chatbot access
export interface FarmKnowledgeCache extends BaseDocument {
  userId: ObjectId
  
  // Farm Profile
  farmProfile: {
    name: string
    contact: {
      email: string
      phone?: string
      website?: string
    }
    locations: string[]
    story?: {
      history?: string
      farmingPractices?: string
      sustainability?: string
      familyStory?: string
    }
  }
  
  // Products & Crops
  products: Array<{
    commodity: string
    varieties: Array<{
      name: string
      isOrganic: boolean
      regions: string[]
      seasonality: string
      currentPrice?: string
      packaging?: string[]
    }>
  }>
  
  // Business Information
  businessInfo: {
    certifications: string[]
    services?: {
      farmersMarkets?: string
      farmTours?: string
      csaPrograms?: string
      pickYourOwn?: string
    }
    terms?: {
      paymentTerms?: string
      minimumOrders?: string
      deliveryOptions?: string
      pricingPolicy?: string
    }
    productInfo?: {
      seasonalAvailability?: string
      productSamples?: string
      specialtyItems?: string
      storageHandling?: string
    }
  }
  
  // Bot Configuration
  botConfig: {
    botName: string
    personality: 'friendly' | 'professional'
    primaryGoal: 'product_info' | 'lead_generation'
    welcomeMessage: string
    fallbackMessage: string
    outOfSeasonMessage: string
    widgetColor: string
  }
  
  // Cache metadata
  lastUpdated: Date
  version: number
}

// Chat Message Types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
}

export interface ChatResponse {
  message: string
  timestamp: Date
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
