// Unified Commodity Packaging System
// Handles Cut/Processing → Package Type → Size → Count (for fruit sizing)

export interface PackageSize {
  id: string
  name: string // "40lb", "25lb", "14ct", "18ct"
  weight?: string // "40lb", "25lb" 
  count?: string // "14ct", "18ct"
  isDefault?: boolean
}

export interface FruitCount {
  id: string
  name: string // "56s", "72s", "88s", "113s"
  description?: string // "Large", "Medium", "Small"
  isDefault?: boolean
}

export interface PackageType {
  id: string
  name: string // "Carton", "Bag", "Case", "Bunch"
  type: 'carton' | 'bag' | 'case' | 'bunch' | 'clamshell' | 'tray' | 'bulk'
  sizes: PackageSize[]
  fruitCounts?: FruitCount[] // Only for fruit commodities
  isDefault?: boolean
}

export interface ProcessingType {
  id: string
  name: string // "Whole", "Florets", "Diced", "Crown Cut"
  description?: string
  packageTypes: PackageType[]
  isDefault?: boolean
}

export interface CommodityPackaging {
  commodityId: string
  hasProcessing: boolean // true for broccoli/celery, false for oranges
  processingTypes?: ProcessingType[] // Only if hasProcessing = true
  packageTypes?: PackageType[] // Direct packaging if no processing (like oranges)
  grades: string[] // ["Fancy", "Choice", "Premium"]
  defaultGrade?: string
}

// Commodity packaging configurations
export const commodityPackagingConfig: CommodityPackaging[] = [
  // CITRUS - No processing, direct to packaging
  {
    commodityId: 'orange',
    hasProcessing: false,
    packageTypes: [
      {
        id: 'carton',
        name: 'Carton',
        type: 'carton',
        sizes: [
          { id: '40lb', name: '40lb', weight: '40lb', isDefault: true },
          { id: '25lb', name: '25lb', weight: '25lb' },
          { id: '35lb', name: '35lb', weight: '35lb' }
        ],
        fruitCounts: [
          { id: '56s', name: '56s', description: 'Extra Large', isDefault: true },
          { id: '72s', name: '72s', description: 'Large' },
          { id: '88s', name: '88s', description: 'Medium' },
          { id: '113s', name: '113s', description: 'Small' }
        ],
        isDefault: true
      },
      {
        id: 'bag',
        name: 'Bag',
        type: 'bag',
        sizes: [
          { id: '3lb', name: '3lb', weight: '3lb', isDefault: true },
          { id: '5lb', name: '5lb', weight: '5lb' },
          { id: '1lb', name: '1lb', weight: '1lb' }
        ]
        // No fruit counts for retail bags
      }
    ],
    grades: ['Fancy', 'Choice', 'Standard'],
    defaultGrade: 'Fancy'
  },

  // BROCCOLI - Has processing types
  {
    commodityId: 'broccoli',
    hasProcessing: true,
    processingTypes: [
      {
        id: 'crown-cut',
        name: 'Crown Cut',
        description: 'Traditional large heads with stems trimmed',
        packageTypes: [
          {
            id: 'case',
            name: 'Case',
            type: 'case',
            sizes: [
              { id: '14ct', name: '14ct', count: '14ct', isDefault: true },
              { id: '18ct', name: '18ct', count: '18ct' },
              { id: '12ct', name: '12ct', count: '12ct' }
            ],
            isDefault: true
          },
          {
            id: 'box',
            name: 'Box',
            type: 'carton',
            sizes: [
              { id: '25lb', name: '25lb', weight: '25lb', isDefault: true },
              { id: '20lb', name: '20lb', weight: '20lb' }
            ]
          }
        ],
        isDefault: true
      },
      {
        id: 'bunched',
        name: 'Bunched',
        description: 'Smaller heads with longer stems, bunched together',
        packageTypes: [
          {
            id: 'case',
            name: 'Case',
            type: 'case',
            sizes: [
              { id: '14ct', name: '14ct', count: '14ct', isDefault: true },
              { id: '18ct', name: '18ct', count: '18ct' }
            ],
            isDefault: true
          },
          {
            id: 'bunch',
            name: 'Bunch',
            type: 'bunch',
            sizes: [
              { id: '1ct', name: '1ct', count: '1ct', isDefault: true },
              { id: '3ct', name: '3ct', count: '3ct' }
            ]
          }
        ]
      },
      {
        id: 'florets',
        name: 'Florets',
        description: 'Pre-cut florets for convenience',
        packageTypes: [
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '2lb', name: '2lb', weight: '2lb', isDefault: true },
              { id: '1lb', name: '1lb', weight: '1lb' },
              { id: '5lb', name: '5lb', weight: '5lb' },
              { id: '12oz', name: '12oz', weight: '12oz' }
            ],
            isDefault: true
          },
          {
            id: 'box',
            name: 'Box',
            type: 'carton',
            sizes: [
              { id: '5lb', name: '5lb', weight: '5lb', isDefault: true }
            ]
          }
        ]
      },
      {
        id: 'baby-broccoli',
        name: 'Baby Broccoli (Broccolini)',
        description: 'Tender shoots with small heads',
        packageTypes: [
          {
            id: 'bunch',
            name: 'Bunch',
            type: 'bunch',
            sizes: [
              { id: '1ct', name: '1ct', count: '1ct', isDefault: true }
            ],
            isDefault: true
          },
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '8oz', name: '8oz', weight: '8oz', isDefault: true },
              { id: '4oz', name: '4oz', weight: '4oz' }
            ]
          }
        ]
      },
      {
        id: 'asian-style',
        name: 'Asian Style',
        description: 'Cut with longer stems for Asian cuisine',
        packageTypes: [
          {
            id: 'case',
            name: 'Case',
            type: 'case',
            sizes: [
              { id: '14ct', name: '14ct', count: '14ct', isDefault: true },
              { id: '18ct', name: '18ct', count: '18ct' }
            ],
            isDefault: true
          },
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '2lb', name: '2lb', weight: '2lb', isDefault: true },
              { id: '1lb', name: '1lb', weight: '1lb' }
            ]
          }
        ]
      },
      {
        id: 'loose',
        name: 'Loose',
        description: 'Bulk loose for bins',
        packageTypes: [
          {
            id: 'bulk',
            name: 'Bulk',
            type: 'bulk',
            sizes: [
              { id: 'per-lb', name: 'Per Lb', weight: 'per-lb', isDefault: true }
            ],
            isDefault: true
          }
        ]
      }
    ],
    grades: ['Premium', 'Choice', 'Standard'],
    defaultGrade: 'Premium'
  },

  // CELERY - Has processing types
  {
    commodityId: 'celery',
    hasProcessing: true,
    processingTypes: [
      {
        id: 'whole',
        name: 'Whole',
        description: 'Whole stalks',
        packageTypes: [
          {
            id: 'carton',
            name: 'Carton',
            type: 'carton',
            sizes: [
              { id: '30ct', name: '30ct', count: '30ct', isDefault: true },
              { id: '36ct', name: '36ct', count: '36ct' },
              { id: '24ct', name: '24ct', count: '24ct' }
            ],
            isDefault: true
          }
        ],
        isDefault: true
      },
      {
        id: 'diced',
        name: 'Diced',
        description: 'Pre-cut diced',
        packageTypes: [
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '2lb', name: '2lb', weight: '2lb', isDefault: true },
              { id: '5lb', name: '5lb', weight: '5lb' }
            ],
            isDefault: true
          }
        ]
      },
      {
        id: 'sticks',
        name: 'Sticks',
        description: 'Pre-cut sticks',
        packageTypes: [
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '2lb', name: '2lb', weight: '2lb', isDefault: true },
              { id: '1lb', name: '1lb', weight: '1lb' }
            ],
            isDefault: true
          }
        ]
      }
    ],
    grades: ['Premium', 'Choice'],
    defaultGrade: 'Premium'
  },

  // LETTUCE - Has processing types
  {
    commodityId: 'lettuce',
    hasProcessing: true,
    processingTypes: [
      {
        id: 'whole-head',
        name: 'Whole Head',
        description: 'Whole lettuce heads',
        packageTypes: [
          {
            id: 'carton',
            name: 'Carton',
            type: 'carton',
            sizes: [
              { id: '24ct', name: '24ct', count: '24ct', isDefault: true },
              { id: '30ct', name: '30ct', count: '30ct' }
            ],
            isDefault: true
          }
        ],
        isDefault: true
      },
      {
        id: 'chopped',
        name: 'Chopped',
        description: 'Pre-chopped lettuce',
        packageTypes: [
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '1lb', name: '1lb', weight: '1lb', isDefault: true },
              { id: '2lb', name: '2lb', weight: '2lb' },
              { id: '5lb', name: '5lb', weight: '5lb' }
            ],
            isDefault: true
          },
          {
            id: 'clamshell',
            name: 'Clamshell',
            type: 'clamshell',
            sizes: [
              { id: '5oz', name: '5oz', weight: '5oz', isDefault: true },
              { id: '10oz', name: '10oz', weight: '10oz' }
            ]
          }
        ]
      },
      {
        id: 'shredded',
        name: 'Shredded',
        description: 'Pre-shredded lettuce',
        packageTypes: [
          {
            id: 'bag',
            name: 'Bag',
            type: 'bag',
            sizes: [
              { id: '1lb', name: '1lb', weight: '1lb', isDefault: true },
              { id: '2lb', name: '2lb', weight: '2lb' }
            ],
            isDefault: true
          }
        ]
      }
    ],
    grades: ['Premium', 'Choice'],
    defaultGrade: 'Premium'
  }
]

// Helper functions
export function getCommodityPackaging(commodityId: string): CommodityPackaging | undefined {
  return commodityPackagingConfig.find(config => config.commodityId === commodityId)
}

export function getDefaultProcessingType(commodityId: string): ProcessingType | undefined {
  const config = getCommodityPackaging(commodityId)
  if (!config?.hasProcessing || !config.processingTypes) return undefined
  return config.processingTypes.find(pt => pt.isDefault) || config.processingTypes[0]
}

export function getDefaultPackageType(commodityId: string, processingTypeId?: string): PackageType | undefined {
  const config = getCommodityPackaging(commodityId)
  
  if (!config?.hasProcessing) {
    // Direct packaging (like oranges)
    return config?.packageTypes?.find(pt => pt.isDefault) || config?.packageTypes?.[0]
  }
  
  // Has processing types
  const processingType = config.processingTypes?.find(pt => pt.id === processingTypeId)
  return processingType?.packageTypes.find(pt => pt.isDefault) || processingType?.packageTypes[0]
}

export function getDefaultSize(commodityId: string, processingTypeId?: string, packageTypeId?: string): PackageSize | undefined {
  const config = getCommodityPackaging(commodityId)
  
  let packageType: PackageType | undefined
  
  if (!config?.hasProcessing) {
    packageType = config?.packageTypes?.find(pt => pt.id === packageTypeId)
  } else {
    const processingType = config.processingTypes?.find(pt => pt.id === processingTypeId)
    packageType = processingType?.packageTypes.find(pt => pt.id === packageTypeId)
  }
  
  return packageType?.sizes.find(s => s.isDefault) || packageType?.sizes[0]
}

export function getDefaultFruitCount(commodityId: string, packageTypeId?: string): FruitCount | undefined {
  const config = getCommodityPackaging(commodityId)
  
  if (!config?.hasProcessing) {
    const packageType = config?.packageTypes?.find(pt => pt.id === packageTypeId)
    return packageType?.fruitCounts?.find(fc => fc.isDefault) || packageType?.fruitCounts?.[0]
  }
  
  return undefined
}

export function getDefaultGrade(commodityId: string): string | undefined {
  const config = getCommodityPackaging(commodityId)
  return config?.defaultGrade || config?.grades[0]
}
