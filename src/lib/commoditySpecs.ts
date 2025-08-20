// Commodity-specific specifications for USDA matching and UI display

export interface CommoditySpec {
  commodity: string
  hasCountSize: boolean
  countSizeOptions: string[]
  hasGrade: boolean
  gradeOptions: string[]
  commonPackaging: string[]
  usdaUnit: string // Expected USDA unit for this commodity
}

export const COMMODITY_SPECS: Record<string, CommoditySpec> = {
  // Berries - No count sizes, simple grades
  'strawberries': {
    commodity: 'strawberries',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['flat', 'clamshell', 'tray'],
    usdaUnit: 'per flat'
  },
  
  'blueberries': {
    commodity: 'blueberries',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['flat', 'clamshell', 'pint'],
    usdaUnit: 'per flat'
  },
  
  'raspberries': {
    commodity: 'raspberries',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['flat', 'clamshell', 'half-pint'],
    usdaUnit: 'per flat'
  },
  
  'blackberries': {
    commodity: 'blackberries',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['flat', 'clamshell', 'pint'],
    usdaUnit: 'per flat'
  },
  
  // Leafy Greens - Count sizes for cartons, simple grades
  'lettuce': {
    commodity: 'lettuce',
    hasCountSize: true,
    countSizeOptions: ['12ct', '24ct', '30ct'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'bag', 'case'],
    usdaUnit: 'per carton'
  },
  
  'spinach': {
    commodity: 'spinach',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Extra No. 1'],
    commonPackaging: ['bag', 'case', 'carton'],
    usdaUnit: 'per carton (4lb)'
  },
  
  'kale': {
    commodity: 'kale',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['bag', 'case', 'bunch'],
    usdaUnit: 'per carton (20lb)'
  },
  
  'chard': {
    commodity: 'chard',
    hasCountSize: true,
    countSizeOptions: ['12ct', '18ct', '24ct'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'case', 'bunch'],
    usdaUnit: 'per carton (24ct)'
  },
  
  'arugula': {
    commodity: 'arugula',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['bag', 'case', 'carton'],
    usdaUnit: 'per carton (4lb)'
  },
  
  // Citrus - Count sizes very important, multiple grades
  'oranges': {
    commodity: 'oranges',
    hasCountSize: true,
    countSizeOptions: ['88s', '113s', '138s', '163s'],
    hasGrade: true,
    gradeOptions: ['Fancy', 'Choice', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag'],
    usdaUnit: 'per carton (40lb)'
  },
  
  'mandarins': {
    commodity: 'mandarins',
    hasCountSize: true,
    countSizeOptions: ['88s', '113s', '138s', '163s', '210s'],
    hasGrade: true,
    gradeOptions: ['Fancy', 'Choice', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag', 'clementine box'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'minneolas': {
    commodity: 'minneolas',
    hasCountSize: true,
    countSizeOptions: ['48s', '56s', '64s', '80s', '100s'],
    hasGrade: true,
    gradeOptions: ['Fancy', 'Choice', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag'],
    usdaUnit: 'per carton (40lb)'
  },
  
  'lemons': {
    commodity: 'lemons',
    hasCountSize: true,
    countSizeOptions: ['75s', '95s', '115s', '140s', '165s'],
    hasGrade: true,
    gradeOptions: ['Fancy', 'Choice', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag'],
    usdaUnit: 'per carton (38lb)'
  },
  
  'limes': {
    commodity: 'limes',
    hasCountSize: true,
    countSizeOptions: ['110s', '150s', '175s', '200s', '230s'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'bag'],
    usdaUnit: 'per carton (40lb)'
  },
  
  'grapefruit': {
    commodity: 'grapefruit',
    hasCountSize: true,
    countSizeOptions: ['23s', '27s', '32s', '36s', '40s', '48s'],
    hasGrade: true,
    gradeOptions: ['Fancy', 'Choice', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag'],
    usdaUnit: 'per carton (40lb)'
  },
  
  // Melons - Count sizes for whole melons
  'cantaloupe': {
    commodity: 'cantaloupe',
    hasCountSize: true,
    countSizeOptions: ['5s', '9s', '12s', '15s', '18s', '23s'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['carton', 'bin'],
    usdaUnit: 'per carton (40lb)'
  },
  
  'watermelon': {
    commodity: 'watermelon',
    hasCountSize: true,
    countSizeOptions: ['5s', '8s', '12s', '15s', '20s'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['bin', 'carton'],
    usdaUnit: 'per bin (1000lb)'
  },
  
  'honeydew': {
    commodity: 'honeydew',
    hasCountSize: true,
    countSizeOptions: ['5s', '8s', '12s', '15s', '18s'],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['carton', 'bin'],
    usdaUnit: 'per carton (40lb)'
  },
  
  // Vine Crops - Weight-based, simple grades
  'tomatoes': {
    commodity: 'tomatoes',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'US No. 3'],
    commonPackaging: ['carton', 'box', 'case'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'bell peppers': {
    commodity: 'bell peppers',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Fancy'],
    commonPackaging: ['carton', 'box', 'case'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'hot peppers': {
    commodity: 'hot peppers',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'box', 'case'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'cucumbers': {
    commodity: 'cucumbers',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US Extra No. 1', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'box', 'case'],
    usdaUnit: 'per carton (55lb)'
  },
  
  'summer squash': {
    commodity: 'summer squash',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'box', 'case'],
    usdaUnit: 'per carton (42lb)'
  },
  
  'winter squash': {
    commodity: 'winter squash',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'box', 'bin'],
    usdaUnit: 'per carton (50lb)'
  },
  
  // Root Vegetables - Weight-based
  'potatoes': {
    commodity: 'potatoes',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'US Extra No. 1'],
    commonPackaging: ['bag', 'carton', 'box'],
    usdaUnit: 'per cwt (100lb)'
  },
  
  'sweet potatoes': {
    commodity: 'sweet potatoes',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'US Extra No. 1'],
    commonPackaging: ['carton', 'box', 'bag'],
    usdaUnit: 'per carton (40lb)'
  },
  
  // Stone Fruits - Count sizes for some varieties
  'peaches': {
    commodity: 'peaches',
    hasCountSize: true,
    countSizeOptions: ['56s', '64s', '70s', '80s', '90s'],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'box', 'tray pack'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'plums': {
    commodity: 'plums',
    hasCountSize: true,
    countSizeOptions: ['56s', '70s', '84s', '105s', '120s'],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'box', 'tray pack'],
    usdaUnit: 'per carton (28lb)'
  },
  
  'cherries': {
    commodity: 'cherries',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1'],
    commonPackaging: ['carton', 'box', 'tray pack'],
    usdaUnit: 'per carton (20lb)'
  },
  
  'apricots': {
    commodity: 'apricots',
    hasCountSize: true,
    countSizeOptions: ['24s', '30s', '36s', '42s', '48s'],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'box', 'tray pack'],
    usdaUnit: 'per carton (24lb)'
  },
  
  // Pome Fruits - Count sizes for some varieties
  'apples': {
    commodity: 'apples',
    hasCountSize: true,
    countSizeOptions: ['72s', '80s', '88s', '100s', '113s', '125s', '138s'],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1', 'Utility'],
    commonPackaging: ['carton', 'bag', 'tray pack'],
    usdaUnit: 'per carton (40lb)'
  },
  
  'pears': {
    commodity: 'pears',
    hasCountSize: true,
    countSizeOptions: ['60s', '70s', '80s', '90s', '100s', '110s', '120s'],
    hasGrade: true,
    gradeOptions: ['US Extra Fancy', 'US Fancy', 'US No. 1', 'US No. 2'],
    commonPackaging: ['carton', 'bag', 'tray pack'],
    usdaUnit: 'per carton (44lb)'
  },
  
  // Root Vegetables - Additional
  'carrots': {
    commodity: 'carrots',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Jumbo'],
    commonPackaging: ['bag', 'carton', 'bulk'],
    usdaUnit: 'per carton (50lb)'
  },
  
  'onions': {
    commodity: 'onions',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'US Commercial'],
    commonPackaging: ['bag', 'carton', 'sack'],
    usdaUnit: 'per cwt (100lb)'
  },
  
  'garlic': {
    commodity: 'garlic',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'US Commercial'],
    commonPackaging: ['carton', 'bag', 'case'],
    usdaUnit: 'per carton (30lb)'
  },
  
  'beets': {
    commodity: 'beets',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'bag', 'case'],
    usdaUnit: 'per carton (25lb)'
  },
  
  'turnips': {
    commodity: 'turnips',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['carton', 'bag', 'case'],
    usdaUnit: 'per carton (25lb)'
  },
  
  // Herbs & Aromatics - Weight-based, simple grades
  'basil': {
    commodity: 'basil',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (12 bunches)'
  },
  
  'mint': {
    commodity: 'mint',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (12 bunches)'
  },
  
  'rosemary': {
    commodity: 'rosemary',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (12 bunches)'
  },
  
  'thyme': {
    commodity: 'thyme',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (12 bunches)'
  },
  
  'cilantro': {
    commodity: 'cilantro',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (60 bunches)'
  },
  
  'parsley': {
    commodity: 'parsley',
    hasCountSize: false,
    countSizeOptions: [],
    hasGrade: true,
    gradeOptions: ['US No. 1', 'US No. 2', 'Choice'],
    commonPackaging: ['case', 'carton', 'bunch'],
    usdaUnit: 'per case (60 bunches)'
  }
}

/**
 * Get commodity specifications for a given commodity
 */
export function getCommoditySpec(commodity: string): CommoditySpec | null {
  return COMMODITY_SPECS[commodity.toLowerCase()] || null
}

/**
 * Check if a commodity uses count sizes
 */
export function hasCountSize(commodity: string): boolean {
  const spec = getCommoditySpec(commodity)
  return spec?.hasCountSize || false
}

/**
 * Get available count size options for a commodity
 */
export function getCountSizeOptions(commodity: string): string[] {
  const spec = getCommoditySpec(commodity)
  return spec?.countSizeOptions || []
}

/**
 * Get available grade options for a commodity
 */
export function getGradeOptions(commodity: string): string[] {
  const spec = getCommoditySpec(commodity)
  return spec?.gradeOptions || ['US No. 1', 'US No. 2'] // Default grades
}

/**
 * Get expected USDA unit for a commodity
 */
export function getExpectedUsdaUnit(commodity: string): string {
  const spec = getCommoditySpec(commodity)
  return spec?.usdaUnit || 'per unit'
}
