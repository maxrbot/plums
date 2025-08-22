/**
 * Realistic Pricing Benchmarks - Based on USDA Terminal Market Data
 * Last Updated: January 2025
 * Source: USDA Market News, Los Angeles Terminal Market Reports
 * 
 * These prices reflect actual wholesale terminal market pricing
 * for high-quality produce in standard commercial packaging.
 */

export interface PricingBenchmark {
  commodity: string
  variety?: string
  subtype?: string
  basePrice: number        // USD per unit
  unit: string            // Pricing unit (per lb, per carton, etc.)
  packaging: string       // Standard packaging type
  grade: string          // USDA grade standard
  seasonality: 'peak' | 'shoulder' | 'off' | 'year-round'
  notes?: string
}

/**
 * Current wholesale terminal market pricing benchmarks
 * Prices are FOB (Freight on Board) terminal market rates
 */
export const pricingBenchmarks: PricingBenchmark[] = [
  // ROOT VEGETABLES
  {
    commodity: 'carrot',
    variety: 'Nantes',
    basePrice: 18.50,
    unit: 'per 50 lb carton',
    packaging: '50 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'carrot',
    variety: 'Imperator', 
    basePrice: 16.75,
    unit: 'per 50 lb carton',
    packaging: '50 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'carrot',
    variety: 'Baby Carrots',
    basePrice: 24.00,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'potato',
    subtype: 'russet',
    variety: 'Russet Burbank',
    basePrice: 22.50,
    unit: 'per 50 lb carton',
    packaging: '50 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'potato',
    subtype: 'yellow',
    variety: 'Yukon Gold',
    basePrice: 28.75,
    unit: 'per 50 lb carton',
    packaging: '50 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'sweet-potato',
    subtype: 'orange-flesh',
    variety: 'Beauregard',
    basePrice: 32.00,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'onion',
    variety: 'Yellow Storage',
    basePrice: 15.25,
    unit: 'per 50 lb bag',
    packaging: '50 lb Mesh Bag',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'beet',
    variety: 'Detroit Dark Red',
    basePrice: 26.50,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US No. 1',
    seasonality: 'shoulder'
  },

  // LEAFY GREENS
  {
    commodity: 'lettuce',
    variety: 'Iceberg',
    basePrice: 28.50,
    unit: 'per 24 ct carton',
    packaging: '24 Count Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'lettuce',
    variety: 'Romaine',
    basePrice: 32.75,
    unit: 'per 24 ct carton',
    packaging: '24 Count Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'lettuce',
    variety: 'Butterhead',
    basePrice: 38.00,
    unit: 'per 24 ct carton',
    packaging: '24 Count Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'spinach',
    variety: 'Flat Leaf',
    basePrice: 42.50,
    unit: 'per 24 bunch carton',
    packaging: '24 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'kale',
    variety: 'Curly Green',
    basePrice: 38.75,
    unit: 'per 18 bunch carton',
    packaging: '18 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'chard',
    variety: 'Fordhook Giant',
    basePrice: 35.50,
    unit: 'per 12 bunch carton',
    packaging: '12 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'arugula',
    variety: 'Wild Rocket',
    basePrice: 48.00,
    unit: 'per 3 lb case',
    packaging: '3 lb Case',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },

  // VINE CROPS
  {
    commodity: 'tomato',
    subtype: 'cherry',
    variety: 'Sweet 100',
    basePrice: 45.50,
    unit: 'per 12 pt flat',
    packaging: '12 Pint Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'tomato',
    subtype: 'beefsteak',
    variety: 'Big Beef',
    basePrice: 38.75,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'tomato',
    subtype: 'roma',
    variety: 'San Marzano',
    basePrice: 42.00,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'bell-pepper',
    subtype: 'green',
    variety: 'California Wonder',
    basePrice: 35.25,
    unit: 'per 28 lb carton',
    packaging: '28 lb Carton',
    grade: 'US Fancy',
    seasonality: 'year-round'
  },
  {
    commodity: 'bell-pepper',
    subtype: 'colored',
    variety: 'Red Bell',
    basePrice: 52.50,
    unit: 'per 28 lb carton',
    packaging: '28 lb Carton',
    grade: 'US Fancy',
    seasonality: 'year-round'
  },
  {
    commodity: 'cucumber',
    variety: 'Marketmore',
    basePrice: 24.75,
    unit: 'per 55 ct carton',
    packaging: '55 Count Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'summer-squash',
    variety: 'Yellow Crookneck',
    basePrice: 28.50,
    unit: 'per 20 lb carton',
    packaging: '20 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },

  // BERRIES
  {
    commodity: 'strawberry',
    variety: 'Albion',
    basePrice: 58.75,
    unit: 'per 8 lb flat',
    packaging: '8 x 1 lb Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'strawberry',
    variety: 'Seascape',
    basePrice: 54.50,
    unit: 'per 8 lb flat',
    packaging: '8 x 1 lb Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'blueberry',
    variety: 'Duke',
    basePrice: 82.50,
    unit: 'per 12 pt flat',
    packaging: '12 x 1 pt Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'raspberry',
    variety: 'Heritage',
    basePrice: 95.75,
    unit: 'per 12 half-pt flat',
    packaging: '12 x 0.5 pt Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'blackberry',
    variety: 'Triple Crown',
    basePrice: 88.25,
    unit: 'per 12 half-pt flat',
    packaging: '12 x 0.5 pt Flat',
    grade: 'US No. 1',
    seasonality: 'peak'
  },

  // CITRUS FRUITS
  {
    commodity: 'orange',
    variety: 'Valencia',
    basePrice: 42.50,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },
  {
    commodity: 'orange',
    variety: 'Navel',
    basePrice: 45.75,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },
  {
    commodity: 'mandarin',
    variety: 'Clementine',
    basePrice: 52.00,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },
  {
    commodity: 'lemon',
    variety: 'Eureka',
    basePrice: 48.25,
    unit: 'per 38 lb carton',
    packaging: '38 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'lime',
    variety: 'Persian',
    basePrice: 62.50,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },

  // STONE FRUITS
  {
    commodity: 'peach',
    variety: 'Elberta',
    basePrice: 55.50,
    unit: 'per 25 lb carton',
    packaging: '25 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },
  {
    commodity: 'plum',
    variety: 'Santa Rosa',
    basePrice: 48.75,
    unit: 'per 28 lb carton',
    packaging: '28 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },
  {
    commodity: 'cherry',
    variety: 'Bing',
    basePrice: 125.50,
    unit: 'per 20 lb carton',
    packaging: '20 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },
  {
    commodity: 'apricot',
    variety: 'Blenheim',
    basePrice: 68.25,
    unit: 'per 24 lb carton',
    packaging: '24 lb Carton',
    grade: 'US Fancy',
    seasonality: 'peak'
  },

  // POME FRUITS
  {
    commodity: 'apple',
    variety: 'Honeycrisp',
    basePrice: 58.75,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US Extra Fancy',
    seasonality: 'shoulder'
  },
  {
    commodity: 'apple',
    variety: 'Gala',
    basePrice: 48.50,
    unit: 'per 40 lb carton',
    packaging: '40 lb Carton',
    grade: 'US Extra Fancy',
    seasonality: 'year-round'
  },
  {
    commodity: 'pear',
    variety: 'Bartlett',
    basePrice: 52.25,
    unit: 'per 44 lb carton',
    packaging: '44 lb Carton',
    grade: 'US No. 1',
    seasonality: 'peak'
  },

  // HERBS & AROMATICS
  {
    commodity: 'basil',
    variety: 'Sweet Genovese',
    basePrice: 68.50,
    unit: 'per 20 bunch carton',
    packaging: '20 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'cilantro',
    variety: 'Slow Bolt',
    basePrice: 42.75,
    unit: 'per 60 bunch carton',
    packaging: '60 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  },
  {
    commodity: 'parsley',
    variety: 'Italian Flat',
    basePrice: 38.50,
    unit: 'per 60 bunch carton',
    packaging: '60 Bunch Carton',
    grade: 'US No. 1',
    seasonality: 'year-round'
  }
]

/**
 * Get pricing benchmark for a specific commodity/variety combination
 */
export function getPricingBenchmark(
  commodity: string, 
  variety?: string, 
  subtype?: string
): PricingBenchmark | null {
  
  // First try exact match with variety and subtype
  if (variety) {
    const exactMatch = pricingBenchmarks.find(p => 
      p.commodity === commodity && 
      p.variety === variety &&
      (!subtype || p.subtype === subtype)
    )
    if (exactMatch) return exactMatch
  }
  
  // Fall back to commodity + subtype match
  if (subtype) {
    const subtypeMatch = pricingBenchmarks.find(p => 
      p.commodity === commodity && p.subtype === subtype
    )
    if (subtypeMatch) return subtypeMatch
  }
  
  // Fall back to commodity-only match
  const commodityMatch = pricingBenchmarks.find(p => 
    p.commodity === commodity && !p.variety && !p.subtype
  )
  if (commodityMatch) return commodityMatch
  
  // Fall back to first commodity match
  const firstMatch = pricingBenchmarks.find(p => p.commodity === commodity)
  return firstMatch || null
}

/**
 * Get all available varieties for a commodity from benchmarks
 */
export function getAvailableVarieties(commodity: string): string[] {
  return pricingBenchmarks
    .filter(p => p.commodity === commodity && p.variety)
    .map(p => p.variety!)
    .filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates
}

/**
 * Convert per-unit pricing to per-pound equivalent for comparison
 * This helps normalize different packaging formats
 */
export function convertToPoundPrice(benchmark: PricingBenchmark): number {
  const { basePrice, unit, packaging } = benchmark
  
  // Extract weight from common packaging formats
  const weightMatch = packaging.match(/(\d+)\s*lb/i)
  if (weightMatch) {
    const pounds = parseInt(weightMatch[1])
    return basePrice / pounds
  }
  
  // Handle count-based packaging (estimate average weight)
  const countMatch = packaging.match(/(\d+)\s*(ct|count)/i)
  if (countMatch) {
    const count = parseInt(countMatch[1])
    // Rough estimates for common produce weights
    const estimatedWeightPerPiece = getEstimatedWeight(benchmark.commodity)
    return basePrice / (count * estimatedWeightPerPiece)
  }
  
  // Default: assume price is already per pound
  return basePrice
}

/**
 * Estimated weight per piece for count-based items (in pounds)
 */
function getEstimatedWeight(commodity: string): number {
  const weights: Record<string, number> = {
    'lettuce': 1.5,      // ~1.5 lbs per head
    'bell-pepper': 0.4,  // ~0.4 lbs per pepper
    'cucumber': 0.75,    // ~0.75 lbs per cucumber
    'tomato': 0.5,       // ~0.5 lbs per large tomato
    'apple': 0.33,       // ~0.33 lbs per apple
    'orange': 0.5,       // ~0.5 lbs per orange
  }
  return weights[commodity] || 0.5 // Default to 0.5 lbs
}
