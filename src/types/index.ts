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
  name: string;
  supplierId: ObjectId;
  status: 'draft' | 'active' | 'inactive';
  createdAt: Date;
  last_updated: Date;
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
  id: number;
  name: string;
  city: string;
  state: string;
  climate: string;
  soilType: string;
  deliveryZones: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CropVariation {
  id: string;
  variety: string;
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
  maxOrder: number;
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
