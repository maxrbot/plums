// =============================================================================
// BRASSICAS & COLE CROPS COMMODITIES
// =============================================================================
// Complete category: Broccoli, Cauliflower, Cabbage, Brussels Sprouts

import type { CommodityConfig } from '../types'

export const brassicasCommodities: CommodityConfig[] = [
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'Brassicas & Cole Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Broccoli',
        specifications: 'Fresh market broccoli crowns'
      },
      notes: 'USDA covers standard broccoli; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'crown-cut',
          name: 'Crown Cut',
          description: 'Broccoli crowns with stems trimmed',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '14ct', name: '14 Count', count: '14ct', isDefault: true },
                { id: '18ct', name: '18 Count', count: '18ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'florets',
          name: 'Florets',
          description: 'Cut broccoli florets',
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
      defaultType: 'crown-cut'
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: 'carton',
      defaultSize: '14 Count'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'calabrese': {
        id: 'calabrese',
        name: 'Calabrese',
        itemWeight: {
          base: 1.2, // 1.2 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Calabrese',
          specifications: 'Traditional Italian broccoli',
          confidence: 'high'
        }
      },
      'de-cicco': {
        id: 'de-cicco',
        name: 'De Cicco',
        itemWeight: {
          base: 0.8, // 0.8 lbs per crown (smaller variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'De Cicco',
          specifications: 'Heirloom variety, smaller heads',
          confidence: 'medium'
        }
      },
      'waltham-29': {
        id: 'waltham-29',
        name: 'Waltham 29',
        itemWeight: {
          base: 1.4, // 1.4 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Waltham 29',
          specifications: 'Cold-hardy variety',
          confidence: 'medium'
        }
      },
      'premium-crop': {
        id: 'premium-crop',
        name: 'Premium Crop',
        itemWeight: {
          base: 1.6, // 1.6 lbs per crown (large variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.75,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Premium Crop',
          specifications: 'Large commercial variety',
          confidence: 'high'
        }
      },
      'packman': {
        id: 'packman',
        name: 'Packman',
        itemWeight: {
          base: 1.3, // 1.3 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Packman',
          specifications: 'Hybrid variety, uniform heads',
          confidence: 'medium'
        }
      },
      'green-goliath': {
        id: 'green-goliath',
        name: 'Green Goliath',
        itemWeight: {
          base: 1.8, // 1.8 lbs per crown (very large)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.65,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Goliath',
          specifications: 'Extra large variety',
          confidence: 'medium'
        }
      },
      'arcadia': {
        id: 'arcadia',
        name: 'Arcadia',
        itemWeight: {
          base: 1.4, // 1.4 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Arcadia',
          specifications: 'Heat-tolerant hybrid',
          confidence: 'low'
        }
      },
      'belstar': {
        id: 'belstar',
        name: 'Belstar',
        itemWeight: {
          base: 1.5, // 1.5 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Belstar',
          specifications: 'Disease-resistant variety',
          confidence: 'low'
        }
      },
      'marathon': {
        id: 'marathon',
        name: 'Marathon',
        itemWeight: {
          base: 1.3, // 1.3 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.05,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Marathon',
          specifications: 'Long-harvest variety',
          confidence: 'low'
        }
      },
      'aspabroc': {
        id: 'aspabroc',
        name: 'Aspabroc',
        itemWeight: {
          base: 0.6, // 0.6 lbs per crown (broccolini type)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 4.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Broccolini',
          specifications: 'Baby broccoli specialty',
          confidence: 'none'
        }
      },
      'happy-rich': {
        id: 'happy-rich',
        name: 'Happy Rich',
        itemWeight: {
          base: 1.2, // 1.2 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Happy Rich',
          specifications: 'Asian variety, tender stems',
          confidence: 'none'
        }
      },
      'atlantis': {
        id: 'atlantis',
        name: 'Atlantis',
        itemWeight: {
          base: 1.4, // 1.4 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Atlantis',
          specifications: 'Uniform hybrid variety',
          confidence: 'low'
        }
      },
      'apollo': {
        id: 'apollo',
        name: 'Apollo',
        itemWeight: {
          base: 1.3, // 1.3 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.05,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Apollo',
          specifications: 'High-yield variety',
          confidence: 'low'
        }
      },
      'inspiration': {
        id: 'inspiration',
        name: 'Inspiration',
        itemWeight: {
          base: 1.5, // 1.5 lbs per crown
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Inspiration',
          specifications: 'Premium hybrid variety',
          confidence: 'low'
        }
      }
    },
    
    defaultVariety: 'calabrese'
  },

  {
    id: 'cauliflower',
    name: 'Cauliflower',
    category: 'Brassicas & Cole Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Cauliflower',
        specifications: 'Fresh market cauliflower heads'
      },
      notes: 'USDA covers white cauliflower primarily; colored varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-head',
          name: 'Whole Head',
          description: 'Whole cauliflower heads with leaves',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '16ct', name: '16 Count', count: '16ct' },
                { id: '18ct', name: '18 Count', count: '18ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'trimmed-head',
          name: 'Trimmed Head',
          description: 'Cauliflower heads with leaves removed',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '16ct', name: '16 Count', count: '16ct' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'florets',
          name: 'Florets',
          description: 'Cut cauliflower florets',
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
      defaultType: 'whole-head'
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: 'carton',
      defaultSize: '12 Count'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'snowball-y-improved': {
        id: 'snowball-y-improved',
        name: 'Snowball Y Improved',
        itemWeight: {
          base: 1.8, // 1.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Snowball Y Improved',
          specifications: 'Standard white cauliflower',
          confidence: 'high'
        }
      },
      'early-snowball': {
        id: 'early-snowball',
        name: 'Early Snowball',
        itemWeight: {
          base: 1.5, // 1.5 lbs per head (smaller, earlier variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Early Snowball',
          specifications: 'Early season white cauliflower',
          confidence: 'high'
        }
      },
      'purple-of-sicily': {
        id: 'purple-of-sicily',
        name: 'Purple of Sicily',
        itemWeight: {
          base: 1.6, // 1.6 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Purple Cauliflower',
          specifications: 'Purple-headed specialty variety',
          confidence: 'low'
        }
      },
      'cheddar': {
        id: 'cheddar',
        name: 'Cheddar',
        itemWeight: {
          base: 1.7, // 1.7 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Orange Cauliflower',
          specifications: 'Orange-headed specialty variety',
          confidence: 'low'
        }
      },
      'romanesco': {
        id: 'romanesco',
        name: 'Romanesco',
        itemWeight: {
          base: 1.4, // 1.4 lbs per head (unique spiral structure)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.85,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Romanesco',
          specifications: 'Spiral-headed specialty variety',
          confidence: 'none'
        }
      },
      'graffiti': {
        id: 'graffiti',
        name: 'Graffiti',
        itemWeight: {
          base: 1.6, // 1.6 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.45,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Purple Cauliflower',
          specifications: 'Deep purple specialty variety',
          confidence: 'none'
        }
      },
      'orange-bouquet': {
        id: 'orange-bouquet',
        name: 'Orange Bouquet',
        itemWeight: {
          base: 1.5, // 1.5 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.35,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Orange Cauliflower',
          specifications: 'Bright orange specialty variety',
          confidence: 'none'
        }
      },
      'veronica': {
        id: 'veronica',
        name: 'Veronica',
        itemWeight: {
          base: 1.9, // 1.9 lbs per head (larger variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Veronica Cauliflower',
          specifications: 'Large white hybrid variety',
          confidence: 'medium'
        }
      }
    },
    
    defaultVariety: 'snowball-y-improved'
  },

  {
    id: 'cabbage',
    name: 'Cabbage',
    category: 'Brassicas & Cole Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Cabbage',
        specifications: 'Fresh market cabbage heads, green and red'
      },
      notes: 'USDA covers green and red cabbage; savoy varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-head',
          name: 'Whole Head',
          description: 'Whole cabbage heads',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '40lb', name: '40lb', weight: '40lb', isDefault: true },
                { id: '50lb', name: '50lb', weight: '50lb' }
              ],
              isDefault: true
            },
            {
              id: 'sack',
              name: 'Sack',
              type: 'sack',
              sizes: [
                { id: '50lb', name: '50lb', weight: '50lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'shredded',
          name: 'Shredded',
          description: 'Pre-shredded cabbage',
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
      defaultSize: '40lb'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      // Green Cabbage varieties
      'copenhagen-market': {
        id: 'copenhagen-market',
        name: 'Copenhagen Market',
        itemWeight: {
          base: 3.2, // 3.2 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 0.85,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Round green cabbage heads',
          confidence: 'high'
        }
      },
      'golden-acre': {
        id: 'golden-acre',
        name: 'Golden Acre',
        itemWeight: {
          base: 2.8, // 2.8 lbs per head (smaller, earlier)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 0.95,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Early season green cabbage',
          confidence: 'high'
        }
      },
      'danish-ballhead': {
        id: 'danish-ballhead',
        name: 'Danish Ballhead',
        itemWeight: {
          base: 4.5, // 4.5 lbs per head (large storage variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 0.75,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Large storage green cabbage',
          confidence: 'high'
        }
      },
      'stonehead': {
        id: 'stonehead',
        name: 'Stonehead',
        itemWeight: {
          base: 3.8, // 3.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 0.85,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Dense green cabbage heads',
          confidence: 'medium'
        }
      },
      'early-jersey-wakefield': {
        id: 'early-jersey-wakefield',
        name: 'Early Jersey Wakefield',
        itemWeight: {
          base: 2.2, // 2.2 lbs per head (small, pointed)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.05,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Pointed green cabbage heads',
          confidence: 'medium'
        }
      },
      'late-flat-dutch': {
        id: 'late-flat-dutch',
        name: 'Late Flat Dutch',
        itemWeight: {
          base: 5.2, // 5.2 lbs per head (very large)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 0.65,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Green Cabbage',
          specifications: 'Large flat green cabbage',
          confidence: 'medium'
        }
      },
      // Red Cabbage varieties
      'red-acre': {
        id: 'red-acre',
        name: 'Red Acre',
        itemWeight: {
          base: 3.0, // 3.0 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Red/purple cabbage heads',
          confidence: 'high'
        }
      },
      'mammoth-red-rock': {
        id: 'mammoth-red-rock',
        name: 'Mammoth Red Rock',
        itemWeight: {
          base: 4.2, // 4.2 lbs per head (large red variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Large red cabbage heads',
          confidence: 'medium'
        }
      },
      'red-express': {
        id: 'red-express',
        name: 'Red Express',
        itemWeight: {
          base: 2.5, // 2.5 lbs per head (smaller red variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Early red cabbage variety',
          confidence: 'medium'
        }
      },
      'ruby-ball': {
        id: 'ruby-ball',
        name: 'Ruby Ball',
        itemWeight: {
          base: 3.5, // 3.5 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Round red cabbage variety',
          confidence: 'low'
        }
      },
      'red-rookie': {
        id: 'red-rookie',
        name: 'Red Rookie',
        itemWeight: {
          base: 2.8, // 2.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Compact red cabbage variety',
          confidence: 'low'
        }
      },
      'integro': {
        id: 'integro',
        name: 'Integro',
        itemWeight: {
          base: 3.8, // 3.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Red Cabbage',
          specifications: 'Storage red cabbage variety',
          confidence: 'low'
        }
      },
      // Savoy Cabbage varieties
      'savoy-ace': {
        id: 'savoy-ace',
        name: 'Savoy Ace',
        itemWeight: {
          base: 3.5, // 3.5 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Savoy Cabbage',
          specifications: 'Crinkled leaf savoy cabbage',
          confidence: 'low'
        }
      },
      'perfection-drumhead-savoy': {
        id: 'perfection-drumhead-savoy',
        name: 'Perfection Drumhead Savoy',
        itemWeight: {
          base: 4.2, // 4.2 lbs per head (large savoy)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Savoy Cabbage',
          specifications: 'Large drumhead savoy variety',
          confidence: 'low'
        }
      },
      'chieftain-savoy': {
        id: 'chieftain-savoy',
        name: 'Chieftain Savoy',
        itemWeight: {
          base: 3.8, // 3.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.55,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Savoy Cabbage',
          specifications: 'Premium savoy variety',
          confidence: 'none'
        }
      },
      'melissa': {
        id: 'melissa',
        name: 'Melissa',
        itemWeight: {
          base: 3.2, // 3.2 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.65,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Savoy Cabbage',
          specifications: 'Hybrid savoy variety',
          confidence: 'none'
        }
      },
      'tundra': {
        id: 'tundra',
        name: 'Tundra',
        itemWeight: {
          base: 4.0, // 4.0 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.45,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Savoy Cabbage',
          specifications: 'Cold-hardy savoy variety',
          confidence: 'none'
        }
      },
      // Napa Cabbage varieties
      'michihili': {
        id: 'michihili',
        name: 'Michihili',
        itemWeight: {
          base: 2.5, // 2.5 lbs per head (elongated shape)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Chinese cabbage, elongated heads',
          confidence: 'medium'
        }
      },
      'wong-bok': {
        id: 'wong-bok',
        name: 'Wong Bok',
        itemWeight: {
          base: 3.0, // 3.0 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Traditional Chinese cabbage',
          confidence: 'medium'
        }
      },
      'china-express': {
        id: 'china-express',
        name: 'China Express',
        itemWeight: {
          base: 2.8, // 2.8 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Fast-growing Chinese cabbage',
          confidence: 'low'
        }
      },
      'minuet': {
        id: 'minuet',
        name: 'Minuet',
        itemWeight: {
          base: 2.2, // 2.2 lbs per head (smaller variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Compact Chinese cabbage',
          confidence: 'low'
        }
      },
      'bilko': {
        id: 'bilko',
        name: 'Bilko',
        itemWeight: {
          base: 3.2, // 3.2 lbs per head
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Disease-resistant Chinese cabbage',
          confidence: 'none'
        }
      },
      'monument': {
        id: 'monument',
        name: 'Monument',
        itemWeight: {
          base: 3.5, // 3.5 lbs per head (larger variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 1.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Napa Cabbage',
          specifications: 'Large Chinese cabbage variety',
          confidence: 'none'
        }
      }
    },
    
    defaultVariety: 'copenhagen-market'
  },

  {
    id: 'brussels-sprouts',
    name: 'Brussels Sprouts',
    category: 'Brassicas & Cole Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Brussels Sprouts',
        specifications: 'Fresh market Brussels sprouts'
      },
      notes: 'USDA covers standard Brussels sprouts; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'on-stalk',
          name: 'On Stalk',
          description: 'Brussels sprouts still attached to stalk',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '10lb', name: '10lb', weight: '10lb', isDefault: true },
                { id: '15lb', name: '15lb', weight: '15lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'loose-sprouts',
          name: 'Loose Sprouts',
          description: 'Individual Brussels sprouts removed from stalk',
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
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25lb', weight: '25lb' }
              ]
            }
          ]
        }
      ],
      defaultType: 'on-stalk'
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: 'carton',
      defaultSize: '10lb'
    },
    
    quality: {
      grades: ['Premium', 'Choice', 'Standard'],
      defaultGrade: 'Premium'
    },
    
    varieties: {
      'long-island-improved': {
        id: 'long-island-improved',
        name: 'Long Island Improved',
        itemWeight: {
          base: 0.035, // 0.035 lbs per sprout (individual sprout weight)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Long Island Improved',
          specifications: 'Standard Brussels sprouts variety',
          confidence: 'high'
        }
      },
      'jade-cross': {
        id: 'jade-cross',
        name: 'Jade Cross',
        itemWeight: {
          base: 0.032, // 0.032 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Jade Cross',
          specifications: 'Hybrid Brussels sprouts variety',
          confidence: 'high'
        }
      },
      'prince-marvel': {
        id: 'prince-marvel',
        name: 'Prince Marvel',
        itemWeight: {
          base: 0.038, // 0.038 lbs per sprout (larger variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Prince Marvel',
          specifications: 'Large Brussels sprouts variety',
          confidence: 'medium'
        }
      },
      'diablo': {
        id: 'diablo',
        name: 'Diablo',
        itemWeight: {
          base: 0.034, // 0.034 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.35,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Diablo',
          specifications: 'Heat-tolerant Brussels sprouts',
          confidence: 'low'
        }
      },
      'franklin': {
        id: 'franklin',
        name: 'Franklin',
        itemWeight: {
          base: 0.036, // 0.036 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Franklin',
          specifications: 'Cold-hardy Brussels sprouts',
          confidence: 'low'
        }
      },
      'gustus': {
        id: 'gustus',
        name: 'Gustus',
        itemWeight: {
          base: 0.033, // 0.033 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.55,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Gustus',
          specifications: 'Specialty Brussels sprouts variety',
          confidence: 'none'
        }
      },
      'churchill': {
        id: 'churchill',
        name: 'Churchill',
        itemWeight: {
          base: 0.037, // 0.037 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.45,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Churchill',
          specifications: 'Uniform Brussels sprouts variety',
          confidence: 'low'
        }
      },
      'red-bull': {
        id: 'red-bull',
        name: 'Red Bull',
        itemWeight: {
          base: 0.035, // 0.035 lbs per sprout
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 4.25,
          priceVolatility: 'high'
        },
        usdaMapping: {
          variety: 'Red Brussels Sprouts',
          specifications: 'Purple-red Brussels sprouts',
          confidence: 'none'
        }
      }
    },
    
    defaultVariety: 'long-island-improved'
  },

  {
    id: 'kohlrabi',
    name: 'Kohlrabi',
    category: 'Brassicas & Cole Crops',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Kohlrabi',
        specifications: 'Fresh market kohlrabi bulbs'
      },
      notes: 'USDA has limited kohlrabi pricing data; estimates based on regional markets'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-bulb',
          name: 'Whole Bulb',
          description: 'Whole kohlrabi bulbs with leaves',
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
            }
          ],
          isDefault: true
        },
        {
          id: 'trimmed-bulb',
          name: 'Trimmed Bulb',
          description: 'Kohlrabi bulbs with leaves removed',
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
        }
      ],
      defaultType: 'whole-bulb'
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
      'early-white-vienna': {
        id: 'early-white-vienna',
        name: 'Early White Vienna',
        itemWeight: {
          base: 0.8, // 0.8 lbs per bulb
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'White Kohlrabi',
          specifications: 'Early white variety',
          confidence: 'low'
        }
      },
      'early-purple-vienna': {
        id: 'early-purple-vienna',
        name: 'Early Purple Vienna',
        itemWeight: {
          base: 0.75, // 0.75 lbs per bulb
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.15,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Purple Kohlrabi',
          specifications: 'Early purple variety',
          confidence: 'low'
        }
      },
      'grand-duke': {
        id: 'grand-duke',
        name: 'Grand Duke',
        itemWeight: {
          base: 1.0, // 1.0 lbs per bulb (larger variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.65,
          priceVolatility: 'low'
        },
        usdaMapping: {
          variety: 'Grand Duke Kohlrabi',
          specifications: 'Large white hybrid',
          confidence: 'none'
        }
      },
      'kongo': {
        id: 'kongo',
        name: 'Kongo',
        itemWeight: {
          base: 0.9, // 0.9 lbs per bulb
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.95,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Kongo Kohlrabi',
          specifications: 'Purple specialty variety',
          confidence: 'none'
        }
      },
      'kolibri': {
        id: 'kolibri',
        name: 'Kolibri',
        itemWeight: {
          base: 0.7, // 0.7 lbs per bulb (smaller variety)
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 3.25,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Kolibri Kohlrabi',
          specifications: 'Small purple variety',
          confidence: 'none'
        }
      },
      'quickstar': {
        id: 'quickstar',
        name: 'Quickstar',
        itemWeight: {
          base: 0.85, // 0.85 lbs per bulb
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.75,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Quickstar Kohlrabi',
          specifications: 'Fast-growing white variety',
          confidence: 'none'
        }
      },
      'winner': {
        id: 'winner',
        name: 'Winner',
        itemWeight: {
          base: 0.95, // 0.95 lbs per bulb
          sizeVariations: {}
        },
        pricing: {
          basePricePerLb: 2.85,
          priceVolatility: 'medium'
        },
        usdaMapping: {
          variety: 'Winner Kohlrabi',
          specifications: 'Uniform white variety',
          confidence: 'none'
        }
      }
    },
    
    defaultVariety: 'early-white-vienna'
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBrassicasCommodity(commodityId: string): CommodityConfig | undefined {
  return brassicasCommodities.find(c => c.id === commodityId)
}

export function getBrassicasVariety(commodityId: string, varietyId: string) {
  const commodity = getBrassicasCommodity(commodityId)
  return commodity?.varieties[varietyId]
}
