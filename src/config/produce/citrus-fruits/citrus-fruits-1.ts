// =============================================================================
// CITRUS FRUITS - PART 1 (MAJOR CITRUS)
// =============================================================================
// 📋 COMMODITIES COVERED IN THIS FILE:
// • Orange (13 varieties) - Primary citrus commodity
// • Mandarin (9 varieties) - Tangerines, clementines, specialty mandarins  
// • Minneola (3 varieties) - Tangelos and specialty hybrids
//
// 📁 RELATED FILES:
// • citrus-fruits-2.ts - Specialty citrus (Lemon, Lime, Grapefruit)
// • index.ts - Aggregates all citrus commodities
//
// 🎯 TOTAL: 3 commodities, 25 varieties (~500 lines)

import type { CommodityConfig } from '../../types'

export const majorCitrusCommodities: CommodityConfig[] = [
  {
    id: 'orange',
    name: 'Orange',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Oranges',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers navel and valencia; specialty varieties estimated'
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
            { id: '25lb', name: '25lb', weight: '25lb' },
            { id: '40lb', name: '40lb', weight: '40lb', isDefault: true }
          ],
          fruitCounts: [
            { id: '56s', name: '56s', description: 'Large', isDefault: false },
            { id: '72s', name: '72s', description: 'Medium-Large', isDefault: true },
            { id: '88s', name: '88s', description: 'Medium', isDefault: false },
            { id: '113s', name: '113s', description: 'Small', isDefault: false }
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
      'navel': {
        id: 'navel',
        name: 'Navel',
        itemWeight: {
          base: 0.75, // Base weight for 72s
          sizeVariations: {
            '56s': 0.95, // Larger oranges
            '72s': 0.75, // Standard size
            '88s': 0.65, // Medium oranges
            '113s': 0.50  // Smaller oranges
          }
        },
        pricing: {
          basePricePerLb: 1.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Navel',
          specifications: 'CARTONS',
          confidence: 'high'
        }
      },
      'valencia': {
        id: 'valencia',
        name: 'Valencia',
        itemWeight: {
          base: 0.70, // Base weight for 72s
          sizeVariations: {
            '56s': 0.90,
            '72s': 0.70,
            '88s': 0.60,
            '113s': 0.45
          }
        },
        pricing: {
          basePricePerLb: 1.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Valencia',
          specifications: 'CARTONS',
          confidence: 'high'
        }
      },
      'cara-cara': {
        id: 'cara-cara',
        name: 'Cara Cara',
        itemWeight: {
          base: 0.80, // Base weight for 72s
          sizeVariations: {
            '56s': 1.00,
            '72s': 0.80,
            '88s': 0.70,
            '113s': 0.55
          }
        },
        pricing: {
          basePricePerLb: 2.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Cara Cara',
          specifications: 'Pink navel orange variety',
          confidence: 'medium'
        }
      },
      'blood-orange': {
        id: 'blood-orange',
        name: 'Blood Orange',
        itemWeight: {
          base: 0.65, // Base weight for 72s
          sizeVariations: {
            '56s': 0.85,
            '72s': 0.65,
            '88s': 0.55,
            '113s': 0.40
          }
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Blood Orange',
          specifications: 'Specialty red-flesh variety',
          confidence: 'low'
        }
      },
      'seville': {
        id: 'seville',
        name: 'Seville',
        itemWeight: {
          base: 0.60, // Base weight for 72s
          sizeVariations: {
            '56s': 0.80,
            '72s': 0.60,
            '88s': 0.50,
            '113s': 0.35
          }
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Seville Orange',
          specifications: 'Bitter orange for marmalade',
          confidence: 'none'
        }
      },
      'hamlin': {
        id: 'hamlin',
        name: 'Hamlin',
        itemWeight: {
          base: 0.68, // Base weight for 72s
          sizeVariations: {
            '56s': 0.88,
            '72s': 0.68,
            '88s': 0.58,
            '113s': 0.43
          }
        },
        pricing: {
          basePricePerLb: 1.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Hamlin',
          specifications: 'Early season juice orange',
          confidence: 'medium'
        }
      },
      'pineapple-orange': {
        id: 'pineapple-orange',
        name: 'Pineapple Orange',
        itemWeight: {
          base: 0.72, // Base weight for 72s
          sizeVariations: {
            '56s': 0.92,
            '72s': 0.72,
            '88s': 0.62,
            '113s': 0.47
          }
        },
        pricing: {
          basePricePerLb: 2.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Pineapple Orange',
          specifications: 'Mid-season variety',
          confidence: 'medium'
        }
      },
      'jaffa': {
        id: 'jaffa',
        name: 'Jaffa',
        itemWeight: {
          base: 0.78, // Base weight for 72s
          sizeVariations: {
            '56s': 0.98,
            '72s': 0.78,
            '88s': 0.68,
            '113s': 0.53
          }
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Jaffa Orange',
          specifications: 'Premium Mediterranean variety',
          confidence: 'none'
        }
      },
      'pink-cara-cara': {
        id: 'pink-cara-cara',
        name: 'I\'m Pink™ Cara Cara',
        itemWeight: {
          base: 0.82, // Base weight for 72s
          sizeVariations: {
            '56s': 1.02,
            '72s': 0.82,
            '88s': 0.72,
            '113s': 0.57
          }
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Pink Cara Cara',
          specifications: 'Premium pink navel variety',
          confidence: 'low'
        }
      },
      'heirloom-navel': {
        id: 'heirloom-navel',
        name: 'Reserve Heirloom Navels',
        itemWeight: {
          base: 0.85, // Base weight for 72s
          sizeVariations: {
            '56s': 1.05,
            '72s': 0.85,
            '88s': 0.75,
            '113s': 0.60
          }
        },
        pricing: {
          basePricePerLb: 2.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Heirloom Navel',
          specifications: 'Heritage navel variety',
          confidence: 'low'
        }
      },
      'chile-valencia': {
        id: 'chile-valencia',
        name: 'Import (Chile) Valencias',
        itemWeight: {
          base: 0.68, // Base weight for 72s
          sizeVariations: {
            '56s': 0.88,
            '72s': 0.68,
            '88s': 0.58,
            '113s': 0.43
          }
        },
        pricing: {
          basePricePerLb: 2.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Imported Valencia',
          specifications: 'Chilean valencia oranges',
          confidence: 'medium'
        }
      },
      'rosy-red-valencia': {
        id: 'rosy-red-valencia',
        name: 'Rosy Red Valencia',
        itemWeight: {
          base: 0.72, // Base weight for 72s
          sizeVariations: {
            '56s': 0.92,
            '72s': 0.72,
            '88s': 0.62,
            '113s': 0.47
          }
        },
        pricing: {
          basePricePerLb: 2.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Rosy Red Valencia',
          specifications: 'Red-blushed valencia variety',
          confidence: 'low'
        }
      },
      'summer-navel': {
        id: 'summer-navel',
        name: 'Summer Navels',
        itemWeight: {
          base: 0.77, // Base weight for 72s
          sizeVariations: {
            '56s': 0.97,
            '72s': 0.77,
            '88s': 0.67,
            '113s': 0.52
          }
        },
        pricing: {
          basePricePerLb: 2.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Summer Navel',
          specifications: 'Late season navel variety',
          confidence: 'medium'
        }
      }
    },
    
    defaultVariety: 'navel'
  },

  {
    id: 'mandarin',
    name: 'Mandarin',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Tangerines',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers tangerines/mandarins; specialty varieties estimated'
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
            { id: '25lb', name: '25lb', weight: '25lb', isDefault: true },
            { id: '40lb', name: '40lb', weight: '40lb' }
          ],
          fruitCounts: [
            { id: '80s', name: '80s', description: 'Large', isDefault: false },
            { id: '100s', name: '100s', description: 'Medium-Large', isDefault: true },
            { id: '120s', name: '120s', description: 'Medium', isDefault: false },
            { id: '150s', name: '150s', description: 'Small', isDefault: false }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    
    varieties: {
      'sumo-citrus': {
        id: 'sumo-citrus',
        name: 'Sumo Citrus',
        itemWeight: {
          base: 0.55, // Base weight for 100s
          sizeVariations: {
            '80s': 0.70,
            '100s': 0.55,
            '120s': 0.45,
            '150s': 0.35
          }
        },
        pricing: {
          basePricePerLb: 4.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Sumo Citrus',
          specifications: 'Premium large mandarin',
          confidence: 'none'
        }
      },
      'gold-nugget': {
        id: 'gold-nugget',
        name: 'Gold Nugget',
        itemWeight: {
          base: 0.45, // Base weight for 100s
          sizeVariations: {
            '80s': 0.60,
            '100s': 0.45,
            '120s': 0.38,
            '150s': 0.28
          }
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Gold Nugget',
          specifications: 'Seedless mandarin variety',
          confidence: 'low'
        }
      },
      'clementine': {
        id: 'clementine',
        name: 'Clementine',
        itemWeight: {
          base: 0.35, // Base weight for 100s
          sizeVariations: {
            '80s': 0.50,
            '100s': 0.35,
            '120s': 0.28,
            '150s': 0.20
          }
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Clementine',
          specifications: 'Small seedless mandarin',
          confidence: 'high'
        }
      },
      'lee-nova': {
        id: 'lee-nova',
        name: 'Lee Nova',
        itemWeight: {
          base: 0.40, // Base weight for 100s
          sizeVariations: {
            '80s': 0.55,
            '100s': 0.40,
            '120s': 0.32,
            '150s': 0.23
          }
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Lee Nova',
          specifications: 'Hybrid mandarin variety',
          confidence: 'low'
        }
      },
      'murcott-tango': {
        id: 'murcott-tango',
        name: 'Murcott/Tango',
        itemWeight: {
          base: 0.42, // Base weight for 100s
          sizeVariations: {
            '80s': 0.57,
            '100s': 0.42,
            '120s': 0.34,
            '150s': 0.25
          }
        },
        pricing: {
          basePricePerLb: 3.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Murcott',
          specifications: 'Late season mandarin',
          confidence: 'medium'
        }
      },
      'tangerine': {
        id: 'tangerine',
        name: 'Tangerine',
        itemWeight: {
          base: 0.38, // Base weight for 100s
          sizeVariations: {
            '80s': 0.53,
            '100s': 0.38,
            '120s': 0.30,
            '150s': 0.22
          }
        },
        pricing: {
          basePricePerLb: 2.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Tangerine',
          specifications: 'Traditional tangerine',
          confidence: 'high'
        }
      },
      'satsuma': {
        id: 'satsuma',
        name: 'Satsuma',
        itemWeight: {
          base: 0.45, // Base weight for 100s
          sizeVariations: {
            '80s': 0.60,
            '100s': 0.45,
            '120s': 0.37,
            '150s': 0.27
          }
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Satsuma',
          specifications: 'Cold-hardy mandarin',
          confidence: 'medium'
        }
      },
      'honey-murcott': {
        id: 'honey-murcott',
        name: 'Honey Murcott',
        itemWeight: {
          base: 0.43, // Base weight for 100s
          sizeVariations: {
            '80s': 0.58,
            '100s': 0.43,
            '120s': 0.35,
            '150s': 0.26
          }
        },
        pricing: {
          basePricePerLb: 3.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Honey Murcott',
          specifications: 'Sweet late season mandarin',
          confidence: 'low'
        }
      },
      'w-murcott': {
        id: 'w-murcott',
        name: 'W. Murcott',
        itemWeight: {
          base: 0.41, // Base weight for 100s
          sizeVariations: {
            '80s': 0.56,
            '100s': 0.41,
            '120s': 0.33,
            '150s': 0.24
          }
        },
        pricing: {
          basePricePerLb: 3.55,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'W. Murcott',
          specifications: 'Seedless mandarin hybrid',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'clementine'
  },

  {
    id: 'minneola',
    name: 'Minneola',
    category: 'Citrus Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Tangelos',
        specifications: 'CARTONS'
      },
      notes: 'USDA covers tangelos; limited variety-specific data'
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
            { id: '25lb', name: '25lb', weight: '25lb', isDefault: true },
            { id: '40lb', name: '40lb', weight: '40lb' }
          ],
          fruitCounts: [
            { id: '56s', name: '56s', description: 'Large', isDefault: false },
            { id: '72s', name: '72s', description: 'Medium-Large', isDefault: true },
            { id: '88s', name: '88s', description: 'Medium', isDefault: false }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    
    varieties: {
      'minneola-tangelo': {
        id: 'minneola-tangelo',
        name: 'Minneola Tangelo',
        itemWeight: {
          base: 0.65, // Base weight for 72s
          sizeVariations: {
            '56s': 0.85,
            '72s': 0.65,
            '88s': 0.50
          }
        },
        pricing: {
          basePricePerLb: 2.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Minneola Tangelo',
          specifications: 'Bell-shaped tangelo',
          confidence: 'high'
        }
      },
      'orlando-tangelo': {
        id: 'orlando-tangelo',
        name: 'Orlando Tangelo',
        itemWeight: {
          base: 0.60, // Base weight for 72s
          sizeVariations: {
            '56s': 0.80,
            '72s': 0.60,
            '88s': 0.45
          }
        },
        pricing: {
          basePricePerLb: 2.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Orlando Tangelo',
          specifications: 'Round tangelo variety',
          confidence: 'medium'
        }
      },
      'honeybell': {
        id: 'honeybell',
        name: 'Honeybell',
        itemWeight: {
          base: 0.70, // Base weight for 72s
          sizeVariations: {
            '56s': 0.90,
            '72s': 0.70,
            '88s': 0.55
          }
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Honeybell',
          specifications: 'Premium tangelo variety',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'minneola-tangelo'
  }
]
