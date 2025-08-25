import { ObjectId } from 'mongodb'
import database from '../config/database'
import { 
  FarmKnowledgeCache, 
  User, 
  CropManagement, 
  GrowingRegion, 
  PriceSheetProduct,
  ChatbotConfig 
} from '../models/types'
import { commodityPrimaryPackages } from '../../../src/config/packagingSpecs'

export class KnowledgeCacheService {
  
  /**
   * Build comprehensive farm knowledge cache from all collections
   */
  async buildFarmKnowledgeCache(userId: string): Promise<FarmKnowledgeCache> {
    const db = database.getDb()
    const userObjectId = new ObjectId(userId)
    
    // Get all farm data in parallel
    const [user, crops, regions, priceSheetProducts, chatbotConfig] = await Promise.all([
      db.collection<User>('users').findOne({ id: userId }),
      db.collection<CropManagement>('cropManagement').find({ userId: userObjectId }).toArray(),
      db.collection<GrowingRegion>('growingRegions').find({ userId: userObjectId }).toArray(),
      db.collection<PriceSheetProduct>('priceSheetProducts').find({ userId: userObjectId }).toArray(),
      db.collection<ChatbotConfig>('chatbotConfigs').findOne({ userId: userObjectId })
    ])

    if (!user) {
      throw new Error('User not found')
    }

    // Build farm profile
    const farmProfile: any = {
      name: user.profile?.companyName || 'Our Farm',
      contact: {
        email: user.email,
        ...(user.profile?.phone && { phone: user.profile.phone }),
        ...(user.profile?.website && { website: user.profile.website })
      },
      locations: regions.map(r => r.name),
      story: chatbotConfig?.enabledSections ? this.buildFarmStory(chatbotConfig) : undefined
    }

    // Build products from crop management
    const products: any = this.aggregateProducts(crops, regions, priceSheetProducts)

    // Build business info
    const businessInfo = this.buildBusinessInfo(chatbotConfig)

    // Build bot config
    const botConfig = this.buildBotConfig(chatbotConfig)

    // Create knowledge cache
    const knowledgeCache: Omit<FarmKnowledgeCache, '_id'> = {
      userId: userObjectId,
      farmProfile,
      products,
      businessInfo,
      botConfig,
      lastUpdated: new Date(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return knowledgeCache as FarmKnowledgeCache
  }

  /**
   * Save knowledge cache to database
   */
  async saveKnowledgeCache(knowledgeCache: FarmKnowledgeCache): Promise<void> {
    const db = database.getDb()
    
    await db.collection<FarmKnowledgeCache>('farmKnowledgeCache').findOneAndUpdate(
      { userId: knowledgeCache.userId },
      { 
        $set: {
          ...knowledgeCache,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
  }

  /**
   * Get cached knowledge for a user
   */
  async getKnowledgeCache(userId: string): Promise<FarmKnowledgeCache | null> {
    const db = database.getDb()
    const userObjectId = new ObjectId(userId)
    
    return await db.collection<FarmKnowledgeCache>('farmKnowledgeCache')
      .findOne({ userId: userObjectId })
  }

  /**
   * Rebuild and save knowledge cache for a user
   */
  async rebuildKnowledgeCache(userId: string): Promise<FarmKnowledgeCache> {
    const knowledgeCache = await this.buildFarmKnowledgeCache(userId)
    await this.saveKnowledgeCache(knowledgeCache)
    return knowledgeCache
  }

  /**
   * Get knowledge cache (build if doesn't exist, but don't auto-refresh)
   */
  async getFreshKnowledgeCache(userId: string): Promise<FarmKnowledgeCache> {
    const cache = await this.getKnowledgeCache(userId)
    
    if (!cache) {
      // Only build cache if it doesn't exist at all
      return await this.rebuildKnowledgeCache(userId)
    }
    
    return cache
  }

  /**
   * Private helper: Aggregate products from crop management
   */
  private aggregateProducts(
    crops: CropManagement[], 
    regions: GrowingRegion[], 
    priceSheetProducts: PriceSheetProduct[]
  ) {
    const regionMap = new Map(regions.map(r => [r._id?.toString(), r.name]))
    
    return crops.map(crop => ({
      commodity: crop.commodity,
      varieties: crop.variations.map(variation => {
        // Find all price sheet products for this variety
        const varietyPriceSheetProducts = priceSheetProducts.filter(p => 
          p.commodity === crop.commodity && 
          p.variety === variation.variety
        )
        
        // Get primary package configuration for this commodity
        const primaryPackageConfig = commodityPrimaryPackages[crop.commodity]
        
        // Build pricing and packaging info
        let currentPrice = undefined
        let packaging = undefined
        let isCurrentlyAvailable = varietyPriceSheetProducts.length > 0
        
        if (isCurrentlyAvailable) {
          // Find primary package price (industry standard)
          const primaryPackageProduct = primaryPackageConfig 
            ? varietyPriceSheetProducts.find(p => p.packageType === primaryPackageConfig.packageName)
            : null
          
          if (primaryPackageProduct && primaryPackageConfig) {
            // Use primary package with per-unit calculation for weight-based
            if (primaryPackageConfig.type === 'weight' && primaryPackageConfig.standardUnit) {
              const pricePerUnit = (primaryPackageProduct.price / primaryPackageConfig.standardUnit).toFixed(2)
              currentPrice = `$${primaryPackageProduct.price} per ${primaryPackageConfig.packageName} ($${pricePerUnit}/${primaryPackageConfig.unitType})`
            } else {
              currentPrice = `$${primaryPackageProduct.price} per ${primaryPackageConfig.packageName}`
            }
          } else {
            // Fallback to first available price sheet product
            const firstProduct = varietyPriceSheetProducts[0]
            currentPrice = `$${firstProduct.price} per ${firstProduct.packageType}`
          }
          
          // Show alternative package count
          const alternativeCount = varietyPriceSheetProducts.length - 1
          if (alternativeCount > 0) {
            packaging = `${alternativeCount} other pack type${alternativeCount > 1 ? 's' : ''} available`
          }
        } else {
          // Fallback to crop management target pricing
          if (variation.targetPricing && (variation.targetPricing.minPrice > 0 || variation.targetPricing.maxPrice > 0)) {
            const { minPrice, maxPrice, unit } = variation.targetPricing
            if (minPrice > 0 && maxPrice > 0 && minPrice !== maxPrice) {
              currentPrice = `$${minPrice}-$${maxPrice}/${unit} (contact for current pricing)`
            } else if (maxPrice > 0) {
              currentPrice = `$${maxPrice}/${unit} (contact for current pricing)`
            } else if (minPrice > 0) {
              currentPrice = `$${minPrice}/${unit} (contact for current pricing)`
            }
          }
        }

        // Map region IDs to names - growingRegions is an array of objects with regionId
        const regionNames = variation.growingRegions
          ?.map(regionObj => regionMap.get(regionObj.regionId?.toString()))
          .filter((name): name is string => Boolean(name)) || []

        // Build seasonality from growing regions
        let seasonality = 'Year-round'
        if (variation.growingRegions && variation.growingRegions.length > 0) {
          const seasons = variation.growingRegions.map(regionObj => {
            if (regionObj.seasonality?.isYearRound) {
              return 'Year-round'
            } else if (regionObj.seasonality?.startMonth && regionObj.seasonality?.endMonth) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const start = months[regionObj.seasonality.startMonth - 1]
              const end = months[regionObj.seasonality.endMonth - 1]
              return `${start}-${end}`
            }
            return 'Year-round'
          })
          seasonality = seasons.join(', ')
        }

        return {
          name: variation.variety || crop.commodity,
          isOrganic: variation.isOrganic || false,
          regions: regionNames,
          seasonality,
          currentPrice,
          packaging,
          isCurrentlyAvailable
        }
      })
    }))
  }

  /**
   * Private helper: Build farm story from enabled sections
   */
  private buildFarmStory(chatbotConfig: ChatbotConfig) {
    const story: any = {}
    const { extendedKnowledge, enabledSections } = chatbotConfig
    
    if (enabledSections.farmStory.history && extendedKnowledge.farmStory.history) {
      story.history = extendedKnowledge.farmStory.history
    }
    if (enabledSections.farmStory.farmingPractices && extendedKnowledge.farmStory.farmingPractices) {
      story.farmingPractices = extendedKnowledge.farmStory.farmingPractices
    }
    if (enabledSections.farmStory.sustainability && extendedKnowledge.farmStory.sustainability) {
      story.sustainability = extendedKnowledge.farmStory.sustainability
    }
    if (enabledSections.farmStory.familyStory && extendedKnowledge.farmStory.familyStory) {
      story.familyStory = extendedKnowledge.farmStory.familyStory
    }
    
    return Object.keys(story).length > 0 ? story : undefined
  }

  /**
   * Private helper: Build business info from enabled sections
   */
  private buildBusinessInfo(chatbotConfig: ChatbotConfig | null) {
    const businessInfo: any = {
      certifications: [] // TODO: Get from certifications collection
    }

    if (!chatbotConfig) return businessInfo

    const { extendedKnowledge, enabledSections } = chatbotConfig

    // Services
    const services: any = {}
    if (enabledSections.businessOperations.farmersMarkets && extendedKnowledge.businessOperations.farmersMarkets) {
      services.farmersMarkets = extendedKnowledge.businessOperations.farmersMarkets
    }
    if (enabledSections.businessOperations.farmTours && extendedKnowledge.businessOperations.farmTours) {
      services.farmTours = extendedKnowledge.businessOperations.farmTours
    }
    if (enabledSections.businessOperations.csaPrograms && extendedKnowledge.businessOperations.csaPrograms) {
      services.csaPrograms = extendedKnowledge.businessOperations.csaPrograms
    }
    if (enabledSections.businessOperations.pickYourOwn && extendedKnowledge.businessOperations.pickYourOwn) {
      services.pickYourOwn = extendedKnowledge.businessOperations.pickYourOwn
    }
    if (Object.keys(services).length > 0) {
      businessInfo.services = services
    }

    // Terms
    const terms: any = {}
    if (enabledSections.businessTerms.paymentTerms && extendedKnowledge.businessTerms.paymentTerms) {
      terms.paymentTerms = extendedKnowledge.businessTerms.paymentTerms
    }
    if (enabledSections.businessTerms.minimumOrders && extendedKnowledge.businessTerms.minimumOrders) {
      terms.minimumOrders = extendedKnowledge.businessTerms.minimumOrders
    }
    if (enabledSections.businessTerms.deliveryOptions && extendedKnowledge.businessTerms.deliveryOptions) {
      terms.deliveryOptions = extendedKnowledge.businessTerms.deliveryOptions
    }
    if (enabledSections.businessTerms.pricingPolicy && extendedKnowledge.businessTerms.pricingPolicy) {
      terms.pricingPolicy = extendedKnowledge.businessTerms.pricingPolicy
    }
    if (Object.keys(terms).length > 0) {
      businessInfo.terms = terms
    }

    // Product Info
    const productInfo: any = {}
    if (enabledSections.productInfo.seasonalAvailability && extendedKnowledge.productInfo.seasonalAvailability) {
      productInfo.seasonalAvailability = extendedKnowledge.productInfo.seasonalAvailability
    }
    if (enabledSections.productInfo.productSamples && extendedKnowledge.productInfo.productSamples) {
      productInfo.productSamples = extendedKnowledge.productInfo.productSamples
    }
    if (enabledSections.productInfo.specialtyItems && extendedKnowledge.productInfo.specialtyItems) {
      productInfo.specialtyItems = extendedKnowledge.productInfo.specialtyItems
    }
    if (enabledSections.productInfo.storageHandling && extendedKnowledge.productInfo.storageHandling) {
      productInfo.storageHandling = extendedKnowledge.productInfo.storageHandling
    }
    if (Object.keys(productInfo).length > 0) {
      businessInfo.productInfo = productInfo
    }

    return businessInfo
  }

  /**
   * Private helper: Build bot config
   */
  private buildBotConfig(chatbotConfig: ChatbotConfig | null) {
    if (!chatbotConfig) {
      // Default bot config
      return {
        botName: 'Farm Assistant',
        personality: 'friendly' as const,
        primaryGoal: 'product_info' as const,
        welcomeMessage: 'Hi! How can I help you learn about our farm and products?',
        fallbackMessage: "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
        outOfSeasonMessage: 'That product is currently out of season. It will be available again soon.',
        widgetColor: '#10b981'
      }
    }

    return {
      botName: chatbotConfig.botName,
      personality: chatbotConfig.personality,
      primaryGoal: chatbotConfig.primaryGoal,
      welcomeMessage: chatbotConfig.welcomeMessage,
      fallbackMessage: chatbotConfig.fallbackMessage,
      outOfSeasonMessage: chatbotConfig.outOfSeasonMessage,
      widgetColor: chatbotConfig.widgetColor
    }
  }
}

export default new KnowledgeCacheService()
