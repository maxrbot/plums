/**
 * Smart packaging suggestions based on commodity type
 * These are shown as quick-add options when users define their packaging structure
 */

export interface PackagingSuggestion {
  packageTypes: string[]
  sizeGrades: string[]
}

export const packagingSuggestions: Record<string, PackagingSuggestion> = {
  // Tomatoes
  'tomato': {
    packageTypes: [
      '25lb 2-Layer Carton',
      '20lb Volume Filled Carton',
      '18lb RPC #6408',
      '15lb Panta-Pack Carton',
      '10lb Box'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Small',
      '3x4',
      '4x5 & Larger',
      'XLarge'
    ]
  },
  'cherry-tomato': {
    packageTypes: [
      '12x1pt Flat',
      '6x1pt Flat',
      '12x6oz Flat',
      '1lb Clamshell',
      '8oz Clamshell'
    ],
    sizeGrades: [
      'Premium',
      'Standard'
    ]
  },
  'grape-tomato': {
    packageTypes: [
      '12lb Place-Packed 12/1pt',
      '20lb Volume Filled Carton',
      '10lb Volume Filled Carton',
      '1lb Clamshell'
    ],
    sizeGrades: [
      'XLarge',
      'Large',
      'Medium'
    ]
  },

  // Cucumbers
  'cucumber': {
    packageTypes: [
      '24ct Place-Packed Carton',
      '36ct Place-Packed Carton',
      '68-72 Volume Filled Carton',
      'RPC #6425',
      'RPC #6411'
    ],
    sizeGrades: [
      'Supers',
      'Selects',
      'Plains',
      'Large',
      'Small',
      '24s',
      '36s'
    ]
  },

  // Peppers
  'pepper': {
    packageTypes: [
      '25lb Carton',
      '35lb Volume Filled Carton',
      '11lb Box',
      '10lb Box',
      'RPC #6416'
    ],
    sizeGrades: [
      'XLarge',
      'Large',
      'Medium',
      'Jumbo',
      'Extra Large'
    ]
  },
  'bell-pepper': {
    packageTypes: [
      '25lb Carton',
      '11lb Box',
      '10lb Box',
      'RPC #6416'
    ],
    sizeGrades: [
      'XLarge',
      'Large',
      'Medium',
      'Jumbo'
    ]
  },
  'chili-pepper': {
    packageTypes: [
      '38lb Carton',
      '25lb Volume Filled Carton',
      '35lb Volume Filled Carton',
      '10lb Box'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Small'
    ]
  },

  // Squash
  'summer-squash': {
    packageTypes: [
      '25lb Place-Packed Carton',
      '20lb Volume Filled Carton',
      '10lb Box',
      'RPC #6423'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Small',
      'Baby'
    ]
  },
  'winter-squash': {
    packageTypes: [
      '25lb Place-Packed Carton',
      '40lb Carton',
      '35lb Carton',
      '10lb Box'
    ],
    sizeGrades: [
      'XLarge',
      'Large',
      'Medium',
      'Small',
      'Jumbo'
    ]
  },

  // Citrus
  'orange': {
    packageTypes: [
      '40lb Carton',
      '25lb Carton',
      '8lb Bag',
      '5lb Bag',
      '3lb Bag'
    ],
    sizeGrades: [
      '48s',
      '56s',
      '72s',
      '88s',
      '113s',
      'Choice',
      'Fancy'
    ]
  },
  'lemon': {
    packageTypes: [
      '40lb Carton',
      '25lb Carton',
      '10lb Carton',
      '5lb Bag',
      '2lb Bag'
    ],
    sizeGrades: [
      '75s',
      '95s',
      '115s',
      '140s',
      'Choice',
      'Fancy'
    ]
  },
  'lime': {
    packageTypes: [
      '40lb Carton',
      '20lb Carton',
      '10lb Carton',
      '5lb Bag'
    ],
    sizeGrades: [
      '110s',
      '150s',
      '175s',
      '200s',
      '250s'
    ]
  },
  'grapefruit': {
    packageTypes: [
      '40lb Carton',
      '25lb Carton',
      '20lb Carton',
      '8lb Bag',
      '5lb Bag'
    ],
    sizeGrades: [
      '23s',
      '27s',
      '32s',
      '36s',
      '40s',
      '48s'
    ]
  },

  // Berries
  'strawberry': {
    packageTypes: [
      '8x1lb Flat',
      '12x1lb Flat',
      '8x2lb Flat',
      '1lb Clamshell',
      '2lb Clamshell'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Extra Large',
      'Premium'
    ]
  },
  'blueberry': {
    packageTypes: [
      '12x1pt Flat',
      '6x1pt Flat',
      '6oz Clamshell',
      '18oz Clamshell',
      '10lb Bulk'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Jumbo'
    ]
  },
  'raspberry': {
    packageTypes: [
      '12x6oz Flat',
      '12x1pt Flat',
      '6oz Clamshell',
      '1pt Clamshell'
    ],
    sizeGrades: [
      'Premium',
      'Standard'
    ]
  },
  'blackberry': {
    packageTypes: [
      '12x6oz Flat',
      '12x1pt Flat',
      '6oz Clamshell',
      '1pt Clamshell'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Jumbo'
    ]
  },

  // Leafy Greens
  'lettuce': {
    packageTypes: [
      '24ct Carton',
      '30ct Carton',
      'RPC #4719',
      'Bulk Carton'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      '24ct',
      '30ct'
    ]
  },
  'mixed-greens': {
    packageTypes: [
      '5oz Clamshell',
      '1lb Clamshell',
      '3lb Bag',
      '10lb Bulk'
    ],
    sizeGrades: []
  },
  'spinach': {
    packageTypes: [
      '4oz Clamshell',
      '10oz Clamshell',
      '1lb Clamshell',
      '3lb Bag'
    ],
    sizeGrades: [
      'Baby',
      'Regular'
    ]
  },

  // Root Vegetables
  'carrot': {
    packageTypes: [
      '50lb Carton',
      '25lb Bag',
      '10lb Bag',
      '5lb Bag',
      '2lb Bag'
    ],
    sizeGrades: [
      'Jumbo',
      'Large',
      'Medium',
      'Baby'
    ]
  },
  'onion': {
    packageTypes: [
      '50lb Carton',
      '50lb Bag',
      '25lb Bag',
      '10lb Bag',
      '5lb Bag'
    ],
    sizeGrades: [
      'Jumbo',
      'Colossal',
      'Super Colossal',
      'Medium',
      'Small'
    ]
  },
  'potato': {
    packageTypes: [
      '50lb Carton',
      '50lb Bag',
      '25lb Bag',
      '10lb Bag',
      '5lb Bag'
    ],
    sizeGrades: [
      '70ct',
      '80ct',
      '90ct',
      '100ct',
      'Chef',
      'A Size',
      'B Size'
    ]
  },

  // Melons
  'watermelon': {
    packageTypes: [
      'Bulk Bin',
      '4ct Carton',
      '5ct Carton',
      '6ct Carton',
      'Mini 6ct'
    ],
    sizeGrades: [
      '18-22lb',
      '23-27lb',
      '28-32lb',
      '33-37lb',
      'Mini'
    ]
  },
  'cantaloupe': {
    packageTypes: [
      '9ct Carton',
      '12ct Carton',
      '15ct Carton',
      '18ct Carton',
      'RPC #4714'
    ],
    sizeGrades: [
      '9s',
      '12s',
      '15s',
      '18s',
      'Jumbo'
    ]
  },
  'honeydew': {
    packageTypes: [
      '5ct Carton',
      '6ct Carton',
      '8ct Carton',
      '10ct Carton'
    ],
    sizeGrades: [
      '5s',
      '6s',
      '8s',
      'Large',
      'Jumbo'
    ]
  },

  // Stone Fruit
  'peach': {
    packageTypes: [
      '25lb 2-Layer Carton',
      '22lb Volume Filled Carton',
      '18lb Lug'
    ],
    sizeGrades: [
      '48s',
      '56s',
      '64s',
      '70s',
      'Large',
      'Extra Large'
    ]
  },
  'nectarine': {
    packageTypes: [
      '25lb 2-Layer Carton',
      '22lb Volume Filled Carton',
      '18lb Lug'
    ],
    sizeGrades: [
      '48s',
      '56s',
      '64s',
      '70s',
      'Large'
    ]
  },
  'plum': {
    packageTypes: [
      '28lb 2-Layer Carton',
      '25lb Volume Filled Carton',
      '20lb Carton'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      'Small',
      'Jumbo'
    ]
  },

  // Apples & Pears
  'apple': {
    packageTypes: [
      '40lb Carton',
      '42lb Carton',
      '20lb Box',
      '3lb Bag',
      '5lb Bag'
    ],
    sizeGrades: [
      '72s',
      '80s',
      '88s',
      '100s',
      '113s',
      'Extra Fancy',
      'Fancy'
    ]
  },
  'pear': {
    packageTypes: [
      '40lb Carton',
      '44lb Carton',
      '22lb Box',
      '3lb Bag'
    ],
    sizeGrades: [
      '60s',
      '70s',
      '80s',
      '90s',
      '100s',
      '110s'
    ]
  },

  // Brassicas
  'broccoli': {
    packageTypes: [
      '14ct Carton',
      '18ct Carton',
      '20ct Carton',
      'RPC #4717'
    ],
    sizeGrades: [
      'Standard',
      'Premium',
      '14ct',
      '18ct',
      '20ct'
    ]
  },
  'cauliflower': {
    packageTypes: [
      '12ct Carton',
      '16ct Carton',
      '18ct Carton',
      '9ct Box'
    ],
    sizeGrades: [
      'Large',
      'Medium',
      '12ct',
      '16ct'
    ]
  },

  // Avocados
  'avocado': {
    packageTypes: [
      '25lb Carton',
      '22lb Carton',
      '10lb Flat',
      '4ct Bag'
    ],
    sizeGrades: [
      '32s',
      '36s',
      '40s',
      '48s',
      '60s',
      '70s',
      'Large',
      'Medium'
    ]
  },

  // Grapes
  'grape': {
    packageTypes: [
      '18lb Clamshell Display',
      '16lb Carton',
      '19lb Carton',
      '2lb Clamshell'
    ],
    sizeGrades: [
      'Jumbo',
      'Large',
      'Medium'
    ]
  }
}

// Fallback suggestions for unmapped commodities
export const defaultPackagingSuggestions: PackagingSuggestion = {
  packageTypes: [
    '25lb Carton',
    '10lb Box',
    '5lb Bag',
    'Flat',
    'Clamshell'
  ],
  sizeGrades: [
    'Large',
    'Medium',
    'Small',
    'XLarge',
    'Jumbo'
  ]
}

/**
 * Get packaging suggestions for a specific commodity
 * Returns commodity-specific suggestions or defaults
 */
export function getPackagingSuggestions(commodityName: string): PackagingSuggestion {
  const normalizedName = commodityName.toLowerCase().trim()
  return packagingSuggestions[normalizedName] || defaultPackagingSuggestions
}

