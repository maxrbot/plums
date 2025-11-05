'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { cropsApi, shippingPointsApi, packagingApi, priceSheetsApi } from '../../../../lib/api'
import PriceSheetPreviewModal, { PriceSheetProduct } from '../../../../components/modals/PriceSheetPreviewModal'
import { useUser } from '../../../../contexts/UserContext'
import { 
  getLegacyCommodityOptions,
  getLegacyCommodityPackaging, 
  getDefaultProcessingType, 
  getDefaultPackageType, 
  getDefaultSize, 
  getDefaultFruitCount, 
  getDefaultGrade,
  getCommodityConfig,
  getItemWeight,
  allCommodities,
  type LegacyCategoryOption,
  type PackageType 
} from '../../../../config'
import { getMarketDataSample } from '../../../../config/market-data-samples'

// Types from the original complex version
interface ProcessedProduct {
  id: string
  name: string
  region: string
  commodity: string
  variety?: string
  subtype?: string
  isOrganic: boolean
  seasonality: string
  cropId: string
  variationId: string
}

export default function CleanPriceSheetPage() {
  const { user } = useUser()
  const [showInsightsPanel, setShowInsightsPanel] = useState(false)
  const [selectedInsightProductId, setSelectedInsightProductId] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  
  // Preview and Save state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [priceSheetTitle, setPriceSheetTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  
  // Real data state (migrated from complex version)
  const [products, setProducts] = useState<ProcessedProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProcessedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [inSeasonOnly, setInSeasonOnly] = useState(false)
  const [upcomingSeasonOnly, setUpcomingSeasonOnly] = useState(false)
  
  // Expanded options state
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({})
  const [additionalPackStyles, setAdditionalPackStyles] = useState<Record<string, number>>({})
  
  // Expanded options data state
  const [productStickered, setProductStickered] = useState<Record<string, boolean>>({})
  const [productSpecialNotes, setProductSpecialNotes] = useState<Record<string, string>>({})
  const [productAvailability, setProductAvailability] = useState<Record<string, string>>({})
  const [productPriceOverride, setProductPriceOverride] = useState<Record<string, boolean>>({})
  const [productPriceOverrideComment, setProductPriceOverrideComment] = useState<Record<string, string>>({})
  const [productAddSpecialNote, setProductAddSpecialNote] = useState<Record<string, boolean>>({})
  
  // Product packaging state management
  const [productPackaging, setProductPackaging] = useState<Record<string, {
    processingType?: string
    packageType?: string
    size?: string
    fruitCount?: string
    grade?: string
  }>>({})

  // State for product prices
  const [productPrices, setProductPrices] = useState<Record<string, string>>({})

  // Helper function to get price breakdown for display
  const getPriceBreakdown = (productId: string, currentPrice?: string): { breakdown: string; isCustom: boolean } => {
    const product = products.find(p => p.id === productId)
    if (!product) return { breakdown: '', isCustom: false }
    
    const marketData = getMarketDataSample(product.commodity, product.variety || '')
    if (!marketData) return { breakdown: '', isCustom: false }
    
    const packaging = productPackaging[productId]
    if (!packaging?.size) return { breakdown: '', isCustom: false }
    
    const pricePerLb = marketData.basePrice
    const userPrice = currentPrice ? parseFloat(currentPrice) : 0
    
    // Determine if user has customized the price
    const calculatedPackagePrice = calculateTotalPackagePrice(productId)
    const isCustom = userPrice > 0 && Math.abs(userPrice - parseFloat(calculatedPackagePrice.totalPrice)) > 0.01
    
    // Get package details for breakdown
    const config = getLegacyCommodityPackaging(product.commodity)
    if (!config) return { breakdown: '', isCustom: false }
    
    // Method 1: Direct weight-based package (like 25lb, 40lb)
    const weightMatch = packaging.size.match(/^(\d+(?:\.\d+)?)lb$/)
    if (weightMatch) {
      const packageWeight = parseFloat(weightMatch[1])
      if (isCustom) {
        const customPricePerLb = userPrice / packageWeight
        return {
          breakdown: `$${customPricePerLb.toFixed(2)}/lb`,
          isCustom: true
        }
      } else {
        return {
          breakdown: `$${pricePerLb.toFixed(2)}/lb`,
          isCustom: false
        }
      }
    }
    
    // Method 2: Count-based package (like 24ct, 30ct)
    const countMatch = packaging.size.match(/^(\d+)\s*(?:ct|count)$/i)
    if (countMatch && product.variety) {
      const itemCount = parseFloat(countMatch[1])
      const itemWeight = getItemWeight(product.commodity, product.variety.toLowerCase())
      
      if (itemWeight > 0) {
        const costPerItem = pricePerLb * itemWeight
        if (isCustom) {
          const customCostPerItem = userPrice / itemCount
          return {
            breakdown: `$${customCostPerItem.toFixed(2)}/item`,
            isCustom: true
          }
        } else {
          return {
            breakdown: `$${costPerItem.toFixed(2)}/item`,
            isCustom: false
          }
        }
      }
    }
    
    return { breakdown: '', isCustom: false }
  }

  // Helper function to calculate total package price ($/lb × package weight)
  const calculateTotalPackagePrice = (productId: string): { totalPrice: string; calculation: string } => {
    const product = products.find(p => p.id === productId)
    if (!product) return { totalPrice: '', calculation: '' }
    
    const marketData = getMarketDataSample(product.commodity, product.variety || '')
    if (!marketData) return { totalPrice: '', calculation: '' }
    
    const packaging = productPackaging[productId]
    if (!packaging?.size) {
      // No packaging selected yet, return base price
      return { totalPrice: marketData.basePrice.toString(), calculation: `$${marketData.basePrice}/lb` }
    }
    
    // Base price per lb from market data (no adjustments)
    const pricePerLb = marketData.basePrice
    
    // Get package weight from config
    const config = getLegacyCommodityPackaging(product.commodity)
    if (!config) {
      return { totalPrice: pricePerLb.toString(), calculation: `$${pricePerLb}/lb` }
    }
    
    // Find the package weight
    let packageWeight = 1 // Default to 1lb if we can't determine weight
    
    // Method 1: Direct weight-based package (like 25lb, 40lb)
    const weightMatch = packaging.size.match(/^(\d+(?:\.\d+)?)lb$/)
    if (weightMatch) {
      packageWeight = parseFloat(weightMatch[1])
    } else {
      // Method 2: Count-based package (like 24ct, 30ct, 24 Count, 30 Count)
      const countMatch = packaging.size.match(/^(\d+)\s*(?:ct|count)$/i)
      if (countMatch && product.variety) {
        const itemCount = parseFloat(countMatch[1])
        
        // Get item weight from variety config using helper function
        const itemWeight = getItemWeight(product.commodity, product.variety.toLowerCase())
        if (itemWeight > 0) {
          packageWeight = itemCount * itemWeight
        } else {
          console.log(`⚠️ No item weight found for variety: ${product.variety}`)
        }
      } else {
        // Method 3: Get weight from package configuration
        let packageType: any
        if (config.hasProcessing && packaging.processingType) {
          const processingType = config.processing?.types?.find(pt => pt.id === packaging.processingType)
          packageType = processingType?.packageTypes?.find(pt => pt.id === packaging.packageType)
        } else if (config.packaging?.types) {
          packageType = config.packaging.types.find(pt => pt.id === packaging.packageType)
        }
        
        if (packageType?.sizes) {
          const sizeConfig = packageType.sizes.find((s: any) => s.id === packaging.size)
          if (sizeConfig?.weight) {
            const configWeightMatch = sizeConfig.weight.match(/^(\d+(?:\.\d+)?)lb$/)
            if (configWeightMatch) {
              packageWeight = parseFloat(configWeightMatch[1])
            }
          }
        }
      }
    }
    
    // Calculate total: base price per lb × package weight
    const totalPrice = pricePerLb * packageWeight
    
    return {
      totalPrice: totalPrice.toFixed(2),
      calculation: `$${pricePerLb.toFixed(2)}/lb × ${packageWeight}lb`
    }
  }

  // Helper function to calculate price based on packaging and market data
  const calculatePrice = (productId: string): string => {
    // Use the same logic as calculateTotalPackagePrice but return just the price string
    const packagePrice = calculateTotalPackagePrice(productId)
    return packagePrice.totalPrice
  }

  // Helper function to create clean product names
  const getCleanProductName = (product: ProcessedProduct): string => {
    const parts = []
    
    // Add "Organic" prefix if organic
    if (product.isOrganic) {
      parts.push('Organic')
    }
    
    // Add variety if it exists, otherwise use subtype, otherwise use commodity
    if (product.variety) {
      parts.push(product.variety)
    } else if (product.subtype) {
      parts.push(product.subtype)
    } else {
      parts.push(product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1))
    }
    
    return parts.join(' ')
  }

  // Helper function to calculate total item count including additional pack styles
  const getTotalItemCount = (): number => {
    let totalCount = selectedProductIds.size
    
    // Add additional pack styles count
    Object.values(additionalPackStyles).forEach(count => {
      totalCount += count
    })
    
    return totalCount
  }

  // Helper function to handle price changes with override logic
  const handlePriceChange = (productKey: string, value: string) => {
    setProductPrices(prev => ({ ...prev, [productKey]: value }))
    
    // If price is cleared/empty, automatically check "Override price with comment"
    if (!value || value.trim() === '' || parseFloat(value) <= 0) {
      setProductPriceOverride(prev => ({ ...prev, [productKey]: true }))
    } else {
      // If price has a value, uncheck override (user is providing a price)
      setProductPriceOverride(prev => ({ ...prev, [productKey]: false }))
    }
  }

  // Helper function to check if a product is ready for preview
  const isProductReadyForPreview = (productKey: string): boolean => {
    const hasPrice = productPrices[productKey] && productPrices[productKey].trim() !== '' && parseFloat(productPrices[productKey]) > 0
    const hasOverride = productPriceOverride[productKey]
    const hasOverrideComment = productPriceOverrideComment[productKey]?.trim()
    
    // Product is ready if:
    // 1. Override is checked AND has a comment, OR
    // 2. Override is NOT checked AND has a valid price
    if (hasOverride) {
      return !!hasOverrideComment // If override is selected, MUST have comment
    } else {
      return !!hasPrice // If no override, MUST have valid price
    }
  }

  // Helper function to get all products ready for preview
  const getProductsReadyForPreview = (): string[] => {
    const readyProducts: string[] = []
    
    // Check main products
    Array.from(selectedProductIds).forEach(productId => {
      if (isProductReadyForPreview(productId)) {
        readyProducts.push(productId)
      }
      
      // Check additional pack styles for this product
      const additionalCount = additionalPackStyles[productId] || 0
      for (let i = 0; i < additionalCount; i++) {
        const packKey = `${productId}-additional-${i}`
        if (isProductReadyForPreview(packKey)) {
          readyProducts.push(packKey)
        }
      }
    })
    
    return readyProducts
  }

  // Helper function to group products by commodity
  const getProductsByCommodity = () => {
    const grouped: Record<string, ProcessedProduct[]> = {}
    
    filteredProducts.forEach(product => {
      const commodityName = product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)
      if (!grouped[commodityName]) {
        grouped[commodityName] = []
      }
      grouped[commodityName].push(product)
    })
    
    return grouped
  }

  // Helper function to format seasonality (from complex version)
  const formatSeasonality = (availability: any): string => {
    if (!availability) return 'Year-round'
    
    if (typeof availability === 'string') {
      return availability
    }
    
    if (availability.startMonth && availability.endMonth) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const startMonth = monthNames[availability.startMonth - 1]
      const endMonth = monthNames[availability.endMonth - 1]
      return `${startMonth}-${endMonth}`
    }
    
    return 'Year-round'
  }

  // Set default title when user data loads
  useEffect(() => {
    if (user?.profile?.companyName && !priceSheetTitle) {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      setPriceSheetTitle(`${user.profile.companyName} Price Sheet - ${today}`)
    }
  }, [user?.profile?.companyName, priceSheetTitle])

  // Load user's crops and convert to products (migrated from complex version)
  const loadUserData = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Load crops, shipping points in parallel (like original)
      const [cropsRes, shippingPointsRes] = await Promise.all([
        cropsApi.getAll(),
        shippingPointsApi.getAll()
      ])
      
      const crops = cropsRes.crops || []
      const userShippingPoints = shippingPointsRes.regions || []

      // Process crops into products (proper version from complex code)
      const processedProducts: ProcessedProduct[] = []
      
      crops.forEach((crop: any) => {
        if (crop.variations && crop.variations.length > 0) {
          crop.variations.forEach((variation: any) => {
            // Handle both new shippingPoints and legacy growingRegions (from original)
            const regionConfigs = variation.shippingPoints || variation.growingRegions || []
            
            regionConfigs.forEach((regionConfig: any) => {
              const shippingPoint = userShippingPoints.find((sp: any) => 
                sp.id === regionConfig.regionId || 
                sp.id === regionConfig.pointId || 
                sp.name === regionConfig.regionName || 
                sp.name === regionConfig.pointName
              )
              
              if (shippingPoint) {
                const productName = [
                  variation.isOrganic ? 'Organic' : 'Conventional',
                  crop.commodity,
                  variation.subtype,
                  variation.variety
                ].filter(Boolean).join(' ')

                // Handle both availability and seasonality (from original)
                const availability = regionConfig.availability || regionConfig.seasonality
                const seasonality = availability ? formatSeasonality(availability) : 'Year-round'

                // Ensure all IDs are defined (from original)
                const cropId = crop.id || crop._id || `crop_${Date.now()}_${Math.random()}`
                const variationId = variation.id || variation._id || `var_${Date.now()}_${Math.random()}`
                const regionId = shippingPoint.id || regionConfig.regionId || regionConfig.pointId || `region_${Date.now()}_${Math.random()}`
                
                processedProducts.push({
                  id: `${cropId}-${variationId}-${regionId}`,
                  name: productName,
                  region: shippingPoint.name,
                  commodity: crop.commodity?.toLowerCase() || 'unknown',
                  variety: variation.variety,
                  subtype: variation.subtype,
                  isOrganic: variation.isOrganic,
                  seasonality,
                  cropId: cropId,
                  variationId: variationId
                })
              }
            })
          })
        }
      })

      setProducts(processedProducts)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  // Filter products based on category and season
  useEffect(() => {
    if (products.length === 0) return

    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      const commodityOptions = getLegacyCommodityOptions()
      const selectedCategoryData = commodityOptions.find(cat => cat.id === selectedCategory)
      if (selectedCategoryData) {
        const categoryCommmodityIds = selectedCategoryData.commodities.map(c => c.id)
        filtered = filtered.filter(product => 
          categoryCommmodityIds.includes(product.commodity.toLowerCase())
        )
      }
    }

    // Filter by season (OR logic when both are selected)
    if (inSeasonOnly || upcomingSeasonOnly) {
      filtered = filtered.filter(product => {
        const currentMonth = new Date().getMonth() + 1 // 1-12
        const seasonality = product.seasonality || 'Year Round'
        
        if (seasonality === 'Year-round' || seasonality === 'Year Round') {
          return inSeasonOnly || upcomingSeasonOnly // Include year-round in both filters
        }
        
        // Parse seasonality like "Apr-Nov" or "Dec-Mar"
        const seasonMatch = seasonality.match(/(\w{3})-(\w{3})/)
        if (!seasonMatch) return true
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const startMonth = monthNames.indexOf(seasonMatch[1]) + 1
        const endMonth = monthNames.indexOf(seasonMatch[2]) + 1
        
        if (startMonth === -1 || endMonth === -1) return true
        
        let isInSeason = false
        let isUpcoming = false
        
        if (startMonth <= endMonth) {
          // Normal season (e.g., Apr-Nov)
          isInSeason = currentMonth >= startMonth && currentMonth <= endMonth
          isUpcoming = currentMonth === startMonth - 1 || (startMonth === 1 && currentMonth === 12)
        } else {
          // Cross-year season (e.g., Dec-Mar)
          isInSeason = currentMonth >= startMonth || currentMonth <= endMonth
          isUpcoming = currentMonth === startMonth - 1 || currentMonth === endMonth + 1
        }
        
        return (inSeasonOnly && isInSeason) || (upcomingSeasonOnly && isUpcoming)
      })
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, inSeasonOnly, upcomingSeasonOnly])

  // Helper function to get available categories
  const getAvailableCategories = () => {
    const userCommodities = new Set(products.map(p => p.commodity.toLowerCase()))
    const commodityOptions = getLegacyCommodityOptions()
    return commodityOptions.filter(category => 
      category.commodities.some(commodity => userCommodities.has(commodity.id))
    )
  }

  // Select/Deselect all functions
  const selectAllProducts = () => {
    const allProductIds = new Set(filteredProducts.map(p => p.id))
    setSelectedProductIds(allProductIds)
    
    // Initialize packaging for all newly selected products
    filteredProducts.forEach(product => {
      if (!selectedProductIds.has(product.id)) {
        console.log(`🎯 Bulk selecting product:`, { id: product.id, commodity: product.commodity, name: product.name })
        initializeProductPackaging(product.id, product.commodity)
      }
    })
  }

  const deselectAllProducts = () => {
    setSelectedProductIds(new Set())
    // Clean up all packaging and price data when deselecting all
    setProductPackaging({})
    setProductPrices({})
  }

  // Product selection functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProductIds)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
      // Clean up packaging and price data when deselecting
      setProductPackaging(prev => {
        const { [productId]: _, ...rest } = prev
        return rest
      })
      setProductPrices(prev => {
        const { [productId]: _, ...rest } = prev
        return rest
      })
    } else {
      newSelected.add(productId)
      // Initialize packaging when selecting
      const product = products.find(p => p.id === productId)
      if (product) {
        console.log(`🎯 Selecting product:`, { id: productId, commodity: product.commodity, name: product.name })
        initializeProductPackaging(productId, product.commodity)
      } else {
        console.log(`❌ Product not found for ID: ${productId}`)
      }
    }
    setSelectedProductIds(newSelected)
  }

  const toggleInsightsPanel = (productId: string) => {
    if (showInsightsPanel && selectedInsightProductId === productId) {
      // Close if same product
      setShowInsightsPanel(false)
      setSelectedInsightProductId(null)
    } else {
      // Open with new product
      setShowInsightsPanel(true)
      setSelectedInsightProductId(productId)
    }
  }

  const addPackStyle = (productId: string) => {
    setAdditionalPackStyles(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removePackStyle = (productId: string) => {
    setAdditionalPackStyles(prev => {
      const current = prev[productId] || 0
      if (current <= 1) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [productId]: current - 1
      }
    })
  }

  const initializeProductPackaging = (productId: string, commodity: string) => {
    const config = getLegacyCommodityPackaging(commodity)
    if (!config) {
      console.log(`❌ No config found for commodity: ${commodity}`)
      return
    }

    console.log(`🔧 Initializing packaging for ${commodity}:`, {
      hasProcessing: config.hasProcessing,
      processingTypes: config.processing?.types?.length || 0,
      packagingTypes: config.packaging?.types?.length || 0,
      defaultType: config.processing?.defaultType
    })

    const defaults: any = {}
    
    if (config.hasProcessing && config.processing?.types && config.processing.types.length > 0) {
      // Use the configured default processing type
      const defaultProcessingType = config.processing.types.find(pt => pt.isDefault) || 
                                   config.processing.types.find(pt => pt.id === config.processing.defaultType) ||
                                   config.processing.types[0]
      
      if (defaultProcessingType) {
        defaults.processingType = defaultProcessingType.id
        console.log(`  ✅ Default processing type: ${defaultProcessingType.name} (${defaultProcessingType.id})`)
        
        // Find the default package type within this processing type
        const defaultPackageType = defaultProcessingType.packageTypes.find(pt => pt.isDefault) || defaultProcessingType.packageTypes[0]
        if (defaultPackageType) {
          defaults.packageType = defaultPackageType.id
          console.log(`  ✅ Default package type: ${defaultPackageType.name} (${defaultPackageType.id})`)
          
          // Find the default size within this package type
          const defaultSize = defaultPackageType.sizes.find(s => s.isDefault) || defaultPackageType.sizes[0]
          if (defaultSize) {
            defaults.size = defaultSize.id
            console.log(`  ✅ Default size: ${defaultSize.name} (${defaultSize.id})`)
          } else {
            console.log(`  ❌ No sizes found for package type: ${defaultPackageType.name}`)
          }
          
          // Find the default fruit count if available
          if (defaultPackageType.fruitCounts && defaultPackageType.fruitCounts.length > 0) {
            const defaultFruitCount = defaultPackageType.fruitCounts.find(fc => fc.isDefault) || defaultPackageType.fruitCounts[0]
            if (defaultFruitCount) {
              defaults.fruitCount = defaultFruitCount.id
              console.log(`  ✅ Default fruit count: ${defaultFruitCount.name} (${defaultFruitCount.id})`)
            }
          }
        } else {
          console.log(`  ❌ No package types found for processing type: ${defaultProcessingType.name}`)
        }
      } else {
        console.log(`  ❌ No default processing type found`)
      }
    } else if (config.packaging?.types && config.packaging.types.length > 0) {
      // Direct packaging (no processing) - use packaging defaults
      console.log(`  📦 Using direct packaging (no processing)`)
      const defaultPackageType = config.packaging.types.find(pt => pt.isDefault) || config.packaging.types[0]
      if (defaultPackageType) {
        defaults.packageType = defaultPackageType.id
        console.log(`  ✅ Default package type: ${defaultPackageType.name} (${defaultPackageType.id})`)
        
        // Find the default size
        const defaultSize = defaultPackageType.sizes.find(s => s.isDefault) || defaultPackageType.sizes[0]
        if (defaultSize) {
          defaults.size = defaultSize.id
          console.log(`  ✅ Default size: ${defaultSize.name} (${defaultSize.id})`)
        } else {
          console.log(`  ❌ No sizes found for package type: ${defaultPackageType.name}`)
        }
        
        // Find the default fruit count if available
        if (defaultPackageType.fruitCounts && defaultPackageType.fruitCounts.length > 0) {
          const defaultFruitCount = defaultPackageType.fruitCounts.find(fc => fc.isDefault) || defaultPackageType.fruitCounts[0]
          if (defaultFruitCount) {
            defaults.fruitCount = defaultFruitCount.id
            console.log(`  ✅ Default fruit count: ${defaultFruitCount.name} (${defaultFruitCount.id})`)
          }
        }
      } else {
        console.log(`  ❌ No package types found in direct packaging`)
      }
    }
    
    // Set the default grade
    if (config.quality?.defaultGrade) {
      defaults.grade = config.quality.defaultGrade
    } else if (config.quality?.grades && config.quality.grades.length > 0) {
      defaults.grade = config.quality.grades[0]
    }

    console.log(`🎯 Initialized packaging for ${commodity}:`, defaults)

    setProductPackaging(prev => ({
      ...prev,
      [productId]: defaults
    }))

    // Calculate initial price using the defaults we just set
    const product = products.find(p => p.id === productId)
    const marketData = getMarketDataSample(commodity, product?.variety || '')
    
    if (marketData && defaults.size) {
      const pricePerLb = marketData.basePrice
      let packageWeight = 1
      
      // Get package weight from the size we just set
      const weightMatch = defaults.size.match(/^(\d+(?:\.\d+)?)lb$/)
      if (weightMatch) {
        packageWeight = parseFloat(weightMatch[1])
      } else {
        // Check for count-based package (like 24ct, 30ct, 24 Count, 30 Count)
        const countMatch = defaults.size.match(/^(\d+)\s*(?:ct|count)$/i)
        if (countMatch && product?.variety) {
          const itemCount = parseFloat(countMatch[1])
          
          // Get item weight from variety config using helper function
          const itemWeight = getItemWeight(product.commodity, product.variety.toLowerCase())
          if (itemWeight > 0) {
            packageWeight = itemCount * itemWeight
            console.log(`📊 Initial count-based calculation: ${itemCount} items × ${itemWeight}lb = ${packageWeight}lb`)
          }
        } else if (config) {
          // Get weight from config
          let packageType: any
          if (config.hasProcessing && defaults.processingType) {
            const processingType = config.processing?.types?.find(pt => pt.id === defaults.processingType)
            packageType = processingType?.packageTypes?.find(pt => pt.id === defaults.packageType)
          } else if (config.packaging?.types) {
            packageType = config.packaging.types.find(pt => pt.id === defaults.packageType)
          }
          
          if (packageType?.sizes) {
            const sizeConfig = packageType.sizes.find((s: any) => s.id === defaults.size)
            if (sizeConfig?.weight) {
              const configWeightMatch = sizeConfig.weight.match(/^(\d+(?:\.\d+)?)lb$/)
              if (configWeightMatch) {
                packageWeight = parseFloat(configWeightMatch[1])
              }
            }
          }
        }
      }
      
      const totalPrice = pricePerLb * packageWeight
      setProductPrices(prev => ({
        ...prev,
        [productId]: totalPrice.toFixed(2)
      }))
      console.log(`💰 Calculated initial price for ${productId}: $${totalPrice.toFixed(2)} ($${pricePerLb.toFixed(2)}/lb × ${packageWeight}lb)`)
    }
  }

  const updateProductPackaging = (productId: string, field: string, value: string) => {
    setProductPackaging(prev => {
      const current = prev[productId] || {}
      const updated = { ...current, [field]: value }
      
      // When processing type changes, reset dependent fields
      if (field === 'processingType') {
        const product = products.find(p => p.id === productId)
        if (product) {
          const config = getLegacyCommodityPackaging(product.commodity)
          if (config?.processing?.types) {
            const selectedProcessingType = config.processing.types.find(pt => pt.id === value)
            if (selectedProcessingType) {
              // Reset to default package type for this processing type
              const defaultPackageType = selectedProcessingType.packageTypes.find(pt => pt.isDefault) || selectedProcessingType.packageTypes[0]
              if (defaultPackageType) {
                updated.packageType = defaultPackageType.id
                // Reset to default size for this package type
                const defaultSize = defaultPackageType.sizes.find(s => s.isDefault) || defaultPackageType.sizes[0]
                if (defaultSize) {
                  updated.size = defaultSize.id
                }
                // Reset fruit count if available
                if (defaultPackageType.fruitCounts && defaultPackageType.fruitCounts.length > 0) {
                  const defaultFruitCount = defaultPackageType.fruitCounts.find(fc => fc.isDefault) || defaultPackageType.fruitCounts[0]
                  if (defaultFruitCount) {
                    updated.fruitCount = defaultFruitCount.id
                  }
                } else {
                  delete updated.fruitCount
                }
              }
            }
          }
        }
      }
      
      // When package type changes, reset size and fruit count
      if (field === 'packageType') {
        const product = products.find(p => p.id === productId)
        if (product) {
          const config = getLegacyCommodityPackaging(product.commodity)
          if (config) {
            let packageType: PackageType | undefined
            
            if (config.hasProcessing && current.processingType) {
              const processingType = config.processing?.types?.find(pt => pt.id === current.processingType)
              packageType = processingType?.packageTypes?.find(pt => pt.id === value)
            } else if (config.packaging?.types) {
              packageType = config.packaging.types.find(pt => pt.id === value)
            }
            
            if (packageType) {
              // Reset to default size for this package type
              const defaultSize = packageType.sizes.find(s => s.isDefault) || packageType.sizes[0]
              if (defaultSize) {
                updated.size = defaultSize.id
              }
              // Reset fruit count if available
              if (packageType.fruitCounts && packageType.fruitCounts.length > 0) {
                const defaultFruitCount = packageType.fruitCounts.find(fc => fc.isDefault) || packageType.fruitCounts[0]
                if (defaultFruitCount) {
                  updated.fruitCount = defaultFruitCount.id
                }
              } else {
                delete updated.fruitCount
              }
            }
          }
        }
      }
      
      console.log(`🔄 Updated packaging for ${productId}.${field} = ${value}:`, updated)
      
      // Recalculate price immediately using the updated values (no timeout needed)
      const product = products.find(p => p.id === productId)
      const marketData = getMarketDataSample(product?.commodity || '', product?.variety || '')
      
      if (marketData && updated.size) {
        const pricePerLb = marketData.basePrice
        let packageWeight = 1
        
        // Get package weight from the updated size (use 'updated' object, not state)
        const weightMatch = updated.size.match(/^(\d+(?:\.\d+)?)lb$/)
        if (weightMatch) {
          packageWeight = parseFloat(weightMatch[1])
          console.log(`📊 Weight-based calculation: ${packageWeight}lb package`)
        } else {
          // Check for count-based package (like 24ct, 30ct, 24 Count, 30 Count)
          const countMatch = updated.size.match(/^(\d+)\s*(?:ct|count)$/i)
          if (countMatch && product?.variety) {
            const itemCount = parseFloat(countMatch[1])
            
            // Get item weight from variety config using helper function
            const itemWeight = getItemWeight(product.commodity, product.variety.toLowerCase())
            if (itemWeight > 0) {
              packageWeight = itemCount * itemWeight
              console.log(`📊 Update count-based calculation: ${itemCount} items × ${itemWeight}lb = ${packageWeight}lb`)
            }
          } else if (product) {
            // Get weight from config using updated values
            const config = getLegacyCommodityPackaging(product.commodity)
            if (config) {
              let packageType: any
              if (config.hasProcessing && updated.processingType) {
                const processingType = config.processing?.types?.find(pt => pt.id === updated.processingType)
                packageType = processingType?.packageTypes?.find(pt => pt.id === updated.packageType)
              } else if (config.packaging?.types) {
                packageType = config.packaging.types.find(pt => pt.id === updated.packageType)
              }
              
              if (packageType?.sizes) {
                const sizeConfig = packageType.sizes.find((s: any) => s.id === updated.size)
                if (sizeConfig?.weight) {
                  const configWeightMatch = sizeConfig.weight.match(/^(\d+(?:\.\d+)?)lb$/)
                  if (configWeightMatch) {
                    packageWeight = parseFloat(configWeightMatch[1])
                    console.log(`📊 Config-based calculation: ${packageWeight}lb from config`)
                  }
                }
              }
            }
          }
        }
        
        const totalPrice = pricePerLb * packageWeight
        setProductPrices(prev => ({
          ...prev,
          [productId]: totalPrice.toFixed(2)
        }))
        console.log(`💰 Recalculated price for ${productId} after ${field} change: $${totalPrice.toFixed(2)} ($${pricePerLb.toFixed(2)}/lb × ${packageWeight}lb)`)
      }
      
      return {
        ...prev,
        [productId]: updated
      }
    })
  }

  // Generate preview data for the modal
  const generatePreviewData = (): PriceSheetProduct[] => {
    const previewProducts: PriceSheetProduct[] = []
    
    // Process each selected product
    Array.from(selectedProductIds).forEach(productId => {
      const product = products.find(p => p.id === productId)
      if (!product) return
      
      const packaging = productPackaging[productId]
      const price = productPrices[productId]
      
      // Include if product is ready for preview (has price OR override with comment)
      if (isProductReadyForPreview(productId)) {
        previewProducts.push(createPreviewProduct(product, packaging, price || '0', productId))
      }
      
      // Add additional pack styles for this product
      const additionalCount = additionalPackStyles[productId] || 0
      for (let i = 0; i < additionalCount; i++) {
        const packKey = `${productId}-additional-${i}`
        const packPackaging = productPackaging[packKey] || packaging // Use pack-specific packaging
        const packPrice = productPrices[packKey]
        
        // Include if pack style is ready for preview
        if (isProductReadyForPreview(packKey)) {
          previewProducts.push(createPreviewProduct(product, packPackaging, packPrice || '0', packKey, true))
        }
      }
    })
    
    return previewProducts
  }

  // Create a preview product from our data
  const createPreviewProduct = (
    product: ProcessedProduct,
    packaging: any,
    price: string,
    productKey: string,
    isAdditionalPackStyle = false
  ): PriceSheetProduct => {
    // Get expanded options data for this product
    const availability = productAvailability[productKey] || 'Available'
    const isStickered = productStickered[productKey] || false
    const hasOverride = productPriceOverride[productKey] || false
    const overrideComment = productPriceOverrideComment[productKey] || ''
    const addSpecialNote = productAddSpecialNote[productKey] || false
    const specialNotes = addSpecialNote ? (productSpecialNotes[productKey] || '') : ''
    
    // Build product name with stickered indicator
    let displayName = getCleanProductName(product)
    if (isStickered) {
      displayName += ' (Stickered)'
    }
    
    return {
      id: productKey,
      productName: displayName,
      commodity: product.commodity,
      variety: product.variety,
      subtype: product.subtype,
      region: product.region || 'Unknown Region',
      packageType: packaging ? `${packaging.size || ''} ${packaging.packageType || ''}`.trim() : '',
      countSize: packaging?.fruitCount || '',
      grade: packaging?.grade || '',
      basePrice: parseFloat(price) || 0,
      adjustedPrice: parseFloat(price) || 0,
      availability: availability,
      showStrikethrough: false,
      // Additional data for extended functionality
      isStickered,
      isOrganic: product.isOrganic,
      specialNotes,
      hasOverride,
      overrideComment
    }
  }

  // Handle saving the price sheet
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Get all products ready for saving (with prices OR override comments)
      const productsReadyForSaving = getProductsReadyForPreview()

      if (productsReadyForSaving.length === 0) {
        alert('Please add prices or override comments to at least one product before saving.')
        setIsSaving(false)
        return
      }

      // Prepare price sheet data
      const priceSheetData = {
        title: priceSheetTitle,
        status: 'draft' as const,
        notes: undefined
      }

      // Prepare products data
      const productsData: any[] = []
      
      Array.from(selectedProductIds).forEach(productId => {
        const product = products.find(p => p.id === productId)
        if (!product) return
        
        const packaging = productPackaging[productId]
        const price = productPrices[productId]
        
        // Add main product if it's ready for saving
        if (isProductReadyForPreview(productId)) {
          productsData.push(createProductData(product, packaging, price || '0', productId))
        }
        
        // Add additional pack styles
        const additionalCount = additionalPackStyles[productId] || 0
        for (let i = 0; i < additionalCount; i++) {
          const packKey = `${productId}-additional-${i}`
          const packPackaging = productPackaging[packKey] || packaging // Use pack-specific packaging
          const packPrice = productPrices[packKey]
          
          if (isProductReadyForPreview(packKey)) {
            productsData.push(createProductData(product, packPackaging, packPrice || '0', packKey))
          }
        }
      })

      // Save to MongoDB
      const response = await priceSheetsApi.create({
        priceSheet: priceSheetData,
        products: productsData
      })

      console.log('✅ Price sheet saved successfully:', response)
      setHasSaved(true)
      
      // Auto-close modal after successful save
      setTimeout(() => {
        setIsPreviewModalOpen(false)
        setHasSaved(false)
      }, 2000)

    } catch (error) {
      console.error('❌ Failed to save price sheet:', error)
      alert('Failed to save price sheet. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Create product data for saving to MongoDB
  const createProductData = (
    product: ProcessedProduct,
    packaging: any,
    price: string,
    productKey: string
  ) => {
    // Get expanded options data for this product
    const availability = productAvailability[productKey] || 'Available'
    const isStickered = productStickered[productKey] || false
    const hasOverride = productPriceOverride[productKey] || false
    const overrideComment = productPriceOverrideComment[productKey] || ''
    const addSpecialNote = productAddSpecialNote[productKey] || false
    const specialNotes = addSpecialNote ? (productSpecialNotes[productKey] || '') : ''
    
    const productData = {
      productName: getCleanProductName(product),
      commodity: product.commodity,
      variety: product.variety || '',
      regionName: product.region || 'Unknown Region',
      regionId: null, // We could map this if needed
      cropId: product.cropId || null,
      variationId: product.variationId || null,
      packageType: packaging ? `${packaging.size || ''} ${packaging.packageType || ''}`.trim() : '',
      countSize: packaging?.fruitCount || '',
      grade: packaging?.grade || '',
      price: hasOverride ? null : (parseFloat(price) || 0),
      availability: availability,
      seasonality: product.seasonality || 'Year-round',
      isOrganic: product.isOrganic || false,
      // Extended options
      isStickered,
      specialNotes,
      hasOverride,
      overrideComment
    }
    
    console.log('💾 Saving product data:', productKey, {
      ...productData,
      'DEBUG_hasOverride': hasOverride,
      'DEBUG_overrideComment': overrideComment,
      'DEBUG_isStickered': isStickered,
      'DEBUG_originalPrice': price
    })
    return productData
  }

  // Handle send price sheet (placeholder for now)
  const handleSendPriceSheet = () => {
    console.log('Send price sheet functionality - to be implemented')
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Create New Price Sheet', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Price Sheet</h1>
          <p className="mt-2 text-gray-600">Generate a professional price sheet using your imported data</p>
        </div>
      </div>
        
        {/* Three Panel Layout */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex h-[600px]">
            
            {/* Panel 1: Available Products */}
            <div className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${
              showInsightsPanel ? 'w-16' : 'w-80'
            }`}>
              {showInsightsPanel ? (
                // Collapsed state
                <div className="flex flex-col items-center justify-center h-full">
                  <button
                    onClick={() => {
                      setShowInsightsPanel(false)
                      setSelectedInsightProductId(null)
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    ←
                  </button>
                  <div className="mt-2 text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">
                    Products
                  </div>
                </div>
              ) : (
                // Expanded state
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="font-medium text-gray-900 mb-3">Available Products</h3>
                    
                    {/* Category Filter */}
                    <div className="mb-3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Categories</option>
                        {getAvailableCategories().map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Season Filters */}
                    <div className="space-y-2 mb-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setInSeasonOnly(!inSeasonOnly)}
                          className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                            inSeasonOnly
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          In Season
                        </button>
                        <button
                          onClick={() => setUpcomingSeasonOnly(!upcomingSeasonOnly)}
                          className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                            upcomingSeasonOnly
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Coming Soon
                        </button>
                      </div>
                      
                      {/* Select All / Deselect All */}
                      <button
                        onClick={selectedProductIds.size > 0 ? deselectAllProducts : selectAllProducts}
                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {selectedProductIds.size > 0 ? 'Deselect All' : `Select All (${filteredProducts.length})`}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>Loading your products...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500 mt-8">
                        <p>{error}</p>
                        <button 
                          onClick={loadUserData}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>No products found.</p>
                        <p className="text-sm mt-1">Add crops in Crop Management first.</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>No products match your filters.</p>
                        <p className="text-sm mt-1">Try adjusting your category or season filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(getProductsByCommodity()).map(([commodityName, commodityProducts]) => (
                          <div key={commodityName}>
                            {/* Commodity Header */}
                            <div className="px-3 py-2 bg-gray-100 rounded-lg border-b border-gray-200">
                              <h4 className="text-sm font-medium text-gray-900">
                                {commodityName} ({commodityProducts.length})
                              </h4>
                            </div>
                            
                            {/* Products in this commodity */}
                            <div className="space-y-2 mt-2">
                              {commodityProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                    selectedProductIds.has(product.id)
                                      ? 'border-blue-300 bg-blue-50'
                                      : 'border-gray-200 bg-white hover:bg-gray-50'
                                  }`}
                                  onClick={() => toggleProductSelection(product.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{getCleanProductName(product)}</h4>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-xs text-gray-600">{product.region}</p>
                                        <span className="text-xs text-gray-400">•</span>
                                        <p className="text-xs text-gray-600">{product.seasonality}</p>
                                      </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      selectedProductIds.has(product.id)
                                        ? 'border-blue-600 bg-blue-600'
                                        : 'border-gray-300'
                                    }`}>
                                      {selectedProductIds.has(product.id) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2: Selected Products */}
            <div className={`bg-white flex flex-col border-r border-gray-200 transition-all duration-300 ${
              showInsightsPanel ? 'flex-1 min-w-0' : 'flex-1'
            }`}>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">
                  Selected Products ({selectedProductIds.size}
                  {Object.values(additionalPackStyles).reduce((sum, count) => sum + count, 0) > 0 && (
                    <span className="text-blue-600">
                      {' '}+ {Object.values(additionalPackStyles).reduce((sum, count) => sum + count, 0)} pack styles
                    </span>
                  )})
                </h3>
                <p className="text-sm text-gray-600">Configure packaging, pricing, and availability</p>
              </div>
              {/* Sticky Table Header - Outside scrollable area */}
              {selectedProductIds.size > 0 && (
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="grid gap-2 text-xs font-medium text-gray-700" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 0.4fr 1fr' }}>
                    <div>Product</div>
                    <div>Cut</div>
                    <div>Package</div>
                    <div>Size</div>
                    <div>Count</div>
                    <div>Grade</div>
                    <div>Price</div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                {selectedProductIds.size === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p>No products selected</p>
                      <p className="text-sm mt-2">Select products from the left panel to configure them</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                      {Array.from(selectedProductIds).map((productId) => {
                      const product = products.find(p => p.id === productId)
                      if (!product) return null
                      
                      const additionalCount = additionalPackStyles[productId] || 0
                      
                      return (
                        <div key={productId} className="space-y-2">
                          {/* Main Product Row */}
                          <div className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                            <div className="grid gap-2 items-center text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 0.4fr 1fr' }}>
                              {/* Product Name + Shipping Point */}
                              <div className="min-w-0 flex items-start space-x-2">
                                <button
                                  onClick={() => addPackStyle(productId)}
                                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors mt-0.5"
                                  title="Add pack style"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{getCleanProductName(product)}</h4>
                                  <p className="text-xs text-gray-600 truncate">{product.region}</p>
                                </div>
                              </div>
                            
                            {/* Cut */}
                            <div>
                              <select 
                                value={productPackaging[productId]?.processingType || ''}
                                onChange={(e) => updateProductPackaging(productId, 'processingType', e.target.value)}
                                className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                              >
                                {(() => {
                                  const config = getLegacyCommodityPackaging(product.commodity)
                                  if (config?.hasProcessing && config.processing?.types) {
                                    return config.processing.types.map(pt => (
                                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))
                                  } else {
                                    return <option value="">Fresh</option>
                                  }
                                })()}
                              </select>
                            </div>
                            
                            {/* Package */}
                            <div>
                              <select 
                                value={productPackaging[productId]?.packageType || ''}
                                onChange={(e) => updateProductPackaging(productId, 'packageType', e.target.value)}
                                className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                              >
                                {(() => {
                                  const config = getLegacyCommodityPackaging(product.commodity)
                                  const packaging = productPackaging[productId]
                                  
                                  if (config?.hasProcessing && packaging?.processingType) {
                                    const processingType = config.processing?.types?.find(pt => pt.id === packaging.processingType)
                                    return processingType?.packageTypes?.map(pt => (
                                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    )) || [<option key="default" value="">Package</option>]
                                  } else if (config?.packaging?.types) {
                                    return config.packaging.types.map(pt => (
                                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))
                                  }
                                  return <option value="">Package</option>
                                })()}
                              </select>
                            </div>
                            
                            {/* Size */}
                            <div>
                              <select 
                                value={productPackaging[productId]?.size || ''}
                                onChange={(e) => updateProductPackaging(productId, 'size', e.target.value)}
                                className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                              >
                                {(() => {
                                  const config = getLegacyCommodityPackaging(product.commodity)
                                  const packaging = productPackaging[productId]
                                  
                                  let packageType: PackageType | undefined
                                  
                                  if (config?.hasProcessing && packaging?.processingType && packaging?.packageType) {
                                    const processingType = config.processing?.types?.find(pt => pt.id === packaging.processingType)
                                    packageType = processingType?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                  } else if (config?.packaging?.types && packaging?.packageType) {
                                    packageType = config.packaging.types.find(pt => pt.id === packaging.packageType)
                                  }
                                  
                                  return packageType?.sizes?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  )) || [<option key="default" value="">Size</option>]
                                })()}
                              </select>
                            </div>
                            
                            {/* Count */}
                            <div>
                              {(() => {
                                const config = getLegacyCommodityPackaging(product.commodity)
                                const packaging = productPackaging[productId]
                                
                                let packageType: PackageType | undefined
                                
                                if (config?.hasProcessing && packaging?.processingType && packaging?.packageType) {
                                  const processingType = config.processing?.types?.find(pt => pt.id === packaging.processingType)
                                  packageType = processingType?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                } else if (config?.packaging?.types && packaging?.packageType) {
                                  packageType = config.packaging.types.find(pt => pt.id === packaging.packageType)
                                }
                                
                                if (packageType?.fruitCounts && packageType.fruitCounts.length > 0) {
                                  return (
                                    <select 
                                      value={productPackaging[productId]?.fruitCount || ''}
                                      onChange={(e) => updateProductPackaging(productId, 'fruitCount', e.target.value)}
                                      className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                      <option value="">Count</option>
                                      {packageType.fruitCounts.map(fc => (
                                        <option key={fc.id} value={fc.id}>{fc.name}</option>
                                      ))}
                                    </select>
                                  )
                                } else {
                                  return (
                                    <div className="w-full py-1.5 text-xs text-gray-400 flex items-center justify-center">
                                      N/A
                                    </div>
                                  )
                                }
                              })()}
                            </div>
                            
                            {/* Grade */}
                            <div>
                              <select 
                                value={productPackaging[productId]?.grade || ''}
                                onChange={(e) => updateProductPackaging(productId, 'grade', e.target.value)}
                                className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                              >
                                {(() => {
                                  const config = getLegacyCommodityPackaging(product.commodity)
                                  if (config?.quality?.grades) {
                                    return config.quality.grades.map(grade => (
                                      <option key={grade} value={grade}>{grade}</option>
                                    ))
                                  }
                                  return [
                                    <option key="fancy" value="Fancy">Fancy</option>,
                                    <option key="choice" value="Choice">Choice</option>,
                                    <option key="standard" value="Standard">Standard</option>
                                  ]
                                })()}
                              </select>
                            </div>
                            
                            {/* Price */}
                            <div>
                              <div className="relative">
                                <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                                <input
                                  type="text"
                                  value={productPrices[productId] || ''}
                                  onChange={(e) => handlePriceChange(productId, e.target.value)}
                                  className={`w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    productPriceOverride[productId] ? 'line-through text-gray-400' : ''
                                  }`}
                                  placeholder="0.00"
                                />
                              </div>
                              {/* Price Breakdown */}
                              {!productPriceOverride[productId] && (() => {
                                const breakdown = getPriceBreakdown(productId, productPrices[productId])
                                if (breakdown.breakdown) {
                                  return (
                                    <div className={`text-xs mt-1 ${breakdown.isCustom ? 'text-orange-600' : 'text-gray-500'}`}>
                                      {breakdown.breakdown}
                                      {breakdown.isCustom && <span className="ml-1">(custom)</span>}
                                    </div>
                                  )
                                }
                                return null
                              })()}
                            </div>
                            
                            {/* Expand Options Button */}
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setExpandedOptions(prev => ({
                                  ...prev,
                                  [productId]: !prev[productId]
                                }))}
                                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                  expandedOptions[productId] 
                                    ? 'text-green-600 bg-green-50 rotate-90' 
                                    : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                }`}
                                title="Additional options"
                              >
                                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Market Data Section */}
                            <div 
                              className="border-l border-gray-200 pl-3 cursor-pointer hover:bg-blue-50 transition-colors rounded-r"
                              onClick={() => toggleInsightsPanel(productId)}
                              title="View market intelligence"
                            >
                              <div className="flex items-center justify-center space-x-1">
                                {/* Chart/Graph Icon */}
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <div className="text-xs text-center">
                                  {(() => {
                                    const marketData = getMarketDataSample(product.commodity, product.variety || '')
                                    if (!marketData) return <div className="text-xs text-gray-500">No data</div>
                                    return (
                                      <>
                                        <div className="font-medium text-blue-600">${marketData.basePrice}</div>
                                        <div className="text-gray-500">{marketData.trend}</div>
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                            {/* Expandable Options Section */}
                            {expandedOptions[productId] && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                {/* First Row - All Options */}
                                <div className="grid grid-cols-4 gap-4 items-center">
                                  {/* Availability Dropdown */}
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Availability</label>
                                    <select
                                      value={productAvailability[productId] || 'Available'}
                                      onChange={(e) => setProductAvailability(prev => ({ ...prev, [productId]: e.target.value }))}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                      <option value="Available">Available</option>
                                      <option value="Coming Soon">Coming Soon</option>
                                      <option value="End of Season">End of Season</option>
                                      <option value="Limited Supply">Limited Supply</option>
                                      <option value="Seasonal">Seasonal</option>
                                    </select>
                                  </div>
                                  
                                  {/* Stickered Option */}
                                  <div className="flex items-center justify-center">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={productStickered[productId] || false}
                                        onChange={(e) => setProductStickered(prev => ({ ...prev, [productId]: e.target.checked }))}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                      />
                                      <span className="text-sm text-gray-700">Stickered</span>
                                    </label>
                                  </div>
                                  
                                  {/* Override Price with Comment */}
                                  <div className="flex items-center justify-center">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={productPriceOverride[productId] || false}
                                        onChange={(e) => setProductPriceOverride(prev => ({ ...prev, [productId]: e.target.checked }))}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                      />
                                      <span className="text-sm text-gray-700">Override price</span>
                                    </label>
                                  </div>
                                  
                                  {/* Add Special Note */}
                                  <div className="flex items-center justify-center">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={productAddSpecialNote[productId] || false}
                                        onChange={(e) => setProductAddSpecialNote(prev => ({ ...prev, [productId]: e.target.checked }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">Add special note</span>
                                    </label>
                                  </div>
                                </div>
                                
                                {/* Second Row - Conditional Inputs */}
                                {(productPriceOverride[productId] || productAddSpecialNote[productId]) && (
                                  <div className="mt-3 space-y-3">
                                    {/* Override Comment Input */}
                                    {productPriceOverride[productId] && (
                                      <div>
                                        <input
                                          type="text"
                                          value={productPriceOverrideComment[productId] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value.slice(0, 25) // Limit to 25 characters
                                            setProductPriceOverrideComment(prev => ({ ...prev, [productId]: value }))
                                          }}
                                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
                                            productPriceOverride[productId] && !productPriceOverrideComment[productId]?.trim()
                                              ? 'border-red-300 bg-red-50' 
                                              : 'border-gray-300'
                                          }`}
                                          placeholder="Enter price override comment... (required)"
                                          maxLength={25}
                                          required
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                          {(productPriceOverrideComment[productId] || '').length}/25 characters
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Special Notes Input */}
                                    {productAddSpecialNote[productId] && (
                                      <div>
                                        <input
                                          type="text"
                                          value={productSpecialNotes[productId] || ''}
                                          onChange={(e) => setProductSpecialNotes(prev => ({ ...prev, [productId]: e.target.value }))}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Add special notes..."
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Additional Pack Style Rows */}
                          {Array.from({ length: additionalCount }, (_, index) => (
                            <div key={`${productId}-additional-${index}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50 ml-6">
                              <div className="grid gap-2 items-center text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 0.4fr 1fr' }}>
                                {/* Product Name + Remove Button */}
                                <div className="min-w-0 flex items-start space-x-2">
                                  <button
                                    onClick={() => removePackStyle(productId)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center border border-red-300 rounded text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors mt-0.5"
                                    title="Remove pack style"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium text-gray-700 truncate">{getCleanProductName(product)} - Pack Style {index + 2}</h4>
                                    <p className="text-xs text-gray-500 truncate">{product.region}</p>
                                  </div>
                                </div>
                                
                                {/* Cut */}
                                <div>
                                  <select className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                                    <option>Fresh</option>
                                    <option>Chopped</option>
                                    <option>Diced</option>
                                  </select>
                                </div>
                                
                                {/* Package */}
                                <div>
                                  <select className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                                    <option>Carton</option>
                                    <option>Bag</option>
                                    <option>Case</option>
                                    <option>Crate</option>
                                  </select>
                                </div>
                                
                                {/* Size */}
                                <div>
                                  <select className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                                    <option>24 ct</option>
                                    <option>40 lb</option>
                                    <option>25 lb</option>
                                    <option>50 lb</option>
                                  </select>
                                </div>
                                
                                {/* Count */}
                                <div>
                                  <select className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                                    <option>-</option>
                                    <option>88s</option>
                                    <option>113s</option>
                                    <option>138s</option>
                                  </select>
                                </div>
                                
                                {/* Grade */}
                                <div>
                                  <select className="w-full px-2 py-1.5 border-l border-t border-b border-gray-300 border-r-2 border-r-gray-400 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                                    <option>Fancy</option>
                                    <option>Choice</option>
                                    <option>Standard</option>
                                  </select>
                                </div>
                                
                                {/* Price */}
                                <div>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                                    <input
                                      type="text"
                                      value={productPrices[`${productId}-additional-${index}`] || ''}
                                      onChange={(e) => handlePriceChange(`${productId}-additional-${index}`, e.target.value)}
                                      className={`w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                        productPriceOverride[`${productId}-additional-${index}`] ? 'line-through text-gray-400' : ''
                                      }`}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  {/* Price Breakdown for Additional Pack Style */}
                                  {!productPriceOverride[`${productId}-additional-${index}`] && (() => {
                                    const breakdown = getPriceBreakdown(productId, productPrices[`${productId}-additional-${index}`])
                                    if (breakdown.breakdown) {
                                      return (
                                        <div className={`text-xs mt-1 ${breakdown.isCustom ? 'text-orange-600' : 'text-gray-500'}`}>
                                          {breakdown.breakdown}
                                          {breakdown.isCustom && <span className="ml-1">(custom)</span>}
                                        </div>
                                      )
                                    }
                                    return null
                                  })()}
                                </div>
                                
                                {/* Expand Options Button */}
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => setExpandedOptions(prev => ({
                                      ...prev,
                                      [`${productId}-additional-${index}`]: !prev[`${productId}-additional-${index}`]
                                    }))}
                                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                      expandedOptions[`${productId}-additional-${index}`] 
                                        ? 'text-green-600 bg-green-50 rotate-90' 
                                        : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                                
                                {/* Empty space for market data */}
                                <div></div>
                              </div>
                              
                              {/* Expandable Options Section for Additional Pack Style */}
                              {expandedOptions[`${productId}-additional-${index}`] && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  {/* First Row - All Options */}
                                  <div className="grid grid-cols-4 gap-4 items-center">
                                    {/* Availability Dropdown */}
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Availability</label>
                                      <select
                                        value={productAvailability[`${productId}-additional-${index}`] || 'Available'}
                                        onChange={(e) => setProductAvailability(prev => ({ ...prev, [`${productId}-additional-${index}`]: e.target.value }))}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                      >
                                        <option value="Available">Available</option>
                                        <option value="Coming Soon">Coming Soon</option>
                                        <option value="End of Season">End of Season</option>
                                        <option value="Limited Supply">Limited Supply</option>
                                        <option value="Seasonal">Seasonal</option>
                                      </select>
                                    </div>
                                    
                                    {/* Stickered Option */}
                                    <div className="flex items-center justify-center">
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={productStickered[`${productId}-additional-${index}`] || false}
                                          onChange={(e) => setProductStickered(prev => ({ ...prev, [`${productId}-additional-${index}`]: e.target.checked }))}
                                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Stickered</span>
                                      </label>
                                    </div>
                                    
                                    {/* Override Price with Comment */}
                                    <div className="flex items-center justify-center">
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={productPriceOverride[`${productId}-additional-${index}`] || false}
                                          onChange={(e) => setProductPriceOverride(prev => ({ ...prev, [`${productId}-additional-${index}`]: e.target.checked }))}
                                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">Override price</span>
                                      </label>
                                    </div>
                                    
                                    {/* Add Special Note */}
                                    <div className="flex items-center justify-center">
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={productAddSpecialNote[`${productId}-additional-${index}`] || false}
                                          onChange={(e) => setProductAddSpecialNote(prev => ({ ...prev, [`${productId}-additional-${index}`]: e.target.checked }))}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Add special note</span>
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {/* Second Row - Conditional Inputs */}
                                  {(productPriceOverride[`${productId}-additional-${index}`] || productAddSpecialNote[`${productId}-additional-${index}`]) && (
                                    <div className="mt-3 space-y-3">
                                      {/* Override Comment Input */}
                                      {productPriceOverride[`${productId}-additional-${index}`] && (
                                        <div>
                                          <input
                                            type="text"
                                            value={productPriceOverrideComment[`${productId}-additional-${index}`] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value.slice(0, 25) // Limit to 25 characters
                                              setProductPriceOverrideComment(prev => ({ ...prev, [`${productId}-additional-${index}`]: value }))
                                            }}
                                            className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
                                              productPriceOverride[`${productId}-additional-${index}`] && !productPriceOverrideComment[`${productId}-additional-${index}`]?.trim()
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300'
                                            }`}
                                            placeholder="Enter price override comment... (required)"
                                            maxLength={25}
                                            required
                                          />
                                          <div className="text-xs text-gray-500 mt-1">
                                            {(productPriceOverrideComment[`${productId}-additional-${index}`] || '').length}/25 characters
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Special Notes Input */}
                                      {productAddSpecialNote[`${productId}-additional-${index}`] && (
                                        <div>
                                          <input
                                            type="text"
                                            value={productSpecialNotes[`${productId}-additional-${index}`] || ''}
                                            onChange={(e) => setProductSpecialNotes(prev => ({ ...prev, [`${productId}-additional-${index}`]: e.target.value }))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Add special notes..."
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Panel 3: Market Intelligence */}
            {showInsightsPanel && selectedInsightProductId && (
              <div className="w-80 bg-white flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Market Intelligence</h3>
                    <p className="text-sm text-gray-600">
                      {products.find(p => p.id === selectedInsightProductId)?.name || 'Product'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowInsightsPanel(false)
                      setSelectedInsightProductId(null)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {(() => {
                    const product = products.find(p => p.id === selectedInsightProductId)
                    if (!product) return <div>Product not found</div>
                    
                    const marketData = getMarketDataSample(product.commodity, product.variety || '')
                    if (!marketData) return <div>No market data available</div>
                    
                    return (
                      <div className="space-y-4">
                        {/* Market Data Tiles */}
                        <div className="grid grid-cols-1 gap-4">
                          {/* USDA Tile */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">USDA Terminal Markets</h4>
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-gray-900">${marketData.basePrice}/lb</p>
                              <p className="text-xs text-gray-600">Region: {marketData.primaryRegion}</p>
                              <p className="text-xs text-gray-600">Regional: ${marketData.regionalPrice}/lb</p>
                            </div>
                          </div>
                          
                          {/* Market Insights */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Market Insights</h4>
                            <div className="space-y-1">
                              {marketData.insights.slice(0, 2).map((insight, index) => (
                                <p key={index} className="text-xs text-gray-600">{insight}</p>
                              ))}
                            </div>
                          </div>
                          
                          {/* Retail Benchmark */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Retail Benchmark</h4>
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-green-600">{marketData.trend}</p>
                              <p className="text-xs text-gray-600">Retail: ${(marketData.basePrice * marketData.retailMultiplier).toFixed(2)}/{marketData.retailUnit}</p>
                              <p className="text-xs text-gray-600">Volatility: {marketData.volatility}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Suggested Price Calculation */}
                        <div className="border-t pt-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-900">Suggested Price</h4>
                              <button 
                                onClick={() => {
                                  if (selectedInsightProductId) {
                                    const packagePrice = calculateTotalPackagePrice(selectedInsightProductId)
                                    if (packagePrice.totalPrice) {
                                      setProductPrices(prev => ({
                                        ...prev,
                                        [selectedInsightProductId]: packagePrice.totalPrice
                                      }))
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                              >
                                Use Price
                              </button>
                            </div>
                            
                            {/* Price Breakdown */}
                            {marketData.priceBreakdown && (
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">USDA Terminal Average:</span>
                                  <span className="font-medium">${marketData.priceBreakdown.usdaTerminalAverage.toFixed(2)}/lb</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Supply Premium (USDA AMS):</span>
                                  <span className="font-medium text-green-600">+${marketData.priceBreakdown.supplyPremiumAMS.toFixed(2)}/lb</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Weather Impact:</span>
                                  <span className="font-medium text-orange-600">+${marketData.priceBreakdown.weatherImpact.toFixed(2)}/lb</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Transport Cost:</span>
                                  <span className="font-medium text-blue-600">+${marketData.priceBreakdown.transportCost.toFixed(2)}/lb</span>
                                </div>
                                {marketData.priceBreakdown.seasonalAdjustment && marketData.priceBreakdown.seasonalAdjustment !== 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seasonal Adjustment:</span>
                                    <span className={`font-medium ${marketData.priceBreakdown.seasonalAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {marketData.priceBreakdown.seasonalAdjustment > 0 ? '+' : ''}${marketData.priceBreakdown.seasonalAdjustment.toFixed(2)}/lb
                                    </span>
                                  </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between text-sm font-semibold">
                                    <span className="text-gray-900">Total Base Price:</span>
                                    <span className="text-gray-900">${marketData.basePrice.toFixed(2)}/lb</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Final Suggested Price */}
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold text-blue-600">
                                    ${(() => {
                                      if (selectedInsightProductId) {
                                        const packagePrice = calculateTotalPackagePrice(selectedInsightProductId)
                                        return packagePrice.totalPrice || marketData.basePrice.toFixed(2)
                                      }
                                      return marketData.basePrice.toFixed(2)
                                    })()}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {(() => {
                                      if (selectedInsightProductId) {
                                        const packagePrice = calculateTotalPackagePrice(selectedInsightProductId)
                                        return packagePrice.calculation || 'Based on market conditions'
                                      }
                                      return 'Based on market conditions'
                                    })()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Package</p>
                                  <p className="text-sm font-medium text-gray-700">
                                    {(() => {
                                      if (selectedInsightProductId) {
                                        const product = products.find(p => p.id === selectedInsightProductId)
                                        const packaging = productPackaging[selectedInsightProductId]
                                        if (product && packaging?.size) {
                                          return `${packaging.size} ${packaging.packageType || 'package'}`
                                        }
                                      }
                                      return 'Standard package'
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Preview Price Sheet Button - Below 3-Panel Layout */}
        {selectedProductIds.size > 0 && (
          <div className="mt-8 flex justify-end">
            {(() => {
              const readyProducts = getProductsReadyForPreview()
              const isDisabled = readyProducts.length === 0
              
              return (
                <button 
                  onClick={() => !isDisabled && setIsPreviewModalOpen(true)}
                  disabled={isDisabled}
                  className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-lg ${
                    isDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>
                    Preview Price Sheet ({readyProducts.length} ready{readyProducts.length !== getTotalItemCount() ? ` of ${getTotalItemCount()}` : ''})
                  </span>
                </button>
              )
            })()}
          </div>
        )}

        {/* Preview Modal */}
        <PriceSheetPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={priceSheetTitle}
          onTitleChange={setPriceSheetTitle}
          products={generatePreviewData()}
          userEmail={user?.email ? `sales@${user.email.split('@')[1]}` : undefined}
          userPhone={user?.profile?.phone}
          onSave={handleSave}
          onSendPriceSheet={handleSendPriceSheet}
          isSaving={isSaving}
          hasSaved={hasSaved}
        />
    </>
  )
}
