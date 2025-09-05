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
      },
      {
        id: 'leek',
        name: 'Leek',
        varieties: ['American Flag', 'King Richard', 'Carentan', 'Giant Musselburgh', 'Lincoln', 'Bandit', 'Lancelot', 'Tadorna']
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
      },
      {
        id: 'celery',
        name: 'Celery',
        varieties: ['Pascal', 'Golden Self-Blanching', 'Utah 52-70', 'Tango', 'Conquistador', 'Redventure', 'Pink Plume', 'Tall Utah']
      }
    ]
  },
  {
    id: 'brassicas',
    name: 'Brassicas & Cole Crops',
    commodities: [
      {
        id: 'broccoli',
        name: 'Broccoli',
        varieties: ['Calabrese', 'De Cicco', 'Waltham 29', 'Premium Crop', 'Packman', 'Green Goliath', 'Arcadia', 'Belstar', 'Marathon', 'Aspabroc', 'Happy Rich', 'Atlantis', 'Apollo', 'Inspiration']
      },
      {
        id: 'cauliflower',
        name: 'Cauliflower',
        varieties: ['Snowball Y Improved', 'Early Snowball', 'Purple of Sicily', 'Cheddar', 'Romanesco', 'Graffiti', 'Orange Bouquet', 'Veronica']
      },
      {
        id: 'cabbage',
        name: 'Cabbage',
        subtypes: [
          {
            id: 'green',
            name: 'Green Cabbage',
            varieties: ['Copenhagen Market', 'Golden Acre', 'Danish Ballhead', 'Stonehead', 'Early Jersey Wakefield', 'Late Flat Dutch']
          },
          {
            id: 'red',
            name: 'Red Cabbage',
            varieties: ['Red Acre', 'Mammoth Red Rock', 'Red Express', 'Ruby Ball', 'Red Rookie', 'Integro']
          },
          {
            id: 'savoy',
            name: 'Savoy Cabbage',
            varieties: ['Savoy Ace', 'Perfection Drumhead Savoy', 'Chieftain Savoy', 'Melissa', 'Tundra']
          },
          {
            id: 'napa',
            name: 'Napa Cabbage',
            varieties: ['Michihili', 'Wong Bok', 'China Express', 'Minuet', 'Bilko', 'Monument']
          }
        ]
      },
      {
        id: 'brussels-sprouts',
        name: 'Brussels Sprouts',
        varieties: ['Long Island Improved', 'Jade Cross', 'Prince Marvel', 'Diablo', 'Franklin', 'Gustus', 'Churchill', 'Red Bull']
      },
      {
        id: 'kohlrabi',
        name: 'Kohlrabi',
        varieties: ['Early White Vienna', 'Early Purple Vienna', 'Grand Duke', 'Kongo', 'Kolibri', 'Quickstar', 'Winner']
      },
      {
        id: 'radish',
        name: 'Radish',
        subtypes: [
          {
            id: 'small',
            name: 'Small Radish',
            varieties: ['Cherry Belle', 'French Breakfast', 'Easter Egg', 'Sparkler', 'Champion', 'Comet', 'Sora']
          },
          {
            id: 'daikon',
            name: 'Daikon',
            varieties: ['Miyashige White', 'April Cross', 'Summer Cross', 'Minowase', 'Alpine', 'KN-Bravo']
          },
          {
            id: 'watermelon',
            name: 'Watermelon Radish',
            varieties: ['Red Meat', 'Misato Rose', 'Beauty Heart', 'Rose Heart']
          }
        ]
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
      },
      {
        id: 'eggplant',
        name: 'Eggplant',
        subtypes: [
          {
            id: 'globe',
            name: 'Globe Eggplant',
            varieties: ['Black Beauty', 'Epic', 'Classic', 'Dusky', 'Black Bell', 'Purple Rain']
          },
          {
            id: 'italian',
            name: 'Italian Eggplant',
            varieties: ['Rosa Bianca', 'Violetta Lunga', 'Listada de Gandia', 'Prosperosa', 'Bambino']
          },
          {
            id: 'asian',
            name: 'Asian Eggplant',
            varieties: ['Japanese Long', 'Chinese Long', 'Ichiban', 'Ping Tung', 'Millionaire', 'Orient Express']
          },
          {
            id: 'specialty',
            name: 'Specialty Eggplant',
            varieties: ['White Eggplant', 'Thai Long Green', 'Turkish Orange', 'Fairy Tale', 'Graffiti', 'Calliope']
          }
        ]
      }
    ]
  },
  {
    id: 'specialty-vegetables',
    name: 'Specialty Vegetables',
    commodities: [
      {
        id: 'asparagus',
        name: 'Asparagus',
        varieties: ['Mary Washington', 'Jersey Giant', 'Purple Passion', 'Atlas', 'Apollo', 'Millennium', 'UC 157', 'Walker Deluxe']
      },
      {
        id: 'artichoke',
        name: 'Artichoke',
        varieties: ['Green Globe', 'Imperial Star', 'Purple of Romagna', 'Violetto', 'Big Heart', 'Emerald', 'Tempo', 'Madrigal']
      },
      {
        id: 'fennel',
        name: 'Fennel',
        varieties: ['Florence Fennel', 'Fino', 'Orion', 'Preludio', 'Romanesco', 'Victorio', 'Perfection', 'Cantino']
      },
      {
        id: 'okra',
        name: 'Okra',
        varieties: ['Clemson Spineless', 'Emerald', 'Annie Oakley II', 'Burgundy', 'Red Velvet', 'Star of David', 'Jambalaya', 'Beck\'s Big Buck']
      },
      {
        id: 'corn',
        name: 'Sweet Corn',
        subtypes: [
          {
            id: 'yellow',
            name: 'Yellow Corn',
            varieties: ['Golden Bantam', 'Honey Select', 'Bodacious', 'Incredible', 'Vision', 'Temptation', 'Obsession']
          },
          {
            id: 'white',
            name: 'White Corn',
            varieties: ['Silver Queen', 'Argent', 'Whiteout', 'Silver King', 'Avalon', 'Captivate', 'Devotion']
          },
          {
            id: 'bicolor',
            name: 'Bicolor Corn',
            varieties: ['Butter and Sugar', 'Honey and Cream', 'Serendipity', 'Ambrosia', 'Providence', 'Luscious', 'Delectable']
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
    id: 'grapes',
    name: 'Grapes',
    commodities: [
      {
        id: 'table-grape',
        name: 'Table Grape',
        subtypes: [
          {
            id: 'green',
            name: 'Green Grapes',
            varieties: ['Sweet Globe', 'Ivory', 'Timpson', 'Autumn King', 'Thompson Seedless', 'Sugraone', 'Princess']
          },
          {
            id: 'red',
            name: 'Red Grapes',
            varieties: ['Sweet Celebration', 'Allison', 'Timco', 'Passion Fire', 'Red Globe', 'Flame Seedless', 'Ruby Seedless']
          },
          {
            id: 'black',
            name: 'Black Grapes',
            varieties: ['Sweet Sapphire', 'Summer Royal', 'Autumn Royal', 'Black Beauty', 'Midnight Beauty', 'Ribier']
          },
          {
            id: 'specialty',
            name: 'Specialty Grapes',
            varieties: ['Cotton Candy', 'Candy Heart', 'Candy Snaps', 'Candy Dreams', 'Moon Drops', 'Witch Fingers']
          }
        ]
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
        varieties: ['I\'m Pink™ Cara Cara', 'Blood Orange', 'Navel', 'Reserve Heirloom Navels', 'Import (Chile) Valencias', 'Rosy Red Valencia', 'Summer Navels', 'Valencia', 'Cara Cara', 'Seville', 'Hamlin', 'Pineapple Orange', 'Jaffa']
      },
      {
        id: 'mandarin',
        name: 'Mandarin',
        varieties: ['Sumo Citrus', 'Gold Nugget', 'Clementine', 'Lee Nova', 'Murcott/Tango', 'Tangerine', 'Satsuma', 'Honey Murcott', 'W. Murcott']
      },
      {
        id: 'minneola',
        name: 'Minneola',
        varieties: ['Minneola Tangelo', 'Orlando Tangelo', 'Honeybell']
      },
      {
        id: 'lemon',
        name: 'Lemon',
        varieties: ['Lemons (D1)', 'Lemons (D2)', 'Lemons (D3)', 'Lemons (Chile)', 'Eureka', 'Lisbon', 'Meyer', 'Ponderosa', 'Variegated Pink', 'Femminello', 'Villafranca', 'Genoa']
      },
      {
        id: 'lime',
        name: 'Lime',
        varieties: ['Persian Lime', 'Key Lime', 'Kaffir Lime', 'Mexican Lime', 'Rangpur Lime', 'Calamondin', 'Yuzu', 'Finger Lime']
      },
      {
        id: 'grapefruit',
        name: 'Grapefruit',
        varieties: ['Melo Gold', 'Oro Blancos', 'Pummelos', 'Star Ruby', 'Marsh Ruby', 'Ruby Red', 'Pink', 'White', 'Flame', 'Marsh', 'Duncan']
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
  },
  {
    id: 'tropical-fruits',
    name: 'Tropical & Exotic Fruits',
    commodities: [
      {
        id: 'kiwi',
        name: 'Kiwi',
        varieties: ['Hayward', 'Golden Kiwi', 'Red Kiwi', 'Bruno', 'Saanichton', 'Arctic Beauty']
      },
      {
        id: 'kiwi-berry',
        name: 'Kiwi Berry',
        varieties: ['Hardy Kiwi', 'Anna', 'Ken\'s Red', 'Michigan State', 'Ananasnaya', 'Dumbarton Oaks', 'Issai']
      },
      {
        id: 'avocado',
        name: 'Avocado',
        varieties: ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Pinkerton', 'Reed', 'Lamb Hass', 'Gwen']
      },
      {
        id: 'mango',
        name: 'Mango',
        varieties: ['Tommy Atkins', 'Ataulfo', 'Keitt', 'Kent', 'Haden', 'Francis', 'Palmer', 'Valencia Pride']
      },
      {
        id: 'pineapple',
        name: 'Pineapple',
        varieties: ['Gold', 'Sweet Gold', 'MD2', 'Smooth Cayenne', 'Queen', 'Red Spanish', 'Sugarloaf']
      },
      {
        id: 'papaya',
        name: 'Papaya',
        varieties: ['Solo', 'Maradol', 'Red Lady', 'Sunrise', 'Sunset', 'Kapoho', 'Waimanalo', 'Rainbow']
      },
      {
        id: 'banana',
        name: 'Banana',
        varieties: ['Cavendish', 'Lady Finger', 'Red Banana', 'Plantain', 'Apple Banana', 'Burro', 'Manzano', 'Blue Java']
      },
      {
        id: 'coconut',
        name: 'Coconut',
        varieties: ['Young Coconut', 'Mature Coconut', 'Thai Coconut', 'Malayan Dwarf', 'Jamaican Tall', 'Panama Tall']
      },
      {
        id: 'passion-fruit',
        name: 'Passion Fruit',
        varieties: ['Purple Passion Fruit', 'Yellow Passion Fruit', 'Sweet Granadilla', 'Giant Granadilla', 'Red Passion Fruit']
      },
      {
        id: 'dragon-fruit',
        name: 'Dragon Fruit',
        varieties: ['White Flesh', 'Red Flesh', 'Yellow Dragon Fruit', 'Pink Dragon Fruit']
      },
      {
        id: 'dates',
        name: 'Dates',
        varieties: ['Medjool', 'Deglet Noor', 'Zahidi', 'Halawi', 'Barhi', 'Mazafati', 'Ajwa', 'Sukkari']
      }
    ]
  },
  {
    id: 'nuts',
    name: 'Nuts & Tree Nuts',
    commodities: [
      {
        id: 'almond',
        name: 'Almond',
        varieties: ['Nonpareil', 'Carmel', 'Monterey', 'Butte', 'Padre', 'Fritz', 'Price', 'Sonora']
      },
      {
        id: 'walnut',
        name: 'Walnut',
        varieties: ['Chandler', 'Howard', 'Tulare', 'Serr', 'Hartley', 'Payne', 'Franquette', 'English Walnut']
      },
      {
        id: 'pecan',
        name: 'Pecan',
        varieties: ['Desirable', 'Stuart', 'Schley', 'Elliott', 'Cape Fear', 'Sumner', 'Pawnee', 'Cheyenne']
      },
      {
        id: 'pistachio',
        name: 'Pistachio',
        varieties: ['Kerman', 'Peters', 'Lost Hills', 'Golden Hills', 'Randy', 'Red Aleppo']
      },
      {
        id: 'hazelnut',
        name: 'Hazelnut',
        varieties: ['Barcelona', 'Ennis', 'Butler', 'Casina', 'Tonda Gentile', 'Jefferson', 'Theta', 'McDonald']
      },
      {
        id: 'macadamia',
        name: 'Macadamia',
        varieties: ['Beaumont', 'A4', 'A16', 'Hinde', 'Ikaika', 'Kakea', 'Keauhou', 'Mauka']
      },
      {
        id: 'chestnut',
        name: 'Chestnut',
        varieties: ['Chinese Chestnut', 'European Chestnut', 'Japanese Chestnut', 'American Chestnut', 'Hybrid Chestnut']
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