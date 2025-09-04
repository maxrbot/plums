import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string; // Hashed with bcrypt
  role: 'supplier' | 'buyer' | 'admin';
  createdAt: Date;
  last_updated: Date;
  
  // Optional fields
  phone?: string;
  
  // Profile data (for buyers)
  profile?: {
    company?: string;
    location?: string;
    bio?: string;
    wishlist?: string[];
    suppliers?: PersonalSupplier[];
    locations?: DeliveryLocation[];
    preferences?: {
      commodities?: string[];
      supplierTypes?: string[];
    };
  };
  
  // Notification settings
  notificationSettings?: {
    emailReplies: boolean;
    smsReplies: boolean;
    ccOnOutreach: boolean;
    dailyDigest: boolean;
  };
  
  // Subscription & features
  subscription?: {
    tier: 'basic' | 'premium' | 'enterprise';
    features: string[];
    expiresAt?: Date;
  };
}

export interface Supplier {
  _id: ObjectId;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  url?: string;
  
  // Location
  location?: {
    city: string;
    state: string;
    coords: [number, number];
  };
  
  // Ownership & visibility
  ownership: {
    type: 'personal' | 'network' | 'supplier-user';
    users: string[]; // User emails
  };
  
  // Commodities & capabilities
  commodities: Commodity[];
  organicClassification?: 'fully_organic' | 'mixed' | 'conventional_only';
  
  // Metadata
  notes?: string;
  metadata?: {
    createdBy: string;
    createdFor?: string;
    createdByRole: string;
    createdAt: Date;
  };
  createdAt: Date;
  last_updated: Date;
}

export interface PriceSheet {
  _id: ObjectId;
  title: string;
  name?: string; // Keep for backward compatibility
  supplierId?: ObjectId;
  userId: ObjectId;
  status: 'draft' | 'sent' | 'archived';
  productIds: ObjectId[];
  productsCount: number;
  totalValue?: number;
  sentTo?: ObjectId[];
  sentAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  last_updated?: Date; // Keep for backward compatibility
}

export interface PriceSheetProduct {
  _id: ObjectId;
  priceSheetId: ObjectId;
  cropId: ObjectId;
  price: number;
  unit: string;
  minOrder: number;
  maxOrder: number;
}

export interface Commodity {
  _id: ObjectId;
  name: string;
  category: string;
  variety?: string;
}

export interface PersonalSupplier {
  _id: ObjectId;
  userId: ObjectId;
  supplierId: ObjectId;
  notes?: string;
  createdAt: Date;
}

export interface DeliveryLocation {
  _id: ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: [number, number];
}

export interface GrowingRegion {
  id: number | string;
  name: string;
  city: string;
  state: string;
  climate: string;
  soilType: string;
  deliveryZones: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  // Additional fields for API integration
  farmingTypes?: string[];
  acreage?: string;
  notes?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    placeId?: string;
    formattedAddress?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface CropVariation {
  id: string;
  subtype?: string;      // Optional subtype (e.g., "cherry", "roma")
  variety?: string;      // Optional variety (e.g., "Sweet 100", "San Marzano")
  isOrganic: boolean;
  growingRegions: GrowingRegionConfig[];
  targetPricing: {
    minPrice: number;
    maxPrice: number;
    unit: string;
    notes: string;
  };
  growingPractices: string[];
  minOrder: number;
  orderUnit: string;
  notes: string;
}

export interface GrowingRegionConfig {
  regionId: string;
  regionName: string;
  seasonality: {
    startMonth: number;
    endMonth: number;
    isYearRound: boolean;
  };
}

export interface CropManagement {
  id: string;
  category: string;
  commodity: string;
  variations: CropVariation[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Capability {
  id: number;
  name: string;
  type: 'certification' | 'food_safety' | 'sustainability' | 'quality' | 'processing' | 'packaging';
  status: 'active' | 'pending' | 'expired' | 'suspended';
  validUntil: string | null;
  description: string;
  appliesTo: string[];
  growingRegions: string[];
  documents: string[];
  notes: string;
  createdAt: string;
}

// Contact Management System
export interface ContactTag {
  id: string;
  name: string;
  type: 'tier' | 'priority' | 'region' | 'crop_interest' | 'custom';
  color: string;
  description?: string;
}

export interface ContactInteraction {
  id: string;
  type: 'email_sent' | 'phone_call' | 'meeting' | 'order_placed' | 'quote_requested';
  date: string;
  description: string;
  outcome?: string;
  priceSheetId?: string;
}

export interface Contact {
  id: string;
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  
  // Company Info
  company: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  website?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Business Details
  tags: string[]; // Array of tag IDs
  primaryCrops: string[]; // Crops they're most interested in
  orderFrequency?: 'weekly' | 'monthly' | 'seasonal' | 'sporadic';
  averageOrderValue?: number;
  preferredContactMethod?: 'email' | 'phone' | 'text';
  
  // Relationship Status
  status: 'prospect' | 'active' | 'inactive' | 'do_not_contact';
  relationshipStage: 'cold' | 'warm' | 'hot' | 'customer';
  
  // History & Tracking
  interactions: ContactInteraction[];
  lastContactDate?: string;
  firstOrderDate?: string;
  lastOrderDate?: string;
  totalOrders: number;
  lifetimeValue: number;
  
  // Pricing & Preferences
  pricingTier: 'premium' | 'standard' | 'volume' | 'new_prospect';
  pricingAdjustment: number; // Percentage adjustment (+/- from base pricing)
  specialTerms?: string;
  
  // System Fields
  source: 'manual' | 'csv_import' | 'lead_form' | 'referral';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactIds: string[];
  tags: string[]; // Auto-include contacts with these tags
  filters: {
    pricingTier?: string[];
    relationshipStage?: string[];
    status?: string[];
    primaryCrops?: string[];
    companySize?: string[];
  };
  isSmartList: boolean; // Auto-updates based on filters
  createdAt: string;
  updatedAt: string;
}
