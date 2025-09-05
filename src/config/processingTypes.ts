// Processing/Cut types for different commodities
// These are used in price sheet creation to specify how the crop is processed/cut

export interface ProcessingType {
  id: string
  name: string
  description?: string
  applicablePackaging?: string[] // Which packaging types work with this processing type
}

export interface CommodityProcessing {
  commodityId: string
  processingTypes: ProcessingType[]
}

// Processing types by commodity
export const commodityProcessingTypes: CommodityProcessing[] = [
  // Brassicas & Cole Crops
  {
    commodityId: 'broccoli',
    processingTypes: [
      {
        id: 'crown-cut',
        name: 'Crown Cut',
        description: 'Traditional large heads with stems trimmed',
        applicablePackaging: ['25 lb Box', '20 lb Box', '18 ct Case', '12 ct Case']
      },
      {
        id: 'bunched',
        name: 'Bunched',
        description: 'Smaller heads with longer stems, bunched together',
        applicablePackaging: ['14 ct Case', '18 ct Case', 'Bunch']
      },
      {
        id: 'florets',
        name: 'Florets',
        description: 'Pre-cut florets for convenience',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '12 oz Bag', '5 lb Box']
      },
      {
        id: 'baby-broccoli',
        name: 'Baby Broccoli (Broccolini)',
        description: 'Tender shoots with small heads',
        applicablePackaging: ['Bunch', '8 oz Bag', '4 oz Bag']
      }
    ]
  },
  {
    commodityId: 'cauliflower',
    processingTypes: [
      {
        id: 'whole-head',
        name: 'Whole Head',
        description: 'Complete cauliflower head',
        applicablePackaging: ['12 ct Case', '9 ct Case', '6 ct Case', 'Each']
      },
      {
        id: 'florets',
        name: 'Florets',
        description: 'Pre-cut cauliflower pieces',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '12 oz Bag', '5 lb Box']
      },
      {
        id: 'riced',
        name: 'Riced Cauliflower',
        description: 'Processed into rice-like pieces',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '12 oz Bag', '10 oz Bag']
      }
    ]
  },
  {
    commodityId: 'brussels-sprouts',
    processingTypes: [
      {
        id: 'on-stalk',
        name: 'On Stalk',
        description: 'Whole stalk with sprouts attached',
        applicablePackaging: ['Each', '10 lb Box', '5 lb Box']
      },
      {
        id: 'loose',
        name: 'Loose Sprouts',
        description: 'Individual Brussels sprouts',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '10 oz Bag', '5 lb Box']
      },
      {
        id: 'shredded',
        name: 'Shredded',
        description: 'Pre-shredded for salads and slaws',
        applicablePackaging: ['1 lb Bag', '8 oz Bag', '5 oz Bag']
      }
    ]
  },
  // Leafy Greens
  {
    commodityId: 'lettuce',
    processingTypes: [
      {
        id: 'whole-head',
        name: 'Whole Head',
        description: 'Complete lettuce head',
        applicablePackaging: ['24 ct Case', '12 ct Case', 'Each']
      },
      {
        id: 'chopped',
        name: 'Chopped/Shredded',
        description: 'Pre-cut lettuce for convenience',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '5 oz Bag', '3 oz Bag']
      },
      {
        id: 'baby-mix',
        name: 'Baby Lettuce Mix',
        description: 'Young tender leaves, often mixed varieties',
        applicablePackaging: ['5 oz Bag', '3 oz Bag', '1 lb Bag']
      }
    ]
  },
  {
    commodityId: 'celery',
    processingTypes: [
      {
        id: 'whole-bunch',
        name: 'Whole Bunch',
        description: 'Complete celery bunch with all stalks',
        applicablePackaging: ['30 ct Case', '24 ct Case', 'Each']
      },
      {
        id: 'hearts',
        name: 'Celery Hearts',
        description: 'Inner tender stalks only',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '3 ct Pack']
      },
      {
        id: 'sticks',
        name: 'Celery Sticks',
        description: 'Pre-cut celery sticks',
        applicablePackaging: ['2 lb Bag', '1 lb Bag', '8 oz Bag']
      },
      {
        id: 'diced',
        name: 'Diced Celery',
        description: 'Pre-diced for cooking',
        applicablePackaging: ['1 lb Bag', '8 oz Bag', '5 lb Box']
      }
    ]
  },
  {
    commodityId: 'spinach',
    processingTypes: [
      {
        id: 'baby-spinach',
        name: 'Baby Spinach',
        description: 'Young tender leaves',
        applicablePackaging: ['5 oz Bag', '3 oz Bag', '1 lb Bag', '2.5 lb Bag']
      },
      {
        id: 'mature-bunched',
        name: 'Mature Bunched',
        description: 'Full-size leaves in bunches',
        applicablePackaging: ['Bunch', '24 ct Case']
      },
      {
        id: 'chopped',
        name: 'Chopped Spinach',
        description: 'Pre-chopped for cooking',
        applicablePackaging: ['1 lb Bag', '10 oz Bag', '5 lb Box']
      }
    ]
  }
]

// Helper functions
export const getProcessingTypesForCommodity = (commodityId: string): ProcessingType[] => {
  const commodity = commodityProcessingTypes.find(c => c.commodityId === commodityId)
  return commodity?.processingTypes || []
}

export const getApplicablePackaging = (commodityId: string, processingTypeId: string): string[] => {
  const commodity = commodityProcessingTypes.find(c => c.commodityId === commodityId)
  const processingType = commodity?.processingTypes.find(pt => pt.id === processingTypeId)
  return processingType?.applicablePackaging || []
}

export const hasProcessingTypes = (commodityId: string): boolean => {
  return commodityProcessingTypes.some(c => c.commodityId === commodityId)
}
