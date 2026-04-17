// =============================================================================
// SPECIALTY FRUITS COMMODITIES
// =============================================================================
// Mediterranean, subtropical, and exotic fruits that don't fit Stone/Pome/Citrus/Tropical
// Commodities: Fig, Date, Pomegranate, Persimmon, Quince, Guava, Lychee, Dragon Fruit

import type { CommodityConfig } from '../types'

export const specialtyFruitsCommodities: CommodityConfig[] = [
  {
    id: 'fig',
    name: 'Fig',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty/direct market crop'
    },
    processing: {
      hasProcessing: false,
      types: [],
      defaultType: undefined
    },
    packaging: {
      types: [
        {
          id: 'flat',
          name: 'Flat',
          type: 'flat',
          sizes: [
            { id: '12x1pt', name: '12 x 1 Pint', count: '12x1pt', isDefault: true },
            { id: '8x1pt', name: '8 x 1 Pint', count: '8x1pt' }
          ],
          isDefault: true
        },
        {
          id: 'carton',
          name: 'Carton',
          type: 'carton',
          sizes: [
            { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' }
          ]
        }
      ],
      defaultPackage: 'flat',
      defaultSize: '12x1pt'
    },
    quality: {
      grades: ['Fancy', 'Choice', 'Standard'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'black-mission': {
        id: 'black-mission',
        name: 'Black Mission',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 4.50, priceVolatility: 'high' }
      },
      'brown-turkey': {
        id: 'brown-turkey',
        name: 'Brown Turkey',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 4.00, priceVolatility: 'high' }
      },
      'calimyrna': {
        id: 'calimyrna',
        name: 'Calimyrna',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 5.00, priceVolatility: 'high' }
      },
      'kadota': {
        id: 'kadota',
        name: 'Kadota',
        itemWeight: { base: 0.09, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'adriatic': {
        id: 'adriatic',
        name: 'Adriatic',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 4.75, priceVolatility: 'high' }
      },
      'desert-king': {
        id: 'desert-king',
        name: 'Desert King',
        itemWeight: { base: 0.11, sizeVariations: {} },
        pricing: { basePricePerLb: 4.50, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'black-mission'
  },

  {
    id: 'date',
    name: 'Date',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty crop, primarily Coachella Valley CA'
    },
    processing: {
      hasProcessing: false,
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
            { id: '11lb', name: '11 lb', weight: '11lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' },
            { id: '30lb', name: '30 lb', weight: '30lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '11lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'medjool': {
        id: 'medjool',
        name: 'Medjool',
        itemWeight: { base: 0.05, sizeVariations: {} },
        pricing: { basePricePerLb: 6.00, priceVolatility: 'medium' }
      },
      'deglet-noor': {
        id: 'deglet-noor',
        name: 'Deglet Noor',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 3.50, priceVolatility: 'medium' }
      },
      'barhi': {
        id: 'barhi',
        name: 'Barhi',
        itemWeight: { base: 0.03, sizeVariations: {} },
        pricing: { basePricePerLb: 5.50, priceVolatility: 'high' }
      },
      'zahidi': {
        id: 'zahidi',
        name: 'Zahidi',
        itemWeight: { base: 0.022, sizeVariations: {} },
        pricing: { basePricePerLb: 4.00, priceVolatility: 'medium' }
      },
      'halawy': {
        id: 'halawy',
        name: 'Halawy',
        itemWeight: { base: 0.028, sizeVariations: {} },
        pricing: { basePricePerLb: 5.00, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'medjool'
  },

  {
    id: 'pomegranate',
    name: 'Pomegranate',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty crop'
    },
    processing: {
      hasProcessing: false,
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
            { id: '23lb', name: '23 lb', weight: '23lb', isDefault: true },
            { id: '10lb', name: '10 lb', weight: '10lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '23lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'wonderful': {
        id: 'wonderful',
        name: 'Wonderful',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 2.50, priceVolatility: 'medium' }
      },
      'sharp-velvet': {
        id: 'sharp-velvet',
        name: 'Sharp Velvet',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 3.00, priceVolatility: 'high' }
      },
      'eversweet': {
        id: 'eversweet',
        name: 'Eversweet',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'granada': {
        id: 'granada',
        name: 'Granada',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      }
    },
    defaultVariety: 'wonderful'
  },

  {
    id: 'persimmon',
    name: 'Persimmon',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty crop'
    },
    processing: {
      hasProcessing: false,
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
            { id: '20lb', name: '20 lb', weight: '20lb', isDefault: true },
            { id: '10lb', name: '10 lb', weight: '10lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '20lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'hachiya': {
        id: 'hachiya',
        name: 'Hachiya',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      },
      'fuyu': {
        id: 'fuyu',
        name: 'Fuyu',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 2.50, priceVolatility: 'medium' }
      },
      'jiro': {
        id: 'jiro',
        name: 'Jiro',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      },
      'chocolate': {
        id: 'chocolate',
        name: 'Chocolate',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.50, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'hachiya'
  },

  {
    id: 'quince',
    name: 'Quince',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — niche specialty crop'
    },
    processing: {
      hasProcessing: false,
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
            { id: '20lb', name: '20 lb', weight: '20lb', isDefault: true }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '20lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'pineapple-quince': {
        id: 'pineapple-quince',
        name: 'Pineapple',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 3.00, priceVolatility: 'medium' }
      },
      'smyrna': {
        id: 'smyrna',
        name: 'Smyrna',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'van-deman': {
        id: 'van-deman',
        name: 'Van Deman',
        itemWeight: { base: 0.60, sizeVariations: {} },
        pricing: { basePricePerLb: 3.00, priceVolatility: 'medium' }
      }
    },
    defaultVariety: 'pineapple-quince'
  },

  {
    id: 'guava',
    name: 'Guava',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty tropical crop'
    },
    processing: {
      hasProcessing: false,
      types: [],
      defaultType: undefined
    },
    packaging: {
      types: [
        {
          id: 'flat',
          name: 'Flat',
          type: 'flat',
          sizes: [
            { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'flat',
      defaultSize: '10lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'white-guava': {
        id: 'white-guava',
        name: 'White Guava',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 3.50, priceVolatility: 'high' }
      },
      'pink-guava': {
        id: 'pink-guava',
        name: 'Pink Guava',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 4.00, priceVolatility: 'high' }
      },
      'strawberry-guava': {
        id: 'strawberry-guava',
        name: 'Strawberry Guava',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 5.00, priceVolatility: 'high' }
      },
      'pineapple-guava': {
        id: 'pineapple-guava',
        name: 'Pineapple Guava (Feijoa)',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 4.50, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'white-guava'
  },

  {
    id: 'lychee',
    name: 'Lychee',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty import crop'
    },
    processing: {
      hasProcessing: false,
      types: [],
      defaultType: undefined
    },
    packaging: {
      types: [
        {
          id: 'flat',
          name: 'Flat',
          type: 'flat',
          sizes: [
            { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'flat',
      defaultSize: '10lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'brewster': {
        id: 'brewster',
        name: 'Brewster',
        itemWeight: { base: 0.045, sizeVariations: {} },
        pricing: { basePricePerLb: 6.00, priceVolatility: 'high' }
      },
      'mauritius': {
        id: 'mauritius',
        name: 'Mauritius',
        itemWeight: { base: 0.040, sizeVariations: {} },
        pricing: { basePricePerLb: 7.00, priceVolatility: 'high' }
      },
      'hak-ip': {
        id: 'hak-ip',
        name: 'Hak Ip',
        itemWeight: { base: 0.050, sizeVariations: {} },
        pricing: { basePricePerLb: 8.00, priceVolatility: 'high' }
      },
      'sweetheart': {
        id: 'sweetheart',
        name: 'Sweetheart',
        itemWeight: { base: 0.045, sizeVariations: {} },
        pricing: { basePricePerLb: 7.50, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'brewster'
  },

  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit',
    category: 'Specialty Fruits',
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'No USDA market pricing — specialty import crop'
    },
    processing: {
      hasProcessing: false,
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
            { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' }
          ],
          isDefault: true
        }
      ],
      defaultPackage: 'carton',
      defaultSize: '10lb'
    },
    quality: {
      grades: ['Fancy', 'Choice'],
      defaultGrade: 'Fancy'
    },
    varieties: {
      'red-skin-white-flesh': {
        id: 'red-skin-white-flesh',
        name: 'Red Skin / White Flesh',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 4.00, priceVolatility: 'high' }
      },
      'red-skin-red-flesh': {
        id: 'red-skin-red-flesh',
        name: 'Red Skin / Red Flesh',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 5.50, priceVolatility: 'high' }
      },
      'yellow-skin-white-flesh': {
        id: 'yellow-skin-white-flesh',
        name: 'Yellow Skin / White Flesh',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 6.00, priceVolatility: 'high' }
      },
      'american-beauty': {
        id: 'american-beauty',
        name: 'American Beauty',
        itemWeight: { base: 0.80, sizeVariations: {} },
        pricing: { basePricePerLb: 5.00, priceVolatility: 'high' }
      }
    },
    defaultVariety: 'red-skin-white-flesh'
  }
]
