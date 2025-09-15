// =============================================================================
// LEAFY GREENS COMMODITIES
// =============================================================================
// Complete category: Lettuce, Spinach, Kale, Swiss Chard, Arugula, Celery

import type { CommodityConfig } from '../types'

export const leafyGreensCommodities: CommodityConfig[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Lettuce',
        specifications: 'CARTONS'
      },
      notes: 'USDA primarily covers iceberg; other varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
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
                { id: '24ct', name: '24 Count', count: '24ct', isDefault: true },
                { id: '30ct', name: '30 Count', count: '30ct' }
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
            }
          ]
        }
      ],
      defaultType: 'whole-head'
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: 'carton',
      defaultSize: '24 Count'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'iceberg': {
        id: 'iceberg',
        name: 'Iceberg',
        itemWeight: {
          base: 1.5, // 1.5 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Iceberg',
          specifications: 'CARTONS',
          confidence: 'high'
        }
      },
      'romaine': {
        id: 'romaine',
        name: 'Romaine',
        itemWeight: {
          base: 1.2, // 1.2 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Romaine',
          specifications: 'CARTONS',
          confidence: 'high'
        }
      },
      'butterhead': {
        id: 'butterhead',
        name: 'Butterhead',
        itemWeight: {
          base: 0.8, // 0.8 lbs per head (smaller, tender)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Butterhead',
          specifications: 'Boston/Bibb type lettuce',
          confidence: 'medium'
        }
      },
      'red-leaf': {
        id: 'red-leaf',
        name: 'Red Leaf',
        itemWeight: {
          base: 1.1, // 1.1 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Leaf',
          specifications: 'Loose leaf red lettuce',
          confidence: 'medium'
        }
      },
      'green-leaf': {
        id: 'green-leaf',
        name: 'Green Leaf',
        itemWeight: {
          base: 1.1, // 1.1 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Green Leaf',
          specifications: 'Loose leaf green lettuce',
          confidence: 'medium'
        }
      },
      'bibb': {
        id: 'bibb',
        name: 'Bibb',
        itemWeight: {
          base: 0.6, // 0.6 lbs per head (small, premium)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Bibb',
          specifications: 'Small butterhead type',
          confidence: 'low'
        }
      },
      'boston': {
        id: 'boston',
        name: 'Boston',
        itemWeight: {
          base: 0.9, // 0.9 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Boston',
          specifications: 'Butterhead type lettuce',
          confidence: 'medium'
        }
      },
      'little-gem': {
        id: 'little-gem',
        name: 'Little Gem',
        itemWeight: {
          base: 0.4, // 0.4 lbs per head (very small)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Little Gem',
          specifications: 'Mini romaine type',
          confidence: 'low'
        }
      },
      'endive': {
        id: 'endive',
        name: 'Endive',
        itemWeight: {
          base: 0.7, // 0.7 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 4.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Endive',
          specifications: 'Belgian endive specialty',
          confidence: 'none'
        }
      },
      'escarole': {
        id: 'escarole',
        name: 'Escarole',
        itemWeight: {
          base: 1.3, // 1.3 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Escarole',
          specifications: 'Broad leaf endive',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'iceberg'
  },

  {
    id: 'spinach',
    name: 'Spinach',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Spinach',
        specifications: 'Fresh market spinach, bunched and loose leaf'
      },
      notes: 'USDA covers both baby and mature spinach; variety-specific data limited'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaf',
          name: 'Whole Leaf',
          description: 'Whole spinach leaves, bunched or loose',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12bunch', name: '12 Bunch', count: '12bunch', isDefault: true },
                { id: '24bunch', name: '24 Bunch', count: '24bunch' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '18ct', name: '18 Count', count: '18ct' },
                { id: '24ct', name: '24 Count', count: '24ct' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'baby-spinach',
          name: 'Baby Spinach',
          description: 'Young tender spinach leaves',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '5oz', name: '5oz', weight: '5oz' },
                { id: '1lb', name: '1lb', weight: '1lb', isDefault: true },
                { id: '2.5lb', name: '2.5lb', weight: '2.5lb' }
              ],
              isDefault: true
            },
            {
              id: 'case',
              name: 'Case',
              type: 'case',
              sizes: [
                { id: '4lb', name: '4lb', weight: '4lb' }
              ]
            }
          ]
        }
      ],
      defaultType: 'whole-leaf'
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: 'bunch',
      defaultSize: '12 Bunch'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'baby-spinach': {
        id: 'baby-spinach',
        name: 'Baby Spinach',
        itemWeight: {
          base: 0.15, // 0.15 lbs per bunch (baby spinach is lighter)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Baby Spinach',
          specifications: 'Young leaves, 1-3 inches',
          confidence: 'high'
        }
      },
      'savoy': {
        id: 'savoy',
        name: 'Savoy',
        itemWeight: {
          base: 0.25, // 0.25 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Savoy Spinach',
          specifications: 'Crinkled dark green leaves',
          confidence: 'medium'
        }
      },
      'flat-leaf': {
        id: 'flat-leaf',
        name: 'Flat Leaf',
        itemWeight: {
          base: 0.25, // 0.25 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Flat Leaf Spinach',
          specifications: 'Smooth flat leaves',
          confidence: 'medium'
        }
      },
      'bloomsdale': {
        id: 'bloomsdale',
        name: 'Bloomsdale',
        itemWeight: {
          base: 0.28, // 0.28 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Bloomsdale Spinach',
          specifications: 'Heirloom variety, savoyed leaves',
          confidence: 'low'
        }
      },
      'tyee': {
        id: 'tyee',
        name: 'Tyee',
        itemWeight: {
          base: 0.26, // 0.26 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Tyee Spinach',
          specifications: 'Hybrid variety, bolt-resistant',
          confidence: 'low'
        }
      },
      'space': {
        id: 'space',
        name: 'Space',
        itemWeight: {
          base: 0.24, // 0.24 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.05,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Space Spinach',
          specifications: 'Compact variety for dense planting',
          confidence: 'low'
        }
      },
      'melody': {
        id: 'melody',
        name: 'Melody',
        itemWeight: {
          base: 0.27, // 0.27 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Melody Spinach',
          specifications: 'Disease-resistant hybrid',
          confidence: 'low'
        }
      },
      'corvair': {
        id: 'corvair',
        name: 'Corvair',
        itemWeight: {
          base: 0.25, // 0.25 lbs per bunch
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Corvair Spinach',
          specifications: 'Heat-tolerant variety',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'baby-spinach'
  },

  {
    id: 'kale',
    name: 'Kale',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Kale',
        specifications: 'Fresh market kale, bunched and loose leaf'
      },
      notes: 'USDA covers common varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaf',
          name: 'Whole Leaf',
          description: 'Whole kale leaves, bunched or loose',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12bunch', name: '12 Bunch', count: '12bunch', isDefault: true },
                { id: '18bunch', name: '18 Bunch', count: '18bunch' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ],
      defaultType: 'whole-leaf'
    },
    
    packaging: {
      types: [],
      defaultPackage: 'bunch',
      defaultSize: '12 Bunch'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'curly-kale': {
        id: 'curly-kale',
        name: 'Curly Kale',
        itemWeight: {
          base: 0.35,
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Curly Kale',
          specifications: 'Traditional curly leaf kale',
          confidence: 'high'
        }
      },
      'lacinato': {
        id: 'lacinato',
        name: 'Lacinato (Dinosaur)',
        itemWeight: {
          base: 0.32,
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Lacinato Kale',
          specifications: 'Dark blue-green, textured leaves',
          confidence: 'medium'
        }
      }
    },
    
    defaultVariety: 'curly-kale'
  },

  {
    id: 'chard',
    name: 'Swiss Chard',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Swiss Chard',
        specifications: 'Fresh market chard, bunched'
      },
      notes: 'USDA covers basic chard; colorful varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-bunch',
          name: 'Whole Bunch',
          description: 'Whole chard bunches with stems',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12bunch', name: '12 Bunch', count: '12bunch', isDefault: true }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ],
      defaultType: 'whole-bunch'
    },
    
    packaging: {
      types: [],
      defaultPackage: 'bunch',
      defaultSize: '12 Bunch'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'rainbow-chard': {
        id: 'rainbow-chard',
        name: 'Rainbow Chard',
        itemWeight: {
          base: 0.45,
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Rainbow Chard',
          specifications: 'Multi-colored stem variety',
          confidence: 'medium'
        }
      }
    },
    
    defaultVariety: 'rainbow-chard'
  },

  {
    id: 'arugula',
    name: 'Arugula',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Arugula',
        specifications: 'Fresh market arugula, loose leaf and bunched'
      },
      notes: 'USDA covers basic arugula; wild varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaf',
          name: 'Whole Leaf',
          description: 'Whole arugula leaves, loose or bunched',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '5oz', name: '5oz', weight: '5oz', isDefault: true }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ],
      defaultType: 'whole-leaf'
    },
    
    packaging: {
      types: [],
      defaultPackage: 'bag',
      defaultSize: '5oz'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'cultivated-arugula': {
        id: 'cultivated-arugula',
        name: 'Cultivated Arugula',
        itemWeight: {
          base: 0.15,
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Cultivated Arugula',
          specifications: 'Standard commercial arugula',
          confidence: 'high'
        }
      }
    },
    
    defaultVariety: 'cultivated-arugula'
  },

  {
    id: 'celery',
    name: 'Celery',
    category: 'Leafy Greens',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Celery',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers standard celery; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-bunch',
          name: 'Whole Bunch',
          description: 'Whole celery bunches',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '30ct', name: '30 Count', count: '30ct', isDefault: true }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ],
      defaultType: 'whole-bunch'
    },
    
    packaging: {
      types: [],
      defaultPackage: 'carton',
      defaultSize: '30 Count'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'pascal': {
        id: 'pascal',
        name: 'Pascal',
        itemWeight: {
          base: 2.2,
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          specifications: 'CARTONS',
          confidence: 'high'
        }
      }
    },
    
    defaultVariety: 'pascal'
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getLeafyGreensCommodity(commodityId: string): CommodityConfig | undefined {
  return leafyGreensCommodities.find(c => c.id === commodityId)
}

export function getLeafyGreensVariety(commodityId: string, varietyId: string) {
  const commodity = getLeafyGreensCommodity(commodityId)
  return commodity?.varieties[varietyId]
}
