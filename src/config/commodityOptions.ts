export interface CommodityOption {
  id: string
  name: string
  varieties: string[]
}

export interface CategoryOption {
  id: string
  name: string
  commodities: CommodityOption[]
}

export const commodityOptions: CategoryOption[] = [
  {
    id: 'root-vegetables',
    name: 'Root Vegetables',
    commodities: [
      {
        id: 'carrot',
        name: 'Carrot',
        varieties: ['Nantes', 'Imperator', 'Chantenay', 'Danvers', 'Baby Carrots', 'Purple Dragon', 'White Satin', 'Atomic Red']
      },
      {
        id: 'potato',
        name: 'Potato',
        varieties: ['Russet', 'Yukon Gold', 'Red Potato', 'Fingerling', 'Purple Majesty', 'Kennebec', 'Idaho', 'New Potatoes']
      },
      {
        id: 'onion',
        name: 'Onion',
        varieties: ['Yellow Onion', 'Red Onion', 'White Onion', 'Sweet Onion', 'Vidalia', 'Walla Walla', 'Shallot', 'Green Onion']
      },
      {
        id: 'garlic',
        name: 'Garlic',
        varieties: ['Softneck', 'Hardneck', 'Elephant Garlic', 'Purple Stripe', 'Porcelain', 'Artichoke', 'Rocambole', 'Silverskin']
      },
      {
        id: 'beet',
        name: 'Beet',
        varieties: ['Red Beet', 'Golden Beet', 'Chioggia', 'Detroit Dark Red', 'Cylindra', 'Bull\'s Blood', 'Albino', 'Sugar Beet']
      },
      {
        id: 'turnip',
        name: 'Turnip',
        varieties: ['Purple Top White Globe', 'Tokyo Cross', 'Hakurei', 'Scarlet Queen', 'Golden Ball', 'White Lady', 'Market Express']
      }
    ]
  },
  {
    id: 'leafy-greens',
    name: 'Leafy Greens',
    commodities: [
      {
        id: 'lettuce',
        name: 'Lettuce',
        varieties: ['Romaine', 'Butterhead', 'Iceberg', 'Red Leaf', 'Green Leaf', 'Bibb', 'Boston', 'Little Gem', 'Endive', 'Escarole']
      },
      {
        id: 'spinach',
        name: 'Spinach',
        varieties: ['Baby Spinach', 'Savoy', 'Flat Leaf', 'Bloomsdale', 'Tyee', 'Space', 'Melody', 'Corvair']
      },
      {
        id: 'kale',
        name: 'Kale',
        varieties: ['Curly Kale', 'Lacinato (Dinosaur)', 'Red Russian', 'Winterbor', 'Vates', 'Redbor', 'Scarlet', 'Beira']
      },
      {
        id: 'chard',
        name: 'Swiss Chard',
        varieties: ['Rainbow Chard', 'Fordhook Giant', 'Bright Lights', 'Ruby Red', 'White Silver', 'Golden', 'Perpetual Spinach']
      },
      {
        id: 'arugula',
        name: 'Arugula',
        varieties: ['Wild Arugula', 'Cultivated Arugula', 'Sylvetta', 'Astro', 'Apollo', 'Sprint', 'Slow Bolt']
      }
    ]
  },
  {
    id: 'berries',
    name: 'Berries',
    commodities: [
      {
        id: 'strawberry',
        name: 'Strawberry',
        varieties: ['Albion', 'Chandler', 'Seascape', 'Earliglow', 'Jewel', 'Honeoye', 'Allstar', 'Tristar', 'Eversweet', 'Quinalt']
      },
      {
        id: 'blueberry',
        name: 'Blueberry',
        varieties: ['Bluecrop', 'Jersey', 'Duke', 'Elliott', 'Chandler', 'Legacy', 'Sunshine Blue', 'Pink Lemonade', 'Pink Popcorn']
      },
      {
        id: 'raspberry',
        name: 'Raspberry',
        varieties: ['Heritage', 'Caroline', 'Autumn Bliss', 'Joan J', 'Polka', 'Tulameen', 'Willamette', 'Meeker', 'Cascade Delight']
      },
      {
        id: 'blackberry',
        name: 'Blackberry',
        varieties: ['Triple Crown', 'Chester', 'Navaho', 'Arapaho', 'Ouachita', 'Kiowa', 'Prime Ark', 'Prime Jim', 'Prime Jan']
      }
    ]
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    commodities: [
      {
        id: 'cherry-tomato',
        name: 'Cherry Tomato',
        varieties: ['Sweet 100', 'Sungold', 'Black Cherry', 'Yellow Pear', 'Red Pear', 'Green Grape', 'White Cherry', 'Chocolate Cherry']
      },
      {
        id: 'roma-tomato',
        name: 'Roma Tomato',
        varieties: ['Roma VF', 'San Marzano', 'Amish Paste', 'Opalka', 'Viva Italia', 'Heinz 2653', 'Plum Regal', 'La Roma']
      },
      {
        id: 'beefsteak-tomato',
        name: 'Beefsteak Tomato',
        varieties: ['Big Boy', 'Beefmaster', 'Brandywine', 'Cherokee Purple', 'Mortgage Lifter', 'Pink Brandywine', 'German Johnson']
      },
      {
        id: 'heirloom-tomato',
        name: 'Heirloom Tomato',
        varieties: ['Brandywine', 'Cherokee Purple', 'Green Zebra', 'Black Krim', 'Yellow Brandywine', 'Pineapple', 'Striped German']
      }
    ]
  },
  {
    id: 'peppers',
    name: 'Peppers',
    commodities: [
      {
        id: 'bell-pepper',
        name: 'Bell Pepper',
        varieties: ['California Wonder', 'Red Knight', 'Yellow Bell', 'Orange Bell', 'Purple Bell', 'Chocolate Bell', 'White Bell', 'Green Bell']
      },
      {
        id: 'jalapeno',
        name: 'Jalapeño',
        varieties: ['Early Jalapeño', 'Jalapeño M', 'Jalapeño Grande', 'Jalapeño Jumbo', 'Jalapeño Mucho Nacho', 'Jalapeño El Jefe']
      },
      {
        id: 'habanero',
        name: 'Habanero',
        varieties: ['Orange Habanero', 'Red Habanero', 'Chocolate Habanero', 'White Habanero', 'Caribbean Red', 'Scotch Bonnet']
      },
      {
        id: 'poblano',
        name: 'Poblano',
        varieties: ['Ancho', 'Mulato', 'Poblano L', 'Poblano M', 'Poblano Grande', 'Poblano Ancho']
      }
    ]
  },
  {
    id: 'herbs',
    name: 'Herbs',
    commodities: [
      {
        id: 'basil',
        name: 'Basil',
        varieties: ['Sweet Basil', 'Genovese', 'Thai Basil', 'Lemon Basil', 'Purple Basil', 'Cinnamon Basil', 'Holy Basil', 'Lime Basil']
      },
      {
        id: 'mint',
        name: 'Mint',
        varieties: ['Spearmint', 'Peppermint', 'Chocolate Mint', 'Apple Mint', 'Pineapple Mint', 'Orange Mint', 'Lemon Mint', 'Ginger Mint']
      },
      {
        id: 'rosemary',
        name: 'Rosemary',
        varieties: ['Tuscan Blue', 'Arp', 'Blue Spires', 'Prostratus', 'Golden Rain', 'Pink', 'White', 'Blue Boy']
      },
      {
        id: 'thyme',
        name: 'Thyme',
        varieties: ['English Thyme', 'Lemon Thyme', 'Creeping Thyme', 'Silver Thyme', 'Golden Thyme', 'Caraway Thyme', 'Orange Thyme']
      }
    ]
  },
  {
    id: 'citrus',
    name: 'Citrus',
    commodities: [
      {
        id: 'orange',
        name: 'Orange',
        varieties: ['Navel', 'Valencia', 'Blood Orange', 'Cara Cara', 'Seville', 'Mandarin', 'Tangerine', 'Clementine', 'Satsuma']
      },
      {
        id: 'lemon',
        name: 'Lemon',
        varieties: ['Eureka', 'Lisbon', 'Meyer', 'Ponderosa', 'Variegated Pink', 'Femminello', 'Villafranca', 'Genoa']
      },
      {
        id: 'lime',
        name: 'Lime',
        varieties: ['Persian Lime', 'Key Lime', 'Kaffir Lime', 'Mexican Lime', 'Rangpur Lime', 'Calamondin', 'Yuzu', 'Finger Lime']
      },
      {
        id: 'grapefruit',
        name: 'Grapefruit',
        varieties: ['Ruby Red', 'Pink', 'White', 'Star Ruby', 'Flame', 'Marsh', 'Duncan', 'Oro Blanco', 'Melogold']
      }
    ]
  },
  {
    id: 'stone-fruits',
    name: 'Stone Fruits',
    commodities: [
      {
        id: 'peach',
        name: 'Peach',
        varieties: ['Elberta', 'Redhaven', 'Cresthaven', 'Reliance', 'Contender', 'Belle of Georgia', 'Redskin', 'White Lady', 'Donut Peach']
      },
      {
        id: 'plum',
        name: 'Plum',
        varieties: ['Santa Rosa', 'Methley', 'Beauty', 'Burbank', 'Stanley', 'Damson', 'Green Gage', 'Mirabelle', 'Shiro']
      },
      {
        id: 'cherry',
        name: 'Cherry',
        varieties: ['Bing', 'Rainier', 'Lapins', 'Sweetheart', 'Stella', 'Van', 'Lambert', 'Royal Ann', 'Black Tartarian']
      },
      {
        id: 'apricot',
        name: 'Apricot',
        varieties: ['Moorpark', 'Blenheim', 'Tilton', 'Harcot', 'Goldcot', 'Harglow', 'Perfection', 'Royal', 'Chinese']
      }
    ]
  }
]

// Helper functions for easy access
export const getCategoryById = (id: string): CategoryOption | undefined => {
  return commodityOptions.find(category => category.id === id)
}

export const getCommodityById = (categoryId: string, commodityId: string): CommodityOption | undefined => {
  const category = getCategoryById(categoryId)
  return category?.commodities.find(commodity => commodity.id === commodityId)
}

export const getVarietiesByCommodity = (categoryId: string, commodityId: string): string[] => {
  const commodity = getCommodityById(categoryId, commodityId)
  return commodity?.varieties || []
}

// Get all category names for dropdowns
export const getCategoryNames = (): { id: string; name: string }[] => {
  return commodityOptions.map(category => ({
    id: category.id,
    name: category.name
  }))
}

// Get all commodity names for a specific category
export const getCommodityNames = (categoryId: string): { id: string; name: string }[] => {
  const category = getCategoryById(categoryId)
  return category?.commodities.map(commodity => ({
    id: commodity.id,
    name: commodity.name
  })) || []
}
