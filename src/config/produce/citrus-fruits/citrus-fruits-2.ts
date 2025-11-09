// =============================================================================
// CITRUS FRUITS - PART 2 (SPECIALTY CITRUS)
// =============================================================================
// 📋 COMMODITIES COVERED IN THIS FILE:
// • Lemon (3 varieties) - Eureka, Lisbon, Meyer specialty lemons
// • Lime (2 varieties) - Persian, Key lime varieties
// • Grapefruit (3 varieties) - Ruby Red, White, Pink grapefruit
//
// 📁 RELATED FILES:
// • citrus-fruits-1.ts - Major citrus (Orange, Mandarin, Minneola)
// • index.ts - Aggregates all citrus commodities
//
// 🎯 TOTAL: 3 commodities, 8 varieties (~400 lines)

import type { CommodityConfig } from '../../types'

export const specialtyCitrusCommodities: CommodityConfig[] = [
  {
    id: 'lemon',
    name: 'Lemon',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Lemons',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers domestic and imported lemons; variety-specific data available'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        {
          id: 'carton',
          name: 'Carton',
          type: 'carton',
          sizes: [
            { id: '38lb', name: '38lb', weight: '38lb', isDefault: true },
            { id: '40lb', name: '40lb', weight: '40lb' }
          ],
          sizeClassifications: [
            { id: '115s', name: '115s', description: 'Large', isDefault: false },
            { id: '140s', name: '140s', description: 'Medium-Large', isDefault: true },
            { id: '165s', name: '165s', description: 'Medium', isDefault: false },
            { id: '200s', name: '200s', description: 'Small', isDefault: false }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '38lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    
    varieties: {
      'eureka': {
        id: 'eureka',
        name: 'Eureka',
        itemWeight: {
          base: 0.27, // Base weight for 140s
          sizeVariations: {
            '115s': 0.33,
            '140s': 0.27,
            '165s': 0.23,
            '200s': 0.19
          }
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Eureka',
          specifications: 'Year-round lemon variety',
          confidence: 'high'
        }
      },
      'lisbon': {
        id: 'lisbon',
        name: 'Lisbon',
        itemWeight: {
          base: 0.25, // Base weight for 140s
          sizeVariations: {
            '115s': 0.31,
            '140s': 0.25,
            '165s': 0.21,
            '200s': 0.17
          }
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Lisbon',
          specifications: 'Winter lemon variety',
          confidence: 'high'
        }
      },
      'meyer': {
        id: 'meyer',
        name: 'Meyer',
        itemWeight: {
          base: 0.22, // Base weight for 140s (smaller, sweeter)
          sizeVariations: {
            '115s': 0.28,
            '140s': 0.22,
            '165s': 0.18,
            '200s': 0.15
          }
        },
        pricing: {
          basePricePerLb: 4.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Meyer Lemon',
          specifications: 'Sweet specialty lemon',
          confidence: 'medium'
        }
      }
    },
    
    defaultVariety: 'eureka'
  },

  {
    id: 'lime',
    name: 'Lime',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Limes',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers Persian limes primarily; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        {
          id: 'carton',
          name: 'Carton',
          type: 'carton',
          sizes: [
            { id: '10lb', name: '10lb', weight: '10lb', isDefault: true },
            { id: '40lb', name: '40lb', weight: '40lb' }
          ],
          sizeClassifications: [
            { id: '110s', name: '110s', description: 'Large', isDefault: false },
            { id: '150s', name: '150s', description: 'Medium-Large', isDefault: true },
            { id: '200s', name: '200s', description: 'Medium', isDefault: false },
            { id: '250s', name: '250s', description: 'Small', isDefault: false }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '10lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    
    varieties: {
      'persian-lime': {
        id: 'persian-lime',
        name: 'Persian Lime',
        itemWeight: {
          base: 0.067, // Base weight for 150s (very small fruit)
          sizeVariations: {
            '110s': 0.091,
            '150s': 0.067,
            '200s': 0.050,
            '250s': 0.040
          }
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Persian Lime',
          specifications: 'Standard lime variety',
          confidence: 'high'
        }
      },
      'key-lime': {
        id: 'key-lime',
        name: 'Key Lime',
        itemWeight: {
          base: 0.040, // Base weight for 150s (very small)
          sizeVariations: {
            '110s': 0.055,
            '150s': 0.040,
            '200s': 0.030,
            '250s': 0.024
          }
        },
        pricing: {
          basePricePerLb: 5.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Key Lime',
          specifications: 'Small specialty lime',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'persian-lime'
  },

  {
    id: 'grapefruit',
    name: 'Grapefruit',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Grapefruit',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers white and red grapefruit; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        {
          id: 'carton',
          name: 'Carton',
          type: 'carton',
          sizes: [
            { id: '40lb', name: '40lb', weight: '40lb', isDefault: true },
            { id: '50lb', name: '50lb', weight: '50lb' }
          ],
          sizeClassifications: [
            { id: '27s', name: '27s', description: 'Extra Large', isDefault: false },
            { id: '32s', name: '32s', description: 'Large', isDefault: false },
            { id: '36s', name: '36s', description: 'Medium-Large', isDefault: true },
            { id: '40s', name: '40s', description: 'Medium', isDefault: false },
            { id: '48s', name: '48s', description: 'Small', isDefault: false }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '40lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    
    varieties: {
      'ruby-red': {
        id: 'ruby-red',
        name: 'Ruby Red',
        itemWeight: {
          base: 1.11, // Base weight for 36s
          sizeVariations: {
            '27s': 1.48,
            '32s': 1.25,
            '36s': 1.11,
            '40s': 1.00,
            '48s': 0.83
          }
        },
        pricing: {
          basePricePerLb: 1.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Ruby Red',
          specifications: 'Red grapefruit variety',
          confidence: 'high'
        }
      },
      'white': {
        id: 'white',
        name: 'White',
        itemWeight: {
          base: 1.11, // Base weight for 36s
          sizeVariations: {
            '27s': 1.48,
            '32s': 1.25,
            '36s': 1.11,
            '40s': 1.00,
            '48s': 0.83
          }
        },
        pricing: {
          basePricePerLb: 1.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'White Grapefruit',
          specifications: 'Standard white grapefruit',
          confidence: 'high'
        }
      },
      'pink': {
        id: 'pink',
        name: 'Pink',
        itemWeight: {
          base: 1.11, // Base weight for 36s
          sizeVariations: {
            '27s': 1.48,
            '32s': 1.25,
            '36s': 1.11,
            '40s': 1.00,
            '48s': 0.83
          }
        },
        pricing: {
          basePricePerLb: 1.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Pink Grapefruit',
          specifications: 'Pink grapefruit variety',
          confidence: 'high'
        }
      }
    },
    
    defaultVariety: 'ruby-red'
  }
]
