// =============================================================================
// POME FRUITS COMMODITIES
// =============================================================================
// Complete category: Apple, Pear

import type { CommodityConfig } from '../types'

export const pomeFruitsCommodities: CommodityConfig[] = [
  {
    id: 'apple',
    name: 'Apple',
    category: 'Pome Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Apples',
        specifications: 'Fresh apples, domestic and imported'
      },
      notes: 'USDA covers major apple varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh apples',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '40lb', name: '40 lb', weight: '40lb', isDefault: true },
                { id: '42lb', name: '42 lb', weight: '42lb' },
                { id: '38lb', name: '38 lb', weight: '38lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' },
                { id: '10lb', name: '10 lb', weight: '10lb' }
              ]
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '4ct', name: '4 Count', count: '4ct' },
                { id: '6ct', name: '6 Count', count: '6ct' },
                { id: '8ct', name: '8 Count', count: '8ct' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced apples',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ]
            }
          ]
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced apples',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      // Red Varieties
      'red-delicious': {
        id: 'red-delicious',
        name: 'Red Delicious',
        subtype: 'red',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'gala': {
        id: 'gala',
        name: 'Gala',
        subtype: 'red',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'fuji': {
        id: 'fuji',
        name: 'Fuji',
        subtype: 'red',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'honeycrisp': {
        id: 'honeycrisp',
        name: 'Honeycrisp',
        subtype: 'red',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'high' }
      },
      'braeburn': {
        id: 'braeburn',
        name: 'Braeburn',
        subtype: 'red',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'jonagold': {
        id: 'jonagold',
        name: 'Jonagold',
        subtype: 'red',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'rome': {
        id: 'rome',
        name: 'Rome',
        subtype: 'red',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      
      // Green Varieties
      'granny-smith': {
        id: 'granny-smith',
        name: 'Granny Smith',
        subtype: 'green',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'golden-delicious': {
        id: 'golden-delicious',
        name: 'Golden Delicious',
        subtype: 'green',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'crispin': {
        id: 'crispin',
        name: 'Crispin (Mutsu)',
        subtype: 'green',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'newtown-pippin': {
        id: 'newtown-pippin',
        name: 'Newtown Pippin',
        subtype: 'green',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      
      // Specialty/Heirloom Varieties
      'pink-lady': {
        id: 'pink-lady',
        name: 'Pink Lady',
        subtype: 'specialty',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'high' }
      },
      'jazz': {
        id: 'jazz',
        name: 'Jazz',
        subtype: 'specialty',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'high' }
      },
      'envy': {
        id: 'envy',
        name: 'Envy',
        subtype: 'specialty',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'cosmic-crisp': {
        id: 'cosmic-crisp',
        name: 'Cosmic Crisp',
        subtype: 'specialty',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'arkansas-black': {
        id: 'arkansas-black',
        name: 'Arkansas Black',
        subtype: 'heirloom',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'high' }
      },
      'northern-spy': {
        id: 'northern-spy',
        name: 'Northern Spy',
        subtype: 'heirloom',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '40lb',
      defaultSize: '40lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1', 'Utility'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'gala'
  },

  {
    id: 'pear',
    name: 'Pear',
    category: 'Pome Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Pears',
        specifications: 'Fresh pears, domestic and imported'
      },
      notes: 'USDA covers major pear varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh pears',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '44lb', name: '44 lb', weight: '44lb', isDefault: true },
                { id: '40lb', name: '40 lb', weight: '40lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ]
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '4ct', name: '4 Count', count: '4ct' },
                { id: '6ct', name: '6 Count', count: '6ct' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced pears',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'halved',
          name: 'Halved',
          description: 'Pre-halved pears (cored)',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      // European Varieties
      'bartlett': {
        id: 'bartlett',
        name: 'Bartlett',
        subtype: 'european',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'red-bartlett': {
        id: 'red-bartlett',
        name: 'Red Bartlett',
        subtype: 'european',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'bosc': {
        id: 'bosc',
        name: 'Bosc',
        subtype: 'european',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'comice': {
        id: 'comice',
        name: 'Comice',
        subtype: 'european',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'seckel': {
        id: 'seckel',
        name: 'Seckel',
        subtype: 'european',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'forelle': {
        id: 'forelle',
        name: 'Forelle',
        subtype: 'european',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      },
      
      // Asian Varieties
      'asian-pear-nijisseiki': {
        id: 'asian-pear-nijisseiki',
        name: 'Nijisseiki (20th Century)',
        subtype: 'asian',
        itemWeight: { base: 0.6, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'asian-pear-hosui': {
        id: 'asian-pear-hosui',
        name: 'Hosui',
        subtype: 'asian',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'high' }
      },
      'asian-pear-shinseiki': {
        id: 'asian-pear-shinseiki',
        name: 'Shinseiki',
        subtype: 'asian',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'high' }
      },
      'asian-pear-kosui': {
        id: 'asian-pear-kosui',
        name: 'Kosui',
        subtype: 'asian',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 5.45, priceVolatility: 'high' }
      },
      
      // Specialty Varieties
      'concorde': {
        id: 'concorde',
        name: 'Concorde',
        subtype: 'specialty',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'starkrimson': {
        id: 'starkrimson',
        name: 'Starkrimson',
        subtype: 'specialty',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '44lb',
      defaultSize: '44lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'bartlett'
  }
]
