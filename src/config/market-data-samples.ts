// =============================================================================
// MARKET DATA SAMPLES
// =============================================================================
// Realistic sample market data for each commodity/variety combination
// This will be replaced by real USDA, NOAA, and EIA API data in the future

export interface MarketDataSample {
  // Base pricing (per lb)
  basePrice: number
  volatility: 'low' | 'medium' | 'high'
  
  // Market trends
  trend: string // e.g., '+8%', '-3%', 'stable'
  trendDirection: 'up' | 'down' | 'stable'
  
  // Regional data
  primaryRegion: string
  regionalPrice: number
  
  // Market insights (2-3 realistic insights)
  insights: string[]
  
  // Retail benchmark
  retailMultiplier: number // Multiplier for retail price (e.g., 2.1 = 210% markup)
  retailUnit: string // 'lb', 'head', 'bunch', etc.
}

// Commodity-specific market data samples
export const marketDataSamples: Record<string, Record<string, MarketDataSample>> = {
  // LEAFY GREENS
  lettuce: {
    iceberg: {
      basePrice: 1.85,
      volatility: 'medium',
      trend: '+12%',
      trendDirection: 'up',
      primaryRegion: 'Salinas Valley',
      regionalPrice: 1.78,
      insights: [
        'Salinas Valley harvest peak ending, prices rising',
        'Cool weather extending shelf life, quality premium',
        'Food service demand recovering, driving wholesale prices'
      ],
      retailMultiplier: 2.2,
      retailUnit: 'head'
    },
    romaine: {
      basePrice: 2.15,
      volatility: 'medium',
      trend: '+8%',
      trendDirection: 'up',
      primaryRegion: 'Salinas Valley',
      regionalPrice: 2.08,
      insights: [
        'Strong demand from restaurant recovery',
        'E. coli concerns resolved, consumer confidence returning',
        'Organic premium increasing due to limited supply'
      ],
      retailMultiplier: 2.1,
      retailUnit: 'head'
    },
    'red-leaf': {
      basePrice: 2.45,
      volatility: 'high',
      trend: '+15%',
      trendDirection: 'up',
      primaryRegion: 'Monterey County',
      regionalPrice: 2.38,
      insights: [
        'Specialty lettuce demand surging in premium markets',
        'Limited acreage driving price premiums',
        'Restaurant chains adding more colorful salad options'
      ],
      retailMultiplier: 2.3,
      retailUnit: 'head'
    },
    'green-leaf': {
      basePrice: 2.25,
      volatility: 'medium',
      trend: '+6%',
      trendDirection: 'up',
      primaryRegion: 'Salinas Valley',
      regionalPrice: 2.19,
      insights: [
        'Steady demand from food service sector',
        'Good growing conditions maintaining quality',
        'Competition from bagged salads affecting pricing'
      ],
      retailMultiplier: 2.2,
      retailUnit: 'head'
    }
  },

  // CITRUS FRUITS
  orange: {
    navel: {
      basePrice: 1.95,
      volatility: 'medium',
      trend: '+18%',
      trendDirection: 'up',
      primaryRegion: 'San Joaquin Valley',
      regionalPrice: 1.88,
      insights: [
        'Early season premium, limited supply until November',
        'Heat stress affecting sizing in Central Valley',
        'Export demand from Asia driving domestic prices higher'
      ],
      retailMultiplier: 1.8,
      retailUnit: 'lb'
    },
    valencia: {
      basePrice: 1.85,
      volatility: 'low',
      trend: '+5%',
      trendDirection: 'up',
      primaryRegion: 'Riverside County',
      regionalPrice: 1.82,
      insights: [
        'Juice processing demand stable',
        'Late season fruit showing good quality',
        'Competition from Florida affecting pricing'
      ],
      retailMultiplier: 1.9,
      retailUnit: 'lb'
    },
    'cara-cara': {
      basePrice: 2.45,
      volatility: 'high',
      trend: '+22%',
      trendDirection: 'up',
      primaryRegion: 'Ventura County',
      regionalPrice: 2.35,
      insights: [
        'Premium variety commanding higher prices',
        'Limited production window creating scarcity',
        'Specialty retail demand exceeding supply'
      ],
      retailMultiplier: 2.0,
      retailUnit: 'lb'
    }
  },

  // BRASSICAS & COLE CROPS
  broccoli: {
    calabrese: {
      basePrice: 2.85,
      volatility: 'medium',
      trend: '+10%',
      trendDirection: 'up',
      primaryRegion: 'Monterey County',
      regionalPrice: 2.78,
      insights: [
        'Strong demand from food service recovery',
        'Optimal growing conditions in coastal regions',
        'Frozen broccoli imports affecting fresh market pricing'
      ],
      retailMultiplier: 1.7,
      retailUnit: 'lb'
    },
    'premium-crop': {
      basePrice: 2.75,
      volatility: 'low',
      trend: '+7%',
      trendDirection: 'up',
      primaryRegion: 'Santa Maria Valley',
      regionalPrice: 2.71,
      insights: [
        'Consistent quality driving steady demand',
        'Good weather supporting reliable harvests',
        'Processing demand supplementing fresh market'
      ],
      retailMultiplier: 1.8,
      retailUnit: 'lb'
    }
  },

  cauliflower: {
    'snowball-y-improved': {
      basePrice: 2.45,
      volatility: 'medium',
      trend: '+14%',
      trendDirection: 'up',
      primaryRegion: 'Salinas Valley',
      regionalPrice: 2.38,
      insights: [
        'Health trend driving increased consumption',
        'Rice substitute demand boosting prices',
        'Weather delays in growing regions tightening supply'
      ],
      retailMultiplier: 1.9,
      retailUnit: 'head'
    }
  },

  // SPECIALTY CITRUS
  mandarin: {
    clementine: {
      basePrice: 2.95,
      volatility: 'high',
      trend: '+25%',
      trendDirection: 'up',
      primaryRegion: 'Kern County',
      regionalPrice: 2.85,
      insights: [
        'Holiday season demand driving premium pricing',
        'Easy-peel convenience factor increasing popularity',
        'Limited domestic production window creating urgency'
      ],
      retailMultiplier: 2.2,
      retailUnit: 'lb'
    },
    'sumo-citrus': {
      basePrice: 4.25,
      volatility: 'high',
      trend: '+30%',
      trendDirection: 'up',
      primaryRegion: 'San Joaquin Valley',
      regionalPrice: 4.15,
      insights: [
        'Ultra-premium positioning in specialty retail',
        'Limited licensing creating artificial scarcity',
        'Social media buzz driving consumer demand'
      ],
      retailMultiplier: 1.6,
      retailUnit: 'lb'
    }
  },

  lemon: {
    eureka: {
      basePrice: 2.85,
      volatility: 'medium',
      trend: '+12%',
      trendDirection: 'up',
      primaryRegion: 'Ventura County',
      regionalPrice: 2.78,
      insights: [
        'Year-round production supporting steady supply',
        'Food service demand for fresh lemon increasing',
        'Competition from Meyer lemons in premium segment'
      ],
      retailMultiplier: 1.9,
      retailUnit: 'lb'
    },
    meyer: {
      basePrice: 4.25,
      volatility: 'high',
      trend: '+20%',
      trendDirection: 'up',
      primaryRegion: 'Riverside County',
      regionalPrice: 4.12,
      insights: [
        'Gourmet cooking trend driving premium demand',
        'Limited season creating price volatility',
        'Restaurant chef preference commanding higher prices'
      ],
      retailMultiplier: 1.8,
      retailUnit: 'lb'
    }
  },

  // TREE FRUITS
  apple: {
    fuji: {
      basePrice: 1.65,
      volatility: 'low',
      trend: '+3%',
      trendDirection: 'up',
      primaryRegion: 'Washington State',
      regionalPrice: 1.62,
      insights: [
        'Washington harvest season driving steady supply',
        'Storage apple quality maintaining premium pricing',
        'Export demand from Asia supporting domestic prices'
      ],
      retailMultiplier: 2.4,
      retailUnit: 'lb'
    },
    gala: {
      basePrice: 1.55,
      volatility: 'low',
      trend: '+2%',
      trendDirection: 'up',
      primaryRegion: 'Washington State',
      regionalPrice: 1.53,
      insights: [
        'Popular variety maintaining consistent demand',
        'Good storage characteristics extending season',
        'School lunch programs driving bulk sales'
      ],
      retailMultiplier: 2.3,
      retailUnit: 'lb'
    },
    'granny-smith': {
      basePrice: 1.75,
      volatility: 'medium',
      trend: '+4%',
      trendDirection: 'up',
      primaryRegion: 'Washington State',
      regionalPrice: 1.71,
      insights: [
        'Baking season increasing demand for tart apples',
        'Limited organic supply driving premium pricing',
        'Food service preference for cooking applications'
      ],
      retailMultiplier: 2.2,
      retailUnit: 'lb'
    },
    honeycrisp: {
      basePrice: 2.85,
      volatility: 'medium',
      trend: '+8%',
      trendDirection: 'up',
      primaryRegion: 'Minnesota/Washington',
      regionalPrice: 2.78,
      insights: [
        'Premium variety commanding highest prices',
        'Consumer preference driving strong demand',
        'Limited acreage creating supply constraints'
      ],
      retailMultiplier: 1.9,
      retailUnit: 'lb'
    }
  }
}

// Helper function to get market data sample
export function getMarketDataSample(commodity: string, variety: string): MarketDataSample | null {
  // Make lookup case-insensitive
  const commodityLower = commodity.toLowerCase()
  const varietyLower = variety.toLowerCase()
  
  return marketDataSamples[commodityLower]?.[varietyLower] || null
}

// Fallback market data for commodities/varieties not in samples
export const fallbackMarketData: MarketDataSample = {
  basePrice: 2.0,
  volatility: 'medium',
  trend: '+5%',
  trendDirection: 'up',
  primaryRegion: 'California',
  regionalPrice: 1.95,
  insights: [
    'Market conditions stable',
    'Normal seasonal patterns observed',
    'Supply and demand in balance'
  ],
  retailMultiplier: 2.0,
  retailUnit: 'lb'
}
