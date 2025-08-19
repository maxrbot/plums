export interface CommoditySubtype {
  id: string
  name: string
  varieties: string[]
}

export interface CommodityOption {
  id: string
  name: string
  subtypes?: CommoditySubtype[]  // For complex commodities
  varieties?: string[]           // For simple commodities
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
        subtypes: [
          {
            id: 'russet',
            name: 'Russet',
            varieties: ['Russet Burbank', 'Russet Norkotah', 'Russet Ranger', 'Idaho Russet', 'Shepody', 'Umatilla Russet']
          },
          {
            id: 'yellow',
            name: 'Yellow',
            varieties: ['Yukon Gold', 'Yukon Gem', 'Yellow Finn', 'German Butterball', 'Carola', 'Nicola']
          },
          {
            id: 'red',
            name: 'Red',
            varieties: ['Red Pontiac', 'Norland', 'Red LaSoda', 'Chieftain', 'Red Bliss', 'Dakota Rose']
          },
          {
            id: 'white',
            name: 'White',
            varieties: ['Kennebec', 'Superior', 'Atlantic', 'Snowden', 'Pike', 'Katahdin']
          },
          {
            id: 'fingerling',
            name: 'Fingerling',
            varieties: ['Russian Banana', 'Purple Peruvian', 'Rose Finn Apple', 'La Ratte', 'Austrian Crescent', 'Ruby Crescent']
          },
          {
            id: 'specialty',
            name: 'Specialty',
            varieties: ['Purple Majesty', 'Adirondack Blue', 'All Blue', 'Purple Viking', 'Mountain Rose', 'Cranberry Red']
          }
        ]
      },
      {
        id: 'sweet-potato',
        name: 'Sweet Potato',
        subtypes: [
          {
            id: 'orange',
            name: 'Orange Flesh',
            varieties: ['Beauregard', 'Covington', 'Centennial', 'Georgia Jet', 'Vardaman', 'Evangeline']
          },
          {
            id: 'white',
            name: 'White Flesh',
            varieties: ['O\'Henry', 'Sumor', 'Japanese Sweet', 'Hannah', 'White Triumph', 'Bonita']
          },
          {
            id: 'purple',
            name: 'Purple Flesh',
            varieties: ['Stokes Purple', 'Purple Sweet', 'Okinawan', 'Ube', 'Charleston Purple', 'All Purple']
          }
        ]
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
    id: 'vine-crops',
    name: 'Vine Crops',
    commodities: [
      {
        id: 'tomato',
        name: 'Tomato',
        subtypes: [
          {
            id: 'cherry',
            name: 'Cherry',
            varieties: ['Sweet 100', 'Sun Gold', 'Black Cherry', 'Yellow Pear', 'Red Cherry', 'Chocolate Cherry', 'Green Grape', 'Matt\'s Wild Cherry']
          },
          {
            id: 'roma',
            name: 'Roma/Paste',
            varieties: ['San Marzano', 'Roma VF', 'Amish Paste', 'Opalka', 'Principe Borghese', 'Speckled Roman', 'Phoenix', 'Martino\'s Roma']
          },
          {
            id: 'beefsteak',
            name: 'Beefsteak',
            varieties: ['Brandywine', 'Big Beef', 'Celebrity', 'Better Boy', 'Early Girl', 'Mortgage Lifter', 'German Johnson', 'Supersteak']
          },
          {
            id: 'heirloom',
            name: 'Heirloom',
            varieties: ['Brandywine', 'Cherokee Purple', 'Green Zebra', 'Black Krim', 'Yellow Brandywine', 'Pineapple', 'Striped German']
          }
        ]
      },
      {
        id: 'bell-pepper',
        name: 'Bell Pepper',
        subtypes: [
          {
            id: 'green',
            name: 'Green',
            varieties: ['California Wonder', 'Green Bell', 'Emerald Giant', 'Keystone Resistant Giant']
          },
          {
            id: 'colored',
            name: 'Colored',
            varieties: ['Red Knight', 'Yellow Bell', 'Orange Bell', 'Purple Bell', 'Chocolate Bell', 'White Bell']
          }
        ]
      },
      {
        id: 'hot-pepper',
        name: 'Hot Pepper',
        subtypes: [
          {
            id: 'mild',
            name: 'Mild',
            varieties: ['Poblano', 'Anaheim', 'New Mexico', 'Hungarian Wax']
          },
          {
            id: 'medium',
            name: 'Medium',
            varieties: ['Jalapeño', 'Serrano', 'Fresno', 'Chipotle']
          },
          {
            id: 'hot',
            name: 'Hot',
            varieties: ['Cayenne', 'Thai Chili', 'Tabasco', 'Pequin']
          },
          {
            id: 'superhot',
            name: 'Super Hot',
            varieties: ['Habanero', 'Ghost Pepper', 'Carolina Reaper', 'Trinidad Scorpion']
          }
        ]
      },
      {
        id: 'cucumber',
        name: 'Cucumber',
        varieties: ['Slicing', 'Pickling', 'English', 'Persian', 'Lemon', 'Armenian', 'Japanese', 'Burpless']
      },
      {
        id: 'summer-squash',
        name: 'Summer Squash',
        varieties: ['Zucchini', 'Yellow Crookneck', 'Yellow Straightneck', 'Pattypan', 'Costata Romanesco', 'Eight Ball', 'Sunburst']
      },
      {
        id: 'winter-squash',
        name: 'Winter Squash',
        varieties: ['Butternut', 'Acorn', 'Spaghetti', 'Delicata', 'Kabocha', 'Hubbard', 'Sugar Pie Pumpkin', 'Honeynut']
      },
      {
        id: 'melon',
        name: 'Melon',
        subtypes: [
          {
            id: 'watermelon',
            name: 'Watermelon',
            varieties: ['Crimson Sweet', 'Sugar Baby', 'Charleston Gray', 'Jubilee', 'Black Diamond', 'Yellow Crimson', 'Seedless Watermelon', 'Mini Watermelon', 'Orange Watermelon']
          },
          {
            id: 'cantaloupe',
            name: 'Cantaloupe',
            varieties: ['Athena', 'Ambrosia', 'Hale\'s Best', 'Hearts of Gold', 'Honey Rock', 'Minnesota Midget', 'Savor', 'Sarah\'s Choice']
          },
          {
            id: 'honeydew',
            name: 'Honeydew',
            varieties: ['Honey Dew', 'Orange Honeydew', 'Temptation', 'Earlidew', 'Venus', 'Honey Pearl', 'Green Flesh', 'Orange Flesh']
          },
          {
            id: 'specialty',
            name: 'Specialty Melon',
            varieties: ['Crenshaw', 'Casaba', 'Persian', 'Galia', 'Charentais', 'Canary', 'Juan Canary', 'Santa Claus']
          }
        ]
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
    id: 'citrus-fruits',
    name: 'Citrus Fruits',
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
  },
  {
    id: 'pome-fruits',
    name: 'Pome Fruits',
    commodities: [
      {
        id: 'apple',
        name: 'Apple',
        varieties: ['Gala', 'Fuji', 'Granny Smith', 'Red Delicious', 'Golden Delicious', 'Honeycrisp', 'Braeburn', 'Pink Lady', 'Cripps Pink']
      },
      {
        id: 'pear',
        name: 'Pear',
        varieties: ['Bartlett', 'Anjou', 'Bosc', 'Comice', 'Seckel', 'Forelle', 'Asian Pear', 'Concorde', 'Taylor\'s Gold']
      }
    ]
  },
  {
    id: 'herbs-aromatics',
    name: 'Herbs & Aromatics',
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
      },
      {
        id: 'cilantro',
        name: 'Cilantro',
        varieties: ['Slow Bolt', 'Santo', 'Long Standing', 'Leisure', 'Calypso', 'Delfino', 'Vietnamese', 'Mexican']
      },
      {
        id: 'parsley',
        name: 'Parsley',
        varieties: ['Flat Leaf', 'Curly Leaf', 'Italian', 'Forest Green', 'Triple Curled', 'Giant of Italy', 'Hamburg', 'Moss Curled']
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

// Get subtypes for a commodity (if it has hierarchical structure)
export const getSubtypesByCommodity = (categoryId: string, commodityId: string): CommoditySubtype[] => {
  const commodity = getCommodityById(categoryId, commodityId)
  return commodity?.subtypes || []
}

// Get varieties for a specific subtype
export const getVarietiesBySubtype = (categoryId: string, commodityId: string, subtypeId: string): string[] => {
  const subtypes = getSubtypesByCommodity(categoryId, commodityId)
  const subtype = subtypes.find(st => st.id === subtypeId)
  return subtype?.varieties || []
}

// Check if a commodity has subtypes (hierarchical structure)
export const hasSubtypes = (categoryId: string, commodityId: string): boolean => {
  const commodity = getCommodityById(categoryId, commodityId)
  return !!(commodity?.subtypes && commodity.subtypes.length > 0)
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