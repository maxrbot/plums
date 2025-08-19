export interface PackagingSpec {
  type: 'carton' | 'bag' | 'bulk' | 'clamshell' | 'tray'
  counts?: string[]  // For cartons: '88s', '113s', etc.
  sizes?: string[]   // For bags: '3 lb', '5 lb', etc.
  weight?: string    // Standard weight: '40 lbs'
  grades: string[]   // Quality grades
  usdaMapping?: {    // How to map to USDA commodity names
    commodity: string
    specifications?: string  // Additional specs for USDA lookup
  }
}

export interface CommodityPackaging {
  commodityId: string
  packagingOptions: PackagingSpec[]
}

// Packaging specifications for commodities that need count/grade precision
export const packagingSpecs: CommodityPackaging[] = [
  {
    commodityId: 'orange',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['48s', '56s', '72s', '88s', '113s', '138s'],
        weight: '40 lbs',
        grades: ['Fancy', 'Choice', 'Standard'],
        usdaMapping: {
          commodity: 'oranges',
          specifications: 'navel'
        }
      },
      {
        type: 'bag',
        sizes: ['3 lb', '5 lb', '8 lb', '10 lb'],
        grades: ['Fancy', 'Choice'],
        usdaMapping: {
          commodity: 'oranges',
          specifications: 'bagged'
        }
      }
    ]
  },
  {
    commodityId: 'lemon',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['75s', '95s', '115s', '140s', '165s', '200s'],
        weight: '38 lbs',
        grades: ['Fancy', 'Choice', 'Standard'],
        usdaMapping: {
          commodity: 'lemons'
        }
      }
    ]
  },
  {
    commodityId: 'grapefruit',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['23s', '27s', '32s', '36s', '40s', '48s'],
        weight: '40 lbs',
        grades: ['Fancy', 'Choice'],
        usdaMapping: {
          commodity: 'grapefruit'
        }
      }
    ]
  },
  {
    commodityId: 'apple',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['48s', '56s', '64s', '72s', '80s', '88s', '100s', '113s', '125s', '138s'],
        weight: '40 lbs',
        grades: ['Extra Fancy', 'Fancy', 'Choice', 'Utility'],
        usdaMapping: {
          commodity: 'apples'
        }
      },
      {
        type: 'bag',
        sizes: ['3 lb', '5 lb', '8 lb'],
        grades: ['Extra Fancy', 'Fancy'],
        usdaMapping: {
          commodity: 'apples',
          specifications: 'bagged'
        }
      }
    ]
  },
  {
    commodityId: 'strawberry',
    packagingOptions: [
      {
        type: 'clamshell',
        sizes: ['1 lb', '2 lb'],
        grades: ['No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'strawberries'
        }
      },
      {
        type: 'tray',
        sizes: ['8 x 1 lb', '12 x 1 lb'],
        grades: ['No. 1'],
        usdaMapping: {
          commodity: 'strawberries',
          specifications: 'tray pack'
        }
      }
    ]
  },
  {
    commodityId: 'lime',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['110s', '150s', '175s', '200s', '230s', '250s'],
        weight: '40 lbs',
        grades: ['No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'limes'
        }
      }
    ]
  },
  {
    commodityId: 'pear',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['50s', '60s', '70s', '80s', '90s', '100s', '110s', '120s'],
        weight: '44 lbs',
        grades: ['Extra Fancy', 'Fancy', 'Choice'],
        usdaMapping: {
          commodity: 'pears'
        }
      }
    ]
  },
  {
    commodityId: 'peach',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['36s', '40s', '48s', '56s', '64s', '72s', '80s'],
        weight: '25 lbs',
        grades: ['Extra Fancy', 'Fancy', 'Choice', 'Juice'],
        usdaMapping: {
          commodity: 'peaches'
        }
      }
    ]
  },
  {
    commodityId: 'plum',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['56s', '70s', '84s', '105s', '120s'],
        weight: '28 lbs',
        grades: ['Extra Fancy', 'Fancy', 'Choice'],
        usdaMapping: {
          commodity: 'plums'
        }
      }
    ]
  },
  {
    commodityId: 'cherry',
    packagingOptions: [
      {
        type: 'carton',
        sizes: ['18 x 1 lb', '20 x 1 lb'],
        weight: '20 lbs',
        grades: ['Extra Fancy', 'Fancy', 'Choice'],
        usdaMapping: {
          commodity: 'cherries'
        }
      }
    ]
  },
  {
    commodityId: 'blueberry',
    packagingOptions: [
      {
        type: 'clamshell',
        sizes: ['6 oz', '1 lb', '18 oz'],
        grades: ['No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'blueberries'
        }
      },
      {
        type: 'tray',
        sizes: ['12 x 6 oz', '12 x 1 lb'],
        grades: ['No. 1'],
        usdaMapping: {
          commodity: 'blueberries',
          specifications: 'tray pack'
        }
      }
    ]
  },
  {
    commodityId: 'tomato',
    packagingOptions: [
      {
        type: 'carton',
        sizes: ['25 lb', '20 lb'],
        grades: ['Extra Large', 'Large', 'Medium', 'Small'],
        usdaMapping: {
          commodity: 'tomatoes'
        }
      },
      {
        type: 'clamshell',
        sizes: ['1 lb', '2 lb'],
        grades: ['No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'tomatoes',
          specifications: 'on the vine'
        }
      }
    ]
  },
  {
    commodityId: 'bell-pepper',
    packagingOptions: [
      {
        type: 'carton',
        sizes: ['25 lb', '30 lb'],
        grades: ['Fancy', 'No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'bell peppers'
        }
      }
    ]
  },
  {
    commodityId: 'melon',
    packagingOptions: [
      {
        type: 'carton',
        counts: ['5s', '6s', '8s', '9s', '12s', '15s', '18s', '23s'],
        weight: '40 lbs',
        grades: ['Fancy', 'No. 1', 'No. 2'],
        usdaMapping: {
          commodity: 'cantaloupe'
        }
      },
      {
        type: 'bulk',
        sizes: ['Bin', '1000 lb tote'],
        grades: ['No. 1', 'No. 2', 'Processing'],
        usdaMapping: {
          commodity: 'watermelon',
          specifications: 'bulk'
        }
      }
    ]
  },
  {
    commodityId: 'potato',
    packagingOptions: [
      {
        type: 'bag',
        sizes: ['5 lb', '10 lb', '15 lb', '20 lb', '50 lb'],
        grades: ['US No. 1', 'US No. 2', 'US Commercial'],
        usdaMapping: {
          commodity: 'potatoes'
        }
      },
      {
        type: 'carton',
        sizes: ['50 lb', '80 lb', '100 lb'],
        grades: ['US No. 1', 'US No. 2', 'Processing'],
        usdaMapping: {
          commodity: 'potatoes',
          specifications: 'carton'
        }
      },
      {
        type: 'bulk',
        sizes: ['Bin', '2000 lb tote'],
        grades: ['US No. 1', 'US No. 2', 'Processing'],
        usdaMapping: {
          commodity: 'potatoes',
          specifications: 'bulk'
        }
      }
    ]
  },
  {
    commodityId: 'sweet-potato',
    packagingOptions: [
      {
        type: 'carton',
        sizes: ['25 lb', '40 lb', '50 lb'],
        grades: ['US No. 1', 'US No. 2', 'US Commercial'],
        usdaMapping: {
          commodity: 'sweet potatoes'
        }
      },
      {
        type: 'bag',
        sizes: ['3 lb', '5 lb', '10 lb'],
        grades: ['US No. 1', 'US No. 2'],
        usdaMapping: {
          commodity: 'sweet potatoes',
          specifications: 'bagged'
        }
      }
    ]
  }
]

// Helper function to get packaging specs for a commodity
export function getPackagingSpecs(commodityId: string): PackagingSpec[] {
  const specs = packagingSpecs.find(spec => spec.commodityId === commodityId)
  return specs?.packagingOptions || []
}

// Helper function to get USDA mapping info
export function getUsdaMapping(commodityId: string, packagingType: string): { commodity: string, specifications?: string } | null {
  const specs = getPackagingSpecs(commodityId)
  const packaging = specs.find(spec => spec.type === packagingType)
  return packaging?.usdaMapping || null
}
