// Comprehensive packaging specifications for agricultural commodities
// This replaces manual packaging configuration with industry-standard options

export interface PackagingSpec {
  id: string
  name: string
  description: string
  commodities: string[]
  isStandard: boolean // true for industry standard, false for custom user additions
  category: 'container' | 'bag' | 'carton' | 'bulk' | 'specialty'
}

export const STANDARD_PACKAGING: PackagingSpec[] = [
  // Berry Containers
  {
    id: 'clamshell-1lb',
    name: '1 lb Clamshell',
    description: 'Clear plastic clamshell container for berries',
    commodities: ['strawberries', 'blueberries', 'raspberries', 'blackberries'],
    isStandard: true,
    category: 'container'
  },
  {
    id: 'clamshell-2lb',
    name: '2 lb Clamshell',
    description: 'Large plastic clamshell container for berries',
    commodities: ['strawberries', 'blueberries'],
    isStandard: true,
    category: 'container'
  },
  {
    id: 'berry-flat',
    name: 'Berry Flat',
    description: 'Flat containing multiple berry containers',
    commodities: ['strawberries', 'blueberries', 'raspberries', 'blackberries'],
    isStandard: true,
    category: 'container'
  },
  {
    id: 'pint-container',
    name: 'Pint Container',
    description: 'Pint-sized container for berries',
    commodities: ['blueberries', 'blackberries'],
    isStandard: true,
    category: 'container'
  },
  {
    id: 'half-pint-container',
    name: 'Half Pint Container',
    description: 'Half-pint container for delicate berries',
    commodities: ['raspberries'],
    isStandard: true,
    category: 'container'
  },

  // Citrus Cartons
  {
    id: 'citrus-carton-40lb',
    name: '40 lb Carton',
    description: 'Standard citrus carton (40 pounds)',
    commodities: ['oranges', 'grapefruit', 'minneolas'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'citrus-carton-38lb',
    name: '38 lb Carton',
    description: 'Lemon carton (38 pounds)',
    commodities: ['lemons'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'mandarin-carton-25lb',
    name: '25 lb Carton',
    description: 'Mandarin/small citrus carton (25 pounds)',
    commodities: ['mandarins', 'limes'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'mandarin-carton-18lb',
    name: '18 lb Carton',
    description: 'Small mandarin carton (18 pounds)',
    commodities: ['mandarins'],
    isStandard: true,
    category: 'carton'
  },

  // Apple Packaging
  {
    id: 'apple-carton-40lb',
    name: '40 lb Carton',
    description: 'Standard apple carton (40 pounds)',
    commodities: ['apples', 'pears'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'apple-bag-20lb',
    name: '20 lb Bag',
    description: 'Mesh or plastic bag for apples',
    commodities: ['apples', 'pears'],
    isStandard: true,
    category: 'bag'
  },
  {
    id: 'apple-tray-pack',
    name: 'Tray Pack',
    description: 'Individual apple tray packaging',
    commodities: ['apples', 'pears'],
    isStandard: true,
    category: 'specialty'
  },

  // Leafy Greens
  {
    id: 'lettuce-carton-24ct',
    name: '24ct Carton',
    description: 'Carton containing 24 heads of lettuce',
    commodities: ['lettuce', 'cabbage'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'lettuce-carton-12ct',
    name: '12ct Carton',
    description: 'Carton containing 12 heads of lettuce',
    commodities: ['lettuce', 'cabbage'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'leafy-bag-5oz',
    name: '5 oz Bag',
    description: 'Plastic bag for baby leafy greens',
    commodities: ['lettuce', 'spinach', 'arugula'],
    isStandard: true,
    category: 'bag'
  },

  // Root Vegetables
  {
    id: 'carrot-carton-50lb',
    name: '50 lb Carton',
    description: 'Large carton for bulk carrots',
    commodities: ['carrots'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'carrot-bag-25lb',
    name: '25 lb Bag',
    description: 'Mesh bag for carrots',
    commodities: ['carrots', 'potatoes'],
    isStandard: true,
    category: 'bag'
  },
  {
    id: 'potato-bag-50lb',
    name: '50 lb Bag',
    description: 'Burlap or mesh bag for potatoes',
    commodities: ['potatoes'],
    isStandard: true,
    category: 'bag'
  },

  // Vine Crops
  {
    id: 'tomato-carton-25lb',
    name: '25 lb Carton',
    description: 'Standard tomato carton (25 pounds)',
    commodities: ['tomatoes'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'tomato-box-20lb',
    name: '20 lb Box',
    description: 'Smaller tomato box (20 pounds)',
    commodities: ['tomatoes'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'pepper-carton-25lb',
    name: '25 lb Carton',
    description: 'Bell pepper carton (25 pounds)',
    commodities: ['bell peppers'],
    isStandard: true,
    category: 'carton'
  },

  // Melons
  {
    id: 'melon-carton-40lb',
    name: '40 lb Carton',
    description: 'Standard melon carton (40 pounds)',
    commodities: ['cantaloupe', 'honeydew'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'watermelon-bin-800lb',
    name: '800 lb Bin',
    description: 'Standard bin for watermelons',
    commodities: ['watermelon'],
    isStandard: true,
    category: 'bulk'
  },
  {
    id: 'watermelon-bin-1000lb',
    name: '1000 lb Bin',
    description: 'Large bin for watermelons',
    commodities: ['watermelon'],
    isStandard: true,
    category: 'bulk'
  },
  {
    id: 'watermelon-bin-1200lb',
    name: '1200 lb Bin',
    description: 'Extra large bin for watermelons',
    commodities: ['watermelon'],
    isStandard: true,
    category: 'bulk'
  },

  // Stone Fruit Packaging
  {
    id: 'stone-fruit-carton-25lb',
    name: '25 lb Carton',
    description: 'Standard carton for stone fruits',
    commodities: ['peaches'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'stone-fruit-carton-28lb',
    name: '28 lb Carton',
    description: 'Plum carton (28 pounds)',
    commodities: ['plums'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'cherry-carton-20lb',
    name: '20 lb Carton',
    description: 'Cherry carton (20 pounds)',
    commodities: ['cherries'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'apricot-carton-24lb',
    name: '24 lb Carton',
    description: 'Apricot carton (24 pounds)',
    commodities: ['apricots'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'stone-fruit-tray-pack',
    name: 'Tray Pack',
    description: 'Individual fruit tray packaging',
    commodities: ['peaches', 'plums', 'cherries', 'apricots'],
    isStandard: true,
    category: 'specialty'
  },

  // Pear Packaging
  {
    id: 'pear-carton-44lb',
    name: '44 lb Carton',
    description: 'Standard pear carton (44 pounds)',
    commodities: ['pears'],
    isStandard: true,
    category: 'carton'
  },

  // Additional Leafy Green Packaging
  {
    id: 'spinach-carton-4lb',
    name: '4 lb Carton',
    description: 'Baby spinach carton (4 pounds)',
    commodities: ['spinach', 'arugula'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'kale-carton-20lb',
    name: '20 lb Carton',
    description: 'Kale carton (20 pounds)',
    commodities: ['kale'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'chard-carton-24ct',
    name: '24ct Carton',
    description: 'Swiss chard carton (24 count)',
    commodities: ['chard'],
    isStandard: true,
    category: 'carton'
  },

  // Vine Crop Packaging
  {
    id: 'cucumber-carton-55lb',
    name: '55 lb Carton',
    description: 'Cucumber carton (55 pounds)',
    commodities: ['cucumbers'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'squash-carton-42lb',
    name: '42 lb Carton',
    description: 'Summer squash carton (42 pounds)',
    commodities: ['summer squash'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'winter-squash-carton-50lb',
    name: '50 lb Carton',
    description: 'Winter squash carton (50 pounds)',
    commodities: ['winter squash'],
    isStandard: true,
    category: 'carton'
  },

  // Root Vegetable Packaging
  {
    id: 'onion-sack-50lb',
    name: '50 lb Sack',
    description: 'Mesh sack for onions',
    commodities: ['onions'],
    isStandard: true,
    category: 'bag'
  },
  {
    id: 'garlic-carton-30lb',
    name: '30 lb Carton',
    description: 'Garlic carton (30 pounds)',
    commodities: ['garlic'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'beet-carton-25lb',
    name: '25 lb Carton',
    description: 'Beet carton (25 pounds)',
    commodities: ['beets', 'turnips'],
    isStandard: true,
    category: 'carton'
  },

  // Herb Packaging
  {
    id: 'herb-case-12bunch',
    name: '12 Bunch Case',
    description: 'Case containing 12 herb bunches',
    commodities: ['basil', 'mint', 'rosemary', 'thyme'],
    isStandard: true,
    category: 'carton'
  },
  {
    id: 'herb-case-60bunch',
    name: '60 Bunch Case',
    description: 'Large case for high-volume herbs',
    commodities: ['cilantro', 'parsley'],
    isStandard: true,
    category: 'carton'
  },

  // Additional Melon Packaging
  {
    id: 'honeydew-carton-40lb',
    name: '40 lb Carton',
    description: 'Honeydew melon carton (40 pounds)',
    commodities: ['honeydew'],
    isStandard: true,
    category: 'carton'
  }
]

/**
 * Get standard packaging options for a commodity
 */
export function getStandardPackaging(commodity: string): PackagingSpec[] {
  return STANDARD_PACKAGING.filter(pkg => 
    pkg.commodities.includes(commodity.toLowerCase())
  )
}

/**
 * Get all packaging options (standard + custom) for a commodity
 */
export function getAllPackagingOptions(commodity: string, customPackaging: PackagingSpec[] = []): PackagingSpec[] {
  const standard = getStandardPackaging(commodity)
  const custom = customPackaging.filter(pkg => 
    pkg.commodities.includes(commodity.toLowerCase())
  )
  return [...standard, ...custom]
}

/**
 * Get packaging options grouped by category
 */
export function getPackagingByCategory(commodity: string): Record<string, PackagingSpec[]> {
  const packaging = getStandardPackaging(commodity)
  return packaging.reduce((groups, pkg) => {
    if (!groups[pkg.category]) {
      groups[pkg.category] = []
    }
    groups[pkg.category].push(pkg)
    return groups
  }, {} as Record<string, PackagingSpec[]>)
}

/**
 * Check if a packaging type is standard for a commodity
 */
export function isStandardPackaging(commodity: string, packagingName: string): boolean {
  const standard = getStandardPackaging(commodity)
  return standard.some(pkg => pkg.name === packagingName)
}
