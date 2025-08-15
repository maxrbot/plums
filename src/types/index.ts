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
  supplierEmail: string;
  supplierName: string;
  fileName: string;
  originalName: string;
  uploadDate: Date;
  status: 'pending' | 'active' | 'expired' | 'archived';
  userId?: string; // For personal suppliers
  date?: string;
  path?: string;
  productCount?: number;
}

export interface PriceSheetProduct {
  _id: ObjectId;
  priceSheetId: ObjectId;
  commodity: string;
  variety?: string;
  size?: string;
  processing?: string;
  packType?: string;
  packSize?: number;
  pricePerUnit: number;
  priceUnit: string;
  minimumOrder?: number;
  quantityAvailable?: number;
  availabilityStart?: string;
  availabilityEnd?: string;
  moisture?: string;
  grade?: string;
  certifications?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Commodity {
  commodity: string;
  organic?: boolean;
  tier: 'basic' | 'price_sheet' | 'verified';
  varieties?: string[];
  productLocations?: string[];
  hasActivePricing: boolean;
  addedVia: 'manual' | 'price_sheet' | 'import';
  addedAt: Date;
  priceSheetId?: ObjectId;
}

export interface PersonalSupplier {
  name: string;
  email: string;
  phone?: string;
  url?: string;
  location?: {
    city: string;
    state: string;
  };
  commodities: string[];
  includeInSearch?: boolean;
}

export interface DeliveryLocation {
  name: string;
  address: string;
  zipcode: string;
}
