export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  
  // AI Configuration (for future Claude integration)
  ai: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4000,
  },
  
  // Authentication (for future Supabase integration)
  auth: {
    redirectUrl: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || 'http://localhost:3000/dashboard',
  },
  
  // Feature flags for progressive feature unlocking
  features: {
    priceSheetGenerator: true,
    cropChat: true,
    analytics: false, // Will unlock with more data
    marketplace: false, // Phase 2 feature
  },
  
  // Subscription tiers
  tiers: {
    basic: {
      price: 50,
      features: ['price_sheet_generator', 'basic_analytics'],
    },
    premium: {
      price: 100,
      features: ['price_sheet_generator', 'crop_chat', 'advanced_analytics'],
    },
    enterprise: {
      price: 200,
      features: ['price_sheet_generator', 'crop_chat', 'advanced_analytics', 'custom_integrations'],
    },
  },
} as const
