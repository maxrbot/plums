// Unified Packaging Specifications System
// Combines industry standards with user customization capabilities

export interface PackagingSpec {
  id: string                    // Unique identifier
  type: 'carton' | 'bag' | 'bulk' | 'clamshell' | 'tray'
  name: string                  // Display name (e.g., "40 lb Carton", "Clamshell")
  counts?: string[]             // For cartons: '88s', '113s', etc.
  sizes?: string[]              // For bags/containers: '3 lb', '5 lb', etc.
  weight?: string               // Standard weight: '40 lbs'
  grades: string[]              // Quality grades
  isStandard: boolean           // true = industry standard, false = user custom
  commodities: string[]         // Which commodities this applies to
  category: 'container' | 'carton' | 'bag' | 'bulk' | 'specialty'
  description?: string          // Optional description
  usdaMapping?: {               // How to map to USDA commodity names
    commodity: string
    specifications?: string     // Additional specs for USDA lookup
  }
  createdBy?: string           // User ID for custom packaging (null for standards)
}

// Primary package defaults for each commodity (industry standards)
export const commodityPrimaryPackages: Record<string, {
  packageName: string
  type: 'weight' | 'count'
  standardUnit?: number  // 40 for "40 lb", 24 for "24 ct"
  unitType?: 'lb' | 'ct' | 'kg'
}> = {
  // Citrus Fruits
  orange: { packageName: '40 lb Carton', type: 'weight', standardUnit: 40, unitType: 'lb' },
  mandarin: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  minneola: { packageName: '40 lb Carton', type: 'weight', standardUnit: 40, unitType: 'lb' },
  lemon: { packageName: '40 lb Carton', type: 'weight', standardUnit: 40, unitType: 'lb' },
  lime: { packageName: '40 lb Carton', type: 'weight', standardUnit: 40, unitType: 'lb' },
  grapefruit: { packageName: '40 lb Carton', type: 'weight', standardUnit: 40, unitType: 'lb' },
  
  // Root Vegetables
  carrot: { packageName: '50 lb Bag', type: 'weight', standardUnit: 50, unitType: 'lb' },
  potato: { packageName: '50 lb Bag', type: 'weight', standardUnit: 50, unitType: 'lb' },
  'sweet-potato': { packageName: '40 lb Box', type: 'weight', standardUnit: 40, unitType: 'lb' },
  onion: { packageName: '50 lb Bag', type: 'weight', standardUnit: 50, unitType: 'lb' },
  garlic: { packageName: '30 lb Box', type: 'weight', standardUnit: 30, unitType: 'lb' },
  beet: { packageName: '25 lb Bag', type: 'weight', standardUnit: 25, unitType: 'lb' },
  turnip: { packageName: '25 lb Bag', type: 'weight', standardUnit: 25, unitType: 'lb' },
  
  // Leafy Greens
  lettuce: { packageName: '24 ct Carton', type: 'count', standardUnit: 24, unitType: 'ct' },
  spinach: { packageName: '24 ct Carton', type: 'count', standardUnit: 24, unitType: 'ct' },
  kale: { packageName: '12 bunch Carton', type: 'count', standardUnit: 12, unitType: 'ct' },
  chard: { packageName: '12 bunch Carton', type: 'count', standardUnit: 12, unitType: 'ct' },
  arugula: { packageName: '4 lb Case', type: 'weight', standardUnit: 4, unitType: 'lb' },
  
  // Vine Crops
  tomato: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  'bell-pepper': { packageName: '30 lb Box', type: 'weight', standardUnit: 30, unitType: 'lb' },
  'hot-pepper': { packageName: '10 lb Box', type: 'weight', standardUnit: 10, unitType: 'lb' },
  cucumber: { packageName: '55 lb Box', type: 'weight', standardUnit: 55, unitType: 'lb' },
  'summer-squash': { packageName: '42 lb Box', type: 'weight', standardUnit: 42, unitType: 'lb' },
  'winter-squash': { packageName: '50 lb Box', type: 'weight', standardUnit: 50, unitType: 'lb' },
  melon: { packageName: '42 lb Box', type: 'weight', standardUnit: 42, unitType: 'lb' },
  
  // Berries
  strawberry: { packageName: '8x1lb Flat', type: 'weight', standardUnit: 8, unitType: 'lb' },
  blueberry: { packageName: '12x1lb Flat', type: 'weight', standardUnit: 12, unitType: 'lb' },
  raspberry: { packageName: '12x6oz Flat', type: 'weight', standardUnit: 4.5, unitType: 'lb' },
  blackberry: { packageName: '12x6oz Flat', type: 'weight', standardUnit: 4.5, unitType: 'lb' },
  
  // Stone Fruits
  peach: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  plum: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  cherry: { packageName: '20 lb Box', type: 'weight', standardUnit: 20, unitType: 'lb' },
  apricot: { packageName: '24 lb Box', type: 'weight', standardUnit: 24, unitType: 'lb' },
  
  // Pome Fruits
  apple: { packageName: '42 lb Box', type: 'weight', standardUnit: 42, unitType: 'lb' },
  pear: { packageName: '44 lb Box', type: 'weight', standardUnit: 44, unitType: 'lb' },
  
  // Herbs & Aromatics
  basil: { packageName: '12 bunch Case', type: 'count', standardUnit: 12, unitType: 'ct' },
  mint: { packageName: '12 bunch Case', type: 'count', standardUnit: 12, unitType: 'ct' },
  rosemary: { packageName: '12 bunch Case', type: 'count', standardUnit: 12, unitType: 'ct' },
  thyme: { packageName: '12 bunch Case', type: 'count', standardUnit: 12, unitType: 'ct' },
  cilantro: { packageName: '24 bunch Case', type: 'count', standardUnit: 24, unitType: 'ct' },
  parsley: { packageName: '24 bunch Case', type: 'count', standardUnit: 24, unitType: 'ct' },
  
  // Tropical Fruits
  kiwi: { packageName: '7 lb Flat', type: 'weight', standardUnit: 7, unitType: 'lb' },
  'kiwi-berry': { packageName: '1 lb Clamshell', type: 'weight', standardUnit: 1, unitType: 'lb' },
  avocado: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  mango: { packageName: '10 lb Box', type: 'weight', standardUnit: 10, unitType: 'lb' },
  pineapple: { packageName: '8 ct Box', type: 'count', standardUnit: 8, unitType: 'ct' },
  papaya: { packageName: '10 lb Box', type: 'weight', standardUnit: 10, unitType: 'lb' },
  banana: { packageName: '40 lb Box', type: 'weight', standardUnit: 40, unitType: 'lb' },
  coconut: { packageName: '50 ct Box', type: 'count', standardUnit: 50, unitType: 'ct' },
  'passion-fruit': { packageName: '5 lb Box', type: 'weight', standardUnit: 5, unitType: 'lb' },
  'dragon-fruit': { packageName: '10 lb Box', type: 'weight', standardUnit: 10, unitType: 'lb' },
  dates: { packageName: '22 lb Box', type: 'weight', standardUnit: 22, unitType: 'lb' },
  
  // Nuts
  almond: { packageName: '30 lb Box', type: 'weight', standardUnit: 30, unitType: 'lb' },
  walnut: { packageName: '30 lb Box', type: 'weight', standardUnit: 30, unitType: 'lb' },
  pecan: { packageName: '30 lb Box', type: 'weight', standardUnit: 30, unitType: 'lb' },
  pistachio: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  hazelnut: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  macadamia: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
  chestnut: { packageName: '25 lb Box', type: 'weight', standardUnit: 25, unitType: 'lb' },
}

// Comprehensive industry-standard packaging specifications
export const standardPackagingSpecs: PackagingSpec[] = [
  // CITRUS FRUITS
  {
    id: 'orange-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    counts: ['48s', '56s', '72s', '88s', '113s', '138s'],
    weight: '40 lbs',
    grades: ['Fancy', 'Choice', 'Standard'],
    isStandard: true,
    commodities: ['orange'],
    category: 'carton',
    description: 'Standard citrus carton (40 pounds)',
    usdaMapping: {
      commodity: 'oranges',
      specifications: 'navel'
    }
  },
  {
    id: 'orange-bag-retail',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['3 lb', '5 lb', '8 lb', '10 lb'],
    grades: ['Fancy', 'Choice'],
    isStandard: true,
    commodities: ['orange'],
    category: 'bag',
    description: 'Retail mesh or plastic bag for oranges',
    usdaMapping: {
      commodity: 'oranges',
      specifications: 'bagged'
    }
  },
  {
    id: 'lemon-carton-38lb',
    type: 'carton',
    name: '38 lb Carton',
    counts: ['75s', '95s', '115s', '140s', '165s', '200s'],
    weight: '38 lbs',
    grades: ['Fancy', 'Choice', 'Standard'],
    isStandard: true,
    commodities: ['lemon'],
    category: 'carton',
    description: 'Standard lemon carton (38 pounds)',
    usdaMapping: {
      commodity: 'lemons'
    }
  },
  {
    id: 'grapefruit-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    counts: ['23s', '27s', '32s', '36s', '40s', '48s'],
    weight: '40 lbs',
    grades: ['Fancy', 'Choice'],
    isStandard: true,
    commodities: ['grapefruit'],
    category: 'carton',
    description: 'Standard grapefruit carton (40 pounds)',
    usdaMapping: {
      commodity: 'grapefruit'
    }
  },
  {
    id: 'lime-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    counts: ['110s', '150s', '175s', '200s', '230s', '250s'],
    weight: '40 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['lime'],
    category: 'carton',
    description: 'Standard lime carton (40 pounds)',
    usdaMapping: {
      commodity: 'limes'
    }
  },

  // BERRIES
  {
    id: 'strawberry-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['1 lb', '2 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['strawberry'],
    category: 'container',
    description: 'Clear plastic clamshell container for berries',
    usdaMapping: {
      commodity: 'strawberries'
    }
  },
  {
    id: 'strawberry-tray',
    type: 'tray',
    name: 'Tray Pack',
    sizes: ['8 x 1 lb', '12 x 1 lb'],
    grades: ['US No. 1'],
    isStandard: true,
    commodities: ['strawberry'],
    category: 'specialty',
    description: 'Flat containing multiple berry containers',
    usdaMapping: {
      commodity: 'strawberries',
      specifications: 'tray pack'
    }
  },
  {
    id: 'blueberry-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['6 oz', '1 lb', '18 oz'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['blueberry'],
    category: 'container',
    description: 'Plastic clamshell container for blueberries',
    usdaMapping: {
      commodity: 'blueberries'
    }
  },
  {
    id: 'blueberry-tray',
    type: 'tray',
    name: 'Tray Pack',
    sizes: ['12 x 6 oz', '12 x 1 lb'],
    grades: ['US No. 1'],
    isStandard: true,
    commodities: ['blueberry'],
    category: 'specialty',
    description: 'Tray pack for high-volume blueberries',
    usdaMapping: {
      commodity: 'blueberries',
      specifications: 'tray pack'
    }
  },

  // LEAFY GREENS
  {
    id: 'lettuce-carton',
    type: 'carton',
    name: 'Carton',
    counts: ['12ct', '18ct', '24ct', '30ct'],
    weight: '50 lbs',
    grades: ['US No. 1', 'US No. 2', 'Choice'],
    isStandard: true,
    commodities: ['lettuce'],
    category: 'carton',
    description: 'Standard lettuce carton with count sizing',
    usdaMapping: {
      commodity: 'lettuce'
    }
  },
  {
    id: 'lettuce-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['5 oz', '1 lb', '2 lb'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['lettuce'],
    category: 'bag',
    description: 'Plastic bag for processed lettuce',
    usdaMapping: {
      commodity: 'lettuce',
      specifications: 'bagged'
    }
  },
  {
    id: 'chard-carton',
    type: 'carton',
    name: 'Carton',
    counts: ['12ct', '18ct', '24ct'],
    weight: '20 lbs',
    grades: ['US No. 1', 'US No. 2', 'Choice'],
    isStandard: true,
    commodities: ['chard'],
    category: 'carton',
    description: 'Swiss chard carton with count sizing',
    usdaMapping: {
      commodity: 'chard'
    }
  },
  {
    id: 'chard-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['1 lb', '2 lb', '5 lb'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['chard'],
    category: 'bag',
    description: 'Bag for processed chard',
    usdaMapping: {
      commodity: 'chard',
      specifications: 'bagged'
    }
  },

  // ROOT VEGETABLES
  {
    id: 'carrot-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['25 lb', '50 lb'],
    grades: ['US No. 1', 'US No. 2', 'Choice'],
    isStandard: true,
    commodities: ['carrot'],
    category: 'carton',
    description: 'Standard carrot carton',
    usdaMapping: {
      commodity: 'carrots'
    }
  },
  {
    id: 'carrot-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['1 lb', '2 lb', '5 lb', '10 lb', '25 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['carrot'],
    category: 'bag',
    description: 'Mesh or plastic bag for carrots',
    usdaMapping: {
      commodity: 'carrots',
      specifications: 'bagged'
    }
  },

  // STONE FRUITS
  {
    id: 'peach-carton-25lb',
    type: 'carton',
    name: '25 lb Carton',
    counts: ['36s', '40s', '48s', '56s', '64s', '72s', '80s'],
    weight: '25 lbs',
    grades: ['Extra Fancy', 'Fancy', 'Choice', 'Juice'],
    isStandard: true,
    commodities: ['peach'],
    category: 'carton',
    description: 'Standard peach carton (25 pounds)',
    usdaMapping: {
      commodity: 'peaches'
    }
  },

  // VINE CROPS
  {
    id: 'tomato-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['25 lb', '20 lb'],
    grades: ['US No. 1', 'US No. 2', 'US No. 3'],
    isStandard: true,
    commodities: ['tomato'],
    category: 'carton',
    description: 'Standard tomato carton',
    usdaMapping: {
      commodity: 'tomatoes'
    }
  },
  {
    id: 'tomato-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['1 lb', '2 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['tomato'],
    category: 'container',
    description: 'Clamshell for specialty tomatoes',
    usdaMapping: {
      commodity: 'tomatoes',
      specifications: 'on the vine'
    }
  },

  // TROPICAL FRUITS
  {
    id: 'kiwi-carton-7lb',
    type: 'carton',
    name: '7 lb Carton',
    counts: ['18s', '22s', '27s', '33s', '39s', '45s'],
    weight: '7 lbs',
    grades: ['Fancy', 'Choice', 'US No. 1'],
    isStandard: true,
    commodities: ['kiwi'],
    category: 'carton',
    description: 'Standard kiwi carton (7 pounds)',
    usdaMapping: {
      commodity: 'kiwi'
    }
  },
  {
    id: 'kiwi-tray',
    type: 'tray',
    name: 'Tray Pack',
    sizes: ['1 lb', '2 lb'],
    grades: ['Fancy', 'Choice'],
    isStandard: true,
    commodities: ['kiwi'],
    category: 'specialty',
    description: 'Tray pack for retail kiwi',
    usdaMapping: {
      commodity: 'kiwi',
      specifications: 'tray pack'
    }
  },

  // Kiwi Berry packaging
  {
    id: 'kiwi-berry-clamshell-1lb',
    type: 'clamshell',
    name: '1 lb Clamshell',
    sizes: ['1 lb'],
    grades: ['Fancy', 'Choice', 'US No. 1'],
    isStandard: true,
    commodities: ['kiwi-berry'],
    category: 'specialty',
    description: 'Premium clamshell for kiwi berries (1 pound)',
    usdaMapping: {
      commodity: 'kiwi-berry'
    }
  },
  {
    id: 'kiwi-berry-basket-6oz',
    type: 'basket',
    name: '6 oz Basket',
    sizes: ['6 oz'],
    grades: ['Fancy', 'Choice'],
    isStandard: false,
    commodities: ['kiwi-berry'],
    category: 'specialty',
    description: 'Small basket for premium kiwi berries',
    usdaMapping: {
      commodity: 'kiwi-berry'
    }
  },
  {
    id: 'avocado-carton-25lb',
    type: 'carton',
    name: '25 lb Carton',
    counts: ['32s', '36s', '40s', '48s', '60s', '70s', '84s'],
    weight: '25 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['avocado'],
    category: 'carton',
    description: 'Standard avocado carton (25 pounds)',
    usdaMapping: {
      commodity: 'avocados'
    }
  },
  {
    id: 'avocado-bag',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['4 ct', '5 ct', '6 ct'],
    grades: ['US No. 1'],
    isStandard: true,
    commodities: ['avocado'],
    category: 'bag',
    description: 'Retail bag for avocados',
    usdaMapping: {
      commodity: 'avocados',
      specifications: 'bagged'
    }
  },
  {
    id: 'mango-carton-10lb',
    type: 'carton',
    name: '10 lb Carton',
    counts: ['6s', '8s', '9s', '10s', '12s', '14s', '16s', '18s'],
    weight: '10 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['mango'],
    category: 'carton',
    description: 'Standard mango carton (10 pounds)',
    usdaMapping: {
      commodity: 'mangoes'
    }
  },
  {
    id: 'pineapple-carton-20lb',
    type: 'carton',
    name: '20 lb Carton',
    counts: ['5s', '6s', '7s', '8s', '10s', '12s'],
    weight: '20 lbs',
    grades: ['Fancy', 'Choice', 'Standard'],
    isStandard: true,
    commodities: ['pineapple'],
    category: 'carton',
    description: 'Standard pineapple carton (20 pounds)',
    usdaMapping: {
      commodity: 'pineapples'
    }
  },
  {
    id: 'papaya-carton-10lb',
    type: 'carton',
    name: '10 lb Carton',
    counts: ['6s', '8s', '9s', '12s', '15s', '18s'],
    weight: '10 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['papaya'],
    category: 'carton',
    description: 'Standard papaya carton (10 pounds)',
    usdaMapping: {
      commodity: 'papayas'
    }
  },
  {
    id: 'banana-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['40 lb', '50 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['banana'],
    category: 'carton',
    description: 'Standard banana carton',
    usdaMapping: {
      commodity: 'bananas'
    }
  },
  {
    id: 'banana-bag',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['3 lb', '5 lb'],
    grades: ['US No. 1'],
    isStandard: true,
    commodities: ['banana'],
    category: 'bag',
    description: 'Retail bag for bananas',
    usdaMapping: {
      commodity: 'bananas',
      specifications: 'bagged'
    }
  },
  {
    id: 'dates-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['5 lb', '10 lb', '11 lb', '22 lb'],
    grades: ['Fancy', 'Choice', 'Standard'],
    isStandard: true,
    commodities: ['dates'],
    category: 'carton',
    description: 'Standard dates carton',
    usdaMapping: {
      commodity: 'dates'
    }
  },
  {
    id: 'dates-bag',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['1 lb', '2 lb', '5 lb'],
    grades: ['Fancy', 'Choice'],
    isStandard: true,
    commodities: ['dates'],
    category: 'bag',
    description: 'Retail bag for dates',
    usdaMapping: {
      commodity: 'dates',
      specifications: 'bagged'
    }
  },

  // NUTS
  {
    id: 'almond-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Extra No. 1', 'No. 1', 'Select Sheller Run', 'Standard Sheller Run'],
    isStandard: true,
    commodities: ['almond'],
    category: 'bag',
    description: 'Standard almond bag',
    usdaMapping: {
      commodity: 'almonds'
    }
  },
  {
    id: 'almond-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['30 lb', '50 lb'],
    grades: ['Extra No. 1', 'No. 1'],
    isStandard: true,
    commodities: ['almond'],
    category: 'carton',
    description: 'Carton for premium almonds',
    usdaMapping: {
      commodity: 'almonds',
      specifications: 'carton'
    }
  },
  {
    id: 'walnut-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Extra Light', 'Light', 'Light Amber', 'Amber'],
    isStandard: true,
    commodities: ['walnut'],
    category: 'bag',
    description: 'Standard walnut bag',
    usdaMapping: {
      commodity: 'walnuts'
    }
  },
  {
    id: 'pecan-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Fancy', 'Choice', 'Standard', 'Commercial'],
    isStandard: true,
    commodities: ['pecan'],
    category: 'bag',
    description: 'Standard pecan bag',
    usdaMapping: {
      commodity: 'pecans'
    }
  },
  {
    id: 'pistachio-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Fancy', 'Extra No. 1', 'No. 1'],
    isStandard: true,
    commodities: ['pistachio'],
    category: 'bag',
    description: 'Standard pistachio bag',
    usdaMapping: {
      commodity: 'pistachios'
    }
  },

  // ADDITIONAL NUTS
  {
    id: 'hazelnut-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Extra No. 1', 'No. 1', 'Standard'],
    isStandard: true,
    commodities: ['hazelnut'],
    category: 'bag',
    description: 'Standard hazelnut bag',
    usdaMapping: {
      commodity: 'hazelnuts'
    }
  },
  {
    id: 'macadamia-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['Fancy', 'Extra No. 1', 'No. 1'],
    isStandard: true,
    commodities: ['macadamia'],
    category: 'bag',
    description: 'Standard macadamia bag',
    usdaMapping: {
      commodity: 'macadamias'
    }
  },
  {
    id: 'chestnut-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['25 lb', '50 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['chestnut'],
    category: 'bag',
    description: 'Standard chestnut bag',
    usdaMapping: {
      commodity: 'chestnuts'
    }
  },

  // POME FRUITS
  {
    id: 'apple-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    counts: ['64s', '72s', '80s', '88s', '100s', '113s', '125s', '138s'],
    weight: '40 lbs',
    grades: ['Extra Fancy', 'Fancy', 'Choice', 'Utility'],
    isStandard: true,
    commodities: ['apple'],
    category: 'carton',
    description: 'Standard apple carton (40 pounds)',
    usdaMapping: {
      commodity: 'apples'
    }
  },
  {
    id: 'apple-bag',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['3 lb', '5 lb', '8 lb', '10 lb'],
    grades: ['Extra Fancy', 'Fancy', 'Choice'],
    isStandard: true,
    commodities: ['apple'],
    category: 'bag',
    description: 'Retail bag for apples',
    usdaMapping: {
      commodity: 'apples',
      specifications: 'bagged'
    }
  },
  {
    id: 'pear-carton-44lb',
    type: 'carton',
    name: '44 lb Carton',
    counts: ['60s', '70s', '80s', '90s', '100s', '110s', '120s', '135s'],
    weight: '44 lbs',
    grades: ['Extra No. 1', 'No. 1', 'No. 2'],
    isStandard: true,
    commodities: ['pear'],
    category: 'carton',
    description: 'Standard pear carton (44 pounds)',
    usdaMapping: {
      commodity: 'pears'
    }
  },
  {
    id: 'pear-bag',
    type: 'bag',
    name: 'Retail Bag',
    sizes: ['2 lb', '3 lb', '5 lb'],
    grades: ['Extra No. 1', 'No. 1'],
    isStandard: true,
    commodities: ['pear'],
    category: 'bag',
    description: 'Retail bag for pears',
    usdaMapping: {
      commodity: 'pears',
      specifications: 'bagged'
    }
  },

  // ADDITIONAL STONE FRUITS
  {
    id: 'plum-carton-28lb',
    type: 'carton',
    name: '28 lb Carton',
    counts: ['56s', '70s', '84s', '105s', '120s'],
    weight: '28 lbs',
    grades: ['Extra Fancy', 'Fancy', 'Choice'],
    isStandard: true,
    commodities: ['plum'],
    category: 'carton',
    description: 'Standard plum carton (28 pounds)',
    usdaMapping: {
      commodity: 'plums'
    }
  },
  {
    id: 'cherry-carton-20lb',
    type: 'carton',
    name: '20 lb Carton',
    sizes: ['2 lb bags', '5 lb bags'],
    grades: ['Extra No. 1', 'No. 1', 'No. 2'],
    isStandard: true,
    commodities: ['cherry'],
    category: 'carton',
    description: 'Standard cherry carton (20 pounds)',
    usdaMapping: {
      commodity: 'cherries'
    }
  },
  {
    id: 'apricot-carton-24lb',
    type: 'carton',
    name: '24 lb Carton',
    counts: ['48s', '60s', '72s', '84s', '96s'],
    weight: '24 lbs',
    grades: ['Extra No. 1', 'No. 1', 'No. 2'],
    isStandard: true,
    commodities: ['apricot'],
    category: 'carton',
    description: 'Standard apricot carton (24 pounds)',
    usdaMapping: {
      commodity: 'apricots'
    }
  },

  // ADDITIONAL CITRUS
  {
    id: 'mandarin-carton-25lb',
    type: 'carton',
    name: '25 lb Carton',
    counts: ['88s', '105s', '120s', '138s', '163s'],
    weight: '25 lbs',
    grades: ['Fancy', 'Choice', 'Standard'],
    isStandard: true,
    commodities: ['mandarin'],
    category: 'carton',
    description: 'Standard mandarin carton (25 pounds)',
    usdaMapping: {
      commodity: 'mandarins'
    }
  },
  {
    id: 'minneola-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    counts: ['32s', '36s', '40s', '48s', '56s'],
    weight: '40 lbs',
    grades: ['Fancy', 'Choice'],
    isStandard: true,
    commodities: ['minneola'],
    category: 'carton',
    description: 'Standard minneola carton (40 pounds)',
    usdaMapping: {
      commodity: 'tangelos'
    }
  },

  // ADDITIONAL BERRIES
  {
    id: 'raspberry-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['6 oz', '12 oz', '1 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['raspberry'],
    category: 'container',
    description: 'Plastic clamshell container for raspberries',
    usdaMapping: {
      commodity: 'raspberries'
    }
  },
  {
    id: 'blackberry-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['6 oz', '12 oz', '1 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['blackberry'],
    category: 'container',
    description: 'Plastic clamshell container for blackberries',
    usdaMapping: {
      commodity: 'blackberries'
    }
  },

  // ADDITIONAL ROOT VEGETABLES
  {
    id: 'potato-carton-50lb',
    type: 'carton',
    name: '50 lb Carton',
    sizes: ['50 lb'],
    grades: ['US No. 1', 'US No. 2', 'US Commercial'],
    isStandard: true,
    commodities: ['potato'],
    category: 'carton',
    description: 'Standard potato carton (50 pounds)',
    usdaMapping: {
      commodity: 'potatoes'
    }
  },
  {
    id: 'potato-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['5 lb', '10 lb', '15 lb', '20 lb', '50 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['potato'],
    category: 'bag',
    description: 'Mesh or plastic bag for potatoes',
    usdaMapping: {
      commodity: 'potatoes',
      specifications: 'bagged'
    }
  },
  {
    id: 'sweet-potato-carton-40lb',
    type: 'carton',
    name: '40 lb Carton',
    sizes: ['40 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['sweet-potato'],
    category: 'carton',
    description: 'Standard sweet potato carton (40 pounds)',
    usdaMapping: {
      commodity: 'sweet potatoes'
    }
  },
  {
    id: 'onion-carton-50lb',
    type: 'carton',
    name: '50 lb Carton',
    sizes: ['50 lb'],
    grades: ['US No. 1', 'US No. 2', 'US Commercial'],
    isStandard: true,
    commodities: ['onion'],
    category: 'carton',
    description: 'Standard onion carton (50 pounds)',
    usdaMapping: {
      commodity: 'onions'
    }
  },
  {
    id: 'onion-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['3 lb', '5 lb', '10 lb', '25 lb', '50 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['onion'],
    category: 'bag',
    description: 'Mesh bag for onions',
    usdaMapping: {
      commodity: 'onions',
      specifications: 'bagged'
    }
  },

  // ADDITIONAL LEAFY GREENS
  {
    id: 'spinach-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['4 oz', '5 oz', '1 lb', '2.5 lb'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['spinach'],
    category: 'carton',
    description: 'Carton for fresh spinach',
    usdaMapping: {
      commodity: 'spinach'
    }
  },
  {
    id: 'spinach-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['5 oz', '1 lb', '2 lb', '5 lb'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['spinach'],
    category: 'bag',
    description: 'Plastic bag for spinach',
    usdaMapping: {
      commodity: 'spinach',
      specifications: 'bagged'
    }
  },
  {
    id: 'kale-carton',
    type: 'carton',
    name: 'Carton',
    counts: ['12ct', '18ct', '24ct'],
    weight: '20 lbs',
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['kale'],
    category: 'carton',
    description: 'Carton for fresh kale',
    usdaMapping: {
      commodity: 'kale'
    }
  },
  {
    id: 'arugula-bag',
    type: 'bag',
    name: 'Bag',
    sizes: ['4 oz', '5 oz', '1 lb'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['arugula'],
    category: 'bag',
    description: 'Plastic bag for arugula',
    usdaMapping: {
      commodity: 'arugula'
    }
  },

  // ADDITIONAL VINE CROPS
  {
    id: 'bell-pepper-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['25 lb', '30 lb'],
    grades: ['US Fancy', 'US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['bell-pepper'],
    category: 'carton',
    description: 'Standard bell pepper carton',
    usdaMapping: {
      commodity: 'bell peppers'
    }
  },
  {
    id: 'hot-pepper-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['10 lb', '25 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['hot-pepper'],
    category: 'carton',
    description: 'Standard hot pepper carton',
    usdaMapping: {
      commodity: 'hot peppers'
    }
  },
  {
    id: 'cucumber-carton',
    type: 'carton',
    name: 'Carton',
    sizes: ['55 lb'],
    grades: ['US Fancy', 'US Extra No. 1', 'US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['cucumber'],
    category: 'carton',
    description: 'Standard cucumber carton (55 pounds)',
    usdaMapping: {
      commodity: 'cucumbers'
    }
  },

  // HERBS (Simplified - one spec for all)
  {
    id: 'herbs-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['0.5 oz', '0.75 oz', '1 oz', '2 oz'],
    grades: ['US No. 1', 'Choice'],
    isStandard: true,
    commodities: ['basil', 'mint', 'rosemary', 'thyme', 'cilantro', 'parsley'],
    category: 'container',
    description: 'Clear plastic clamshell for fresh herbs',
    usdaMapping: {
      commodity: 'herbs'
    }
  },

  // ADDITIONAL TROPICAL FRUITS
  {
    id: 'coconut-carton',
    type: 'carton',
    name: 'Carton',
    counts: ['9s', '12s', '15s', '18s'],
    weight: '35 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['coconut'],
    category: 'carton',
    description: 'Standard coconut carton (35 pounds)',
    usdaMapping: {
      commodity: 'coconuts'
    }
  },
  {
    id: 'passion-fruit-clamshell',
    type: 'clamshell',
    name: 'Clamshell',
    sizes: ['1 lb', '2 lb'],
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['passion-fruit'],
    category: 'container',
    description: 'Clamshell container for passion fruit',
    usdaMapping: {
      commodity: 'passion fruit'
    }
  },
  {
    id: 'dragon-fruit-carton',
    type: 'carton',
    name: 'Carton',
    counts: ['12s', '15s', '18s', '24s'],
    weight: '10 lbs',
    grades: ['US No. 1', 'US No. 2'],
    isStandard: true,
    commodities: ['dragon-fruit'],
    category: 'carton',
    description: 'Standard dragon fruit carton (10 pounds)',
    usdaMapping: {
      commodity: 'dragon fruit'
    }
  }
]

// Helper functions for the unified system
export function getPackagingSpecs(commodityId: string, includeCustom: boolean = false, userId?: string): PackagingSpec[] {
  const specs = standardPackagingSpecs.filter(spec => 
    spec.commodities.includes(commodityId)
  )
  
  // TODO: Add custom packaging from database when includeCustom is true
  // This will be implemented when we integrate with the backend
  
  return specs
}

export function getStandardPackaging(commodityId: string): PackagingSpec[] {
  return standardPackagingSpecs.filter(spec => 
    spec.commodities.includes(commodityId) && spec.isStandard
  )
}

export function getAllPackagingSpecs(): PackagingSpec[] {
  return standardPackagingSpecs
}

export function getPackagingByCategory(category: string): PackagingSpec[] {
  return standardPackagingSpecs.filter(spec => spec.category === category)
}

export function getPackagingById(id: string): PackagingSpec | undefined {
  return standardPackagingSpecs.find(spec => spec.id === id)
}

// Legacy compatibility - maps old structure to new
export interface LegacyPackagingSpec {
  type: 'carton' | 'bag' | 'bulk' | 'clamshell' | 'tray'
  counts?: string[]
  sizes?: string[]
  weight?: string
  grades: string[]
  usdaMapping?: {
    commodity: string
    specifications?: string
  }
}

export interface LegacyCommodityPackaging {
  commodityId: string
  packagingOptions: LegacyPackagingSpec[]
}

// Convert new unified specs to legacy format for backward compatibility
export function toLegacyFormat(commodityId: string): LegacyCommodityPackaging {
  const specs = getPackagingSpecs(commodityId)
  
  return {
    commodityId,
    packagingOptions: specs.map(spec => ({
      type: spec.type,
      counts: spec.counts,
      sizes: spec.sizes,
      weight: spec.weight,
      grades: spec.grades,
      usdaMapping: spec.usdaMapping
    }))
  }
}