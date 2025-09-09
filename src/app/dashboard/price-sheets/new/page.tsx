"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import PriceSheetPreviewModal, { type PriceSheetProduct } from '../../../../components/modals/PriceSheetPreviewModal'
import { getPackagingSpecs } from '../../../../config/packagingSpecs'
import { commodityOptions } from '../../../../config/commodityOptions'
import { 
  getCommodityPackaging, 
  getDefaultProcessingType, 
  getDefaultPackageType, 
  getDefaultSize,
  getDefaultFruitCount,
  getDefaultGrade,
  type CommodityPackaging,
  type ProcessingType,
  type PackageType,
  type PackageSize,
  type FruitCount
} from '../../../../config/commodityPackaging'
import { cropsApi, shippingPointsApi, priceSheetsApi, packagingApi } from '../../../../lib/api'
import type { CropManagement, CropVariation } from '../../../../types'
import { useUser } from '../../../../contexts/UserContext'
import { useRouter } from 'next/navigation'

// Interface for processed product data from user's crops
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
  regionId: string
}

const availabilityOptions = [
  'Available',
  'Limited',
  'End of Season',
  'Old Crop',
  'New Crop',
  'Pre-Order',
  'Contact for Availability'
]



interface ProductRow {
  id: string
  productId: number
  processingType?: string   // "Crown Cut", "Florets", etc. for applicable commodities
  packageType: string
  countSize?: string         // "88s", "113s" for cartons
  grade?: string            // "Fancy", "Choice", "Standard"
  price: string
  marketPrice?: string      // USDA price for comparison
  marketPriceUnit?: string  // USDA unit (per lb, per carton, etc.)
  marketPriceDate?: string  // When USDA published this price
  marketPriceLoading?: boolean // Loading state for refresh
  marketPriceSource?: 'usda-exact' | 'usda-estimated' | 'calculated' // Data transparency
  marketPriceConfidence?: 'high' | 'medium' | 'low' // Confidence level
  availability: string
  isSelected: boolean
  isPackStyleRow?: boolean
  parentProductId?: number
}

interface PreviewProduct {
  id: string
  productName: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  basePrice: number
  adjustedPrice: number
  marketPrice?: number
  availability: string
}

export default function NewPriceSheet() {
  const { user } = useUser()
  const router = useRouter()
  const [priceSheetTitle, setPriceSheetTitle] = useState('')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [inSeasonOnly, setInSeasonOnly] = useState(false)
  const [upcomingSeasonOnly, setUpcomingSeasonOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPriceInfoModal, setShowPriceInfoModal] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [productPackStyles, setProductPackStyles] = useState<Record<string, number>>({})
  const [productPrices, setProductPrices] = useState<Record<string, string>>({})
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({}) // Track expanded additional options per product
  
  // New packaging state management
  const [productPackaging, setProductPackaging] = useState<Record<string, {
    processingType?: string
    packageType?: string
    size?: string
    fruitCount?: string
    grade?: string
  }>>({})

  // State for custom packaging
  const [customPackaging, setCustomPackaging] = useState<Record<string, any[]>>({})

  // Set default title when user data loads
  useEffect(() => {
    if (user?.profile?.companyName && !priceSheetTitle) {
      setPriceSheetTitle(`${user.profile.companyName} Price Sheet - ${new Date().toLocaleDateString()}`)
    }
  }, [user?.profile?.companyName, priceSheetTitle])

  // Helper functions to work with unified packaging system
  const getPackagingOptions = (commodity: string) => {
    const standardSpecs = getPackagingSpecs(commodity)
    const customSpecs = customPackaging[commodity] || []
    
    const allSpecs = [...standardSpecs, ...customSpecs]
    
    return allSpecs.map(spec => ({
      id: spec.id,
      type: spec.type,
      name: spec.name,
      hasCountSize: !!spec.counts?.length,
      hasSizes: !!spec.sizes?.length,
      counts: spec.counts || [],
      sizes: spec.sizes || [],
      grades: spec.grades || ['US No. 1'],
      isStandard: spec.isStandard
    }))
  }

  const hasCountSize = (commodity: string) => {
    const options = getPackagingOptions(commodity)
    return options.some(opt => opt.hasCountSize || opt.hasSizes)
  }

  const getCountSizeOptions = (commodity: string) => {
    const options = getPackagingOptions(commodity)
    const allCounts = options.flatMap(opt => opt.counts)
    const allSizes = options.flatMap(opt => opt.sizes)
    return [...new Set([...allCounts, ...allSizes])] // Combine counts and sizes, remove duplicates
  }

  const getGradeOptions = (commodity: string) => {
    const options = getPackagingOptions(commodity)
    const allGrades = options.flatMap(opt => opt.grades)
    return [...new Set(allGrades)] // Remove duplicates
  }

  // Helper function to get available categories based on user's products
  const getAvailableCategories = () => {
    const userCommodities = new Set(products.map(p => p.commodity.toLowerCase()))
    const availableCategories = commodityOptions
      .filter(category => 
        category.commodities.some(commodity => 
          userCommodities.has(commodity.id)
        )
      )
      .map(category => ({
        id: category.id,
        name: category.name
      }))
    
    return availableCategories
  }

  const getProductsByCommodity = () => {
    const filtered = products.filter(product => {
      // Filter by category
      if (selectedCategory !== 'all') {
        const category = commodityOptions.find(cat => 
          cat.commodities.some(c => c.id === product.commodity)
        )
        if (!category || category.id !== selectedCategory) return false
      }
      
      // Filter by season (OR logic when both are selected)
      if (inSeasonOnly || upcomingSeasonOnly) {
        const inSeason = inSeasonOnly && isProductInSeason(product)
        const upcoming = upcomingSeasonOnly && isProductUpcomingSeason(product)
        
        // If both filters are active, show products that match either condition
        if (inSeasonOnly && upcomingSeasonOnly) {
          return inSeason || upcoming
        }
        // If only one filter is active, show products that match that condition
        return inSeason || upcoming
      }
      
      return true
    })
    
    const grouped: Record<string, ProcessedProduct[]> = {}
    filtered.forEach(product => {
      if (!grouped[product.commodity]) {
        grouped[product.commodity] = []
      }
      grouped[product.commodity].push(product)
    })

    return grouped
  }

  const initializeProductPackaging = (productId: string, commodity: string) => {
    const config = getCommodityPackaging(commodity)
    if (!config) return

    const defaults: any = {}
    
    if (config.hasProcessing) {
      const defaultProcessing = getDefaultProcessingType(commodity)
      if (defaultProcessing) {
        defaults.processingType = defaultProcessing.id
        const defaultPackage = getDefaultPackageType(commodity, defaultProcessing.id)
        if (defaultPackage) {
          defaults.packageType = defaultPackage.id
          const defaultSize = getDefaultSize(commodity, defaultProcessing.id, defaultPackage.id)
          if (defaultSize) {
            defaults.size = defaultSize.id
          }
        }
      }
    } else {
      const defaultPackage = getDefaultPackageType(commodity)
      if (defaultPackage) {
        defaults.packageType = defaultPackage.id
        const defaultSize = getDefaultSize(commodity, undefined, defaultPackage.id)
        if (defaultSize) {
          defaults.size = defaultSize.id
        }
        const defaultFruitCount = getDefaultFruitCount(commodity, defaultPackage.id)
        if (defaultFruitCount) {
          defaults.fruitCount = defaultFruitCount.id
        }
      }
    }
    
    const defaultGrade = getDefaultGrade(commodity)
    if (defaultGrade) {
      defaults.grade = defaultGrade
    }

    setProductPackaging(prev => ({
      ...prev,
      [productId]: defaults
    }))
    
    // Set default price based on the initialized packaging
    if (defaults.size) {
      let packageType
      if (config.hasProcessing && defaults.processingType) {
        const processingType = config.processingTypes?.find(pt => pt.id === defaults.processingType)
        packageType = processingType?.packageTypes.find(pt => pt.id === defaults.packageType)
      } else {
        packageType = config.packageTypes?.find(pt => pt.id === defaults.packageType)
      }
      
      const sizeConfig = packageType?.sizes.find(s => s.id === defaults.size)
      if (sizeConfig?.defaultPrice !== undefined) {
        setProductPrices(prev => ({
          ...prev,
          [productId]: sizeConfig.defaultPrice!.toString()
        }))
      }
    }
  }

  const toggleProductInBuilder = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        // Clean up related state
        setProductPackStyles(prev => {
          const newStyles = { ...prev }
          delete newStyles[productId]
          return newStyles
        })
        setProductPackaging(prev => {
          const newPackaging = { ...prev }
          delete newPackaging[productId]
          return newPackaging
        })
      } else {
        newSet.add(productId)
        // Initialize packaging defaults
        const product = getSelectedProducts().find(p => p.id === productId) || 
                       products.find(p => p.id === productId)
        if (product) {
          initializeProductPackaging(productId, product.commodity)
        }
      }
      return newSet
    })
  }

  const getSelectedProducts = () => {
    return products.filter(product => selectedProductIds.has(product.id))
  }

  const addPackStyleForBuilder = (productId: string) => {
    setProductPackStyles(prev => {
      const newCount = (prev[productId] || 0) + 1
      const packStyleId = `${productId}-pack-${newCount - 1}`
      
      // Initialize pack style with same settings as main product
      const mainPackaging = productPackaging[productId]
      if (mainPackaging) {
        setProductPackaging(prevPackaging => ({
          ...prevPackaging,
          [packStyleId]: { ...mainPackaging }
        }))
        
        // Set default price based on the packaging settings
        const product = products.find(p => p.id === productId)
        if (product && mainPackaging.size) {
          const config = getCommodityPackaging(product.commodity)
          if (config) {
            let packageType
            if (config.hasProcessing && mainPackaging.processingType) {
              const processingType = config.processingTypes?.find(pt => pt.id === mainPackaging.processingType)
              packageType = processingType?.packageTypes.find(pt => pt.id === mainPackaging.packageType)
            } else {
              packageType = config.packageTypes?.find(pt => pt.id === mainPackaging.packageType)
            }
            
            const sizeConfig = packageType?.sizes.find(s => s.id === mainPackaging.size)
            if (sizeConfig?.defaultPrice !== undefined) {
              setProductPrices(prevPrices => ({
                ...prevPrices,
                [packStyleId]: sizeConfig.defaultPrice!.toString()
              }))
            }
          }
        }
      }
      
      return {
        ...prev,
        [productId]: newCount
      }
    })
  }

  const removePackStyleForBuilder = (productId: string) => {
    setProductPackStyles(prev => {
      const currentCount = prev[productId] || 0
      if (currentCount <= 1) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [productId]: currentCount - 1
      }
    })
  }

  const getPackStylesForProduct = (productId: string) => {
    const count = productPackStyles[productId] || 0
    return Array.from({ length: count }, (_, index) => index)
  }

  const updateProductPrice = (productId: string, packIndex: number | null, price: string) => {
    const key = packIndex !== null ? `${productId}-pack-${packIndex}` : productId
    setProductPrices(prev => ({
      ...prev,
      [key]: price
    }))
  }

  const updateProductPackaging = (productId: string, field: string, value: string) => {
    setProductPackaging(prev => {
      const current = prev[productId] || {}
      const updated = { ...current, [field]: value }
      
      // Reset dependent fields when parent changes
      if (field === 'processingType') {
        delete updated.packageType
        delete updated.size
        delete updated.fruitCount
        
        // Set new defaults
        const product = products.find(p => p.id === productId)
        if (product) {
          const defaultPackage = getDefaultPackageType(product.commodity, value)
          if (defaultPackage) {
            updated.packageType = defaultPackage.id
          const defaultSize = getDefaultSize(product.commodity, value, defaultPackage.id)
          if (defaultSize) {
            updated.size = defaultSize.id
            // Set default price if available
            const config = getCommodityPackaging(product.commodity)
            if (config?.hasProcessing) {
              const processingType = config.processingTypes?.find(pt => pt.id === value)
              const packageType = processingType?.packageTypes.find(pt => pt.id === defaultPackage.id)
              const sizeConfig = packageType?.sizes.find(s => s.id === defaultSize.id)
              if (sizeConfig?.defaultPrice) {
                updateProductPrice(productId, null, sizeConfig.defaultPrice.toString())
              }
            }
          }
          }
        }
      } else if (field === 'packageType') {
        delete updated.size
        delete updated.fruitCount
        
        // Set new defaults
        const product = products.find(p => p.id === productId)
        if (product) {
        const defaultSize = getDefaultSize(product.commodity, current.processingType, value)
        if (defaultSize) {
          updated.size = defaultSize.id
          // Set default price if available
          const config = getCommodityPackaging(product.commodity)
          if (config) {
            let packageType
            if (config.hasProcessing && current.processingType) {
              const processingType = config.processingTypes?.find(pt => pt.id === current.processingType)
              packageType = processingType?.packageTypes.find(pt => pt.id === value)
            } else {
              packageType = config.packageTypes?.find(pt => pt.id === value)
            }
            const sizeConfig = packageType?.sizes.find(s => s.id === defaultSize.id)
            if (sizeConfig?.defaultPrice) {
              updateProductPrice(productId, null, sizeConfig.defaultPrice.toString())
            }
          }
        }
          const defaultFruitCount = getDefaultFruitCount(product.commodity, value)
          if (defaultFruitCount) {
            updated.fruitCount = defaultFruitCount.id
          }
        }
      }
      
      return {
        ...prev,
        [productId]: updated
      }
    })
  }

  const canPreviewPriceSheet = () => {
    // Check if all main products have prices
    const selectedProductsHavePrices = getSelectedProducts().every(product => {
      const mainPrice = productPrices[product.id]
      if (!mainPrice || mainPrice.trim() === '') return false
      
      // Check if all pack styles for this product have prices
      const packCount = productPackStyles[product.id] || 0
      for (let i = 0; i < packCount; i++) {
        const packPrice = productPrices[`${product.id}-pack-${i}`]
        if (!packPrice || packPrice.trim() === '') return false
      }
      
      return true
    })
    
    return selectedProductsHavePrices && getSelectedProducts().length > 0
  }

  // Helper function to format month range from seasonality
  const formatMonthRange = (product: ProcessedProduct): string => {
    const seasonality = product.seasonality
    if (!seasonality || seasonality === 'Year-round') {
      return 'Year Round'
    }
    
    // If it's already a formatted range like "Jan - Apr" or "Oct - Dec", return as is
    if (seasonality.includes(' - ')) {
      return seasonality
    }
    
    // If it's a single month or other format, return as is
    return seasonality
  }

  // Helper function to check if a product is currently in season
  const isProductInSeason = (product: ProcessedProduct): boolean => {
    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-based
    
    // Parse seasonality string (e.g., "Jan - Apr", "Oct - Apr", "Year-round")
    const seasonality = product.seasonality
    if (!seasonality || seasonality === 'Year-round') {
      return true // Always in season
    }
    
    // Extract start and end months from seasonality string
    const seasonMatch = seasonality.match(/(\w{3})\s*-\s*(\w{3})/)
    if (!seasonMatch) {
      return true // If we can't parse, assume in season
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonth = monthNames.indexOf(seasonMatch[1]) + 1
    const endMonth = monthNames.indexOf(seasonMatch[2]) + 1
    
    if (startMonth === 0 || endMonth === 0) {
      return true // If we can't find the months, assume in season
    }
    
    // Handle seasons that cross year boundaries (e.g., Oct-Apr)
    if (startMonth <= endMonth) {
      // Normal season within same year (e.g., Mar-May)
      return currentMonth >= startMonth && currentMonth <= endMonth
    } else {
      // Season crosses year boundary (e.g., Oct-Apr)
      return currentMonth >= startMonth || currentMonth <= endMonth
    }
  }

  // Helper function to check if a product is coming into season within next 2 months or less
  const isProductUpcomingSeason = (product: ProcessedProduct): boolean => {
    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-based
    
    // Parse seasonality string (e.g., "Jan - Apr", "Oct - Apr", "Year-round")
    const seasonality = product.seasonality
    if (!seasonality || seasonality === 'Year-round') {
      return false // Year-round products are not "upcoming"
    }
    
    // Extract start and end months from seasonality string
    const seasonMatch = seasonality.match(/(\w{3})\s*-\s*(\w{3})/)
    if (!seasonMatch) {
      return false // If we can't parse, assume not upcoming
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonth = monthNames.indexOf(seasonMatch[1]) + 1
    
    if (startMonth === 0) {
      return false // If we can't find the start month, assume not upcoming
    }
    
    // Calculate months within 2 months from now (handling year wraparound)
    const upcomingMonths = []
    for (let i = 0; i <= 2; i++) {
      let targetMonth = currentMonth + i
      if (targetMonth > 12) targetMonth -= 12
      upcomingMonths.push(targetMonth)
    }
    
    // Check if the season starts within the next 2 months (including current month)
    return upcomingMonths.includes(startMonth)
  }
  
  // Real data state
  const [products, setProducts] = useState<ProcessedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [productRows, setProductRows] = useState<ProductRow[]>([])

  // Load user's crops and regions
  useEffect(() => {
    loadUserData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter products based on "In Season Only" toggle and category
  useEffect(() => {
    if (products.length === 0) return

    let filteredProducts = products

    // Filter by category
    if (selectedCategory !== 'all') {
      const selectedCategoryData = commodityOptions.find(cat => cat.id === selectedCategory)
      if (selectedCategoryData) {
        const categoryCommmodityIds = selectedCategoryData.commodities.map(c => c.id)
        
        filteredProducts = filteredProducts.filter(product => 
          categoryCommmodityIds.includes(product.commodity.toLowerCase())
        )
      }
    }

    // Filter by season (OR logic when both are selected)
    if (inSeasonOnly || upcomingSeasonOnly) {
      filteredProducts = filteredProducts.filter(product => {
        const inSeason = inSeasonOnly && isProductInSeason(product)
        const upcoming = upcomingSeasonOnly && isProductUpcomingSeason(product)
        
        // If both filters are active, show products that match either condition
        if (inSeasonOnly && upcomingSeasonOnly) {
          return inSeason || upcoming
        }
        // If only one filter is active, show products that match that condition
        return inSeason || upcoming
      })
    }

    // Recreate product rows with filtered products
    const updatedRows: ProductRow[] = filteredProducts.map((product, index) => {
      const packagingOptions = getPackagingOptions(product.commodity)
      const firstPackaging = packagingOptions[0]
      
      // Check if this product already has a row to preserve existing data
      const existingRow = productRows.find(row => row.id === `${product.id}-main`)
      
      return {
        id: `${product.id}-main`,
        productId: index, // Use array index as unique productId
        processingType: existingRow?.processingType || getDefaultProcessingType(product.commodity)?.id,
        packageType: existingRow?.packageType || firstPackaging?.name || 'Standard Package',
        countSize: existingRow?.countSize || (hasCountSize(product.commodity) ? (getCountSizeOptions(product.commodity)[0] || '') : ''),
        grade: existingRow?.grade || getGradeOptions(product.commodity)[0] || 'US No. 1',
        price: existingRow?.price || '',
        marketPrice: existingRow?.marketPrice || '',
        marketPriceUnit: existingRow?.marketPriceUnit || '',
        marketPriceDate: existingRow?.marketPriceDate || '',
        marketPriceLoading: existingRow?.marketPriceLoading || false,
        availability: existingRow?.availability || 'Available',
        isSelected: existingRow?.isSelected || false,
        isPackStyleRow: false
      }
    })

    // Also preserve any pack style rows for products that are still visible
    const packStyleRows = productRows.filter(row => 
      row.isPackStyleRow && 
      filteredProducts.some(product => row.id.startsWith(product.id))
    )

    setProductRows([...updatedRows, ...packStyleRows])
  }, [products, inSeasonOnly, upcomingSeasonOnly, selectedCategory]) // Simplified dependencies

  const loadUserData = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Load crops, shipping points, and custom packaging in parallel
      const [cropsRes, shippingPointsRes, packagingRes] = await Promise.all([
        cropsApi.getAll(),
        shippingPointsApi.getAll(),
        packagingApi.getAll().catch(err => {
          console.warn('Failed to load custom packaging:', err)
          return { packaging: [] }
        })
      ])

      const crops = cropsRes.crops || []
      const userShippingPoints = shippingPointsRes.regions || []
      const customPackagingData = packagingRes.packaging || []

      // Organize custom packaging by commodity
      const packagingByCommodity: Record<string, any[]> = {}
      customPackagingData.forEach((pkg: any) => {
        if (pkg.commodities && Array.isArray(pkg.commodities)) {
          pkg.commodities.forEach((commodity: string) => {
            if (!packagingByCommodity[commodity]) {
              packagingByCommodity[commodity] = []
            }
            packagingByCommodity[commodity].push({
              id: pkg._id,
              type: 'bag', // Default type
              name: pkg.name,
              grades: ['Premium', 'US No. 1'], // Default grades
              isStandard: false,
              commodities: pkg.commodities,
              category: pkg.category || 'specialty',
              description: pkg.description || ''
            })
          })
        }
      })
      
      setCustomPackaging(packagingByCommodity)
      


      // Process crops into products (each variation becomes a product)
      const processedProducts: ProcessedProduct[] = []
      
      crops.forEach((crop: CropManagement) => {
        if (crop.variations && crop.variations.length > 0) {
          crop.variations.forEach((variation: CropVariation) => {
            // Handle both new shippingPoints and legacy growingRegions
            const regionConfigs = variation.shippingPoints || variation.growingRegions || []
            
            regionConfigs.forEach((regionConfig) => {
              const shippingPoint = userShippingPoints.find(sp => 
                sp.id === (regionConfig as any).regionId || 
                sp.id === regionConfig.pointId || 
                sp.name === (regionConfig as any).regionName || 
                sp.name === regionConfig.pointName
              )
              
              if (shippingPoint) {
                const productName = [
                  variation.isOrganic ? 'Organic' : 'Conventional',
                  crop.commodity,
                  variation.subtype,
                  variation.variety
                ].filter(Boolean).join(' ')

                // Handle both availability and seasonality
                const availability = regionConfig.availability || (regionConfig as any).seasonality
                const seasonality = availability ? formatSeasonality(availability) : 'Year-round'

                // Ensure all IDs are defined
                const cropId = crop.id || `crop_${Date.now()}_${Math.random()}`
                const variationId = variation.id || `var_${Date.now()}_${Math.random()}`
                // Use the actual shipping point ID from the database
                const regionId = shippingPoint.id || (regionConfig as any).regionId || regionConfig.pointId || `region_${Date.now()}_${Math.random()}`
                
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
                  variationId: variationId,
                  regionId: regionId
                })
              }
            })
          })
        }
      })


      setProducts(processedProducts)

      // Initialize product rows
      const initialRows: ProductRow[] = processedProducts.map((product, index) => {
        const packagingOptions = getPackagingOptions(product.commodity)
        const firstPackaging = packagingOptions[0]
        
        return {
          id: `${product.id}-main`,
          productId: index, // Use array index as unique productId
          processingType: getDefaultProcessingType(product.commodity)?.id,
          packageType: firstPackaging?.name || 'Standard Package',
          countSize: hasCountSize(product.commodity) ? (getCountSizeOptions(product.commodity)[0] || '') : '',
          grade: getGradeOptions(product.commodity)[0] || 'US No. 1',
          price: '',
          marketPrice: '',
          marketPriceUnit: '',
          marketPriceDate: '',
          marketPriceLoading: false,
          availability: 'Available',
          isSelected: false,
          isPackStyleRow: false
        }
      })

      setProductRows(initialRows)

    } catch (err) {
      console.error('Failed to load user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format seasonality
  const formatSeasonality = (seasonality: { startMonth: number; endMonth: number; isYearRound: boolean }) => {
    if (seasonality.isYearRound) return 'Year-round'
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const startMonth = months[seasonality.startMonth - 1]
    const endMonth = months[seasonality.endMonth - 1]
    
    return `${startMonth} - ${endMonth}`
  }

  const toggleProductSelection = (rowId: string) => {
    setProductRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, isSelected: !row.isSelected } : row
    ))
  }

  const updateRowData = (rowId: string, field: keyof ProductRow, value: string) => {
    setProductRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ))
  }

  const addPackStyle = (productId: string | number) => {
    // productId is now the array index (number), so use it directly
    const numericProductId = typeof productId === 'number' ? productId : parseInt(productId) || 0
    
    // Find the product by matching the productId
    const productRow = productRows.find(row => row.productId === numericProductId && !row.isPackStyleRow)
    if (!productRow) {
      return
    }

    const product = products.find(p => p.id === productRow.id.replace('-main', ''))
    if (!product) {
      return
    }

    const packagingOptions = getPackagingOptions(product.commodity)
    const newRowId = `${numericProductId}-pack-${Date.now()}`
    const newRow: ProductRow = {
      id: newRowId,
      productId: numericProductId,
      packageType: packagingOptions[0]?.name || 'Standard Package',
      countSize: '',
      grade: '',
      price: '',
      marketPrice: '',
      marketPriceUnit: '',
      marketPriceDate: '',
      marketPriceLoading: false,
      availability: 'Available',
      isSelected: false,
      isPackStyleRow: true,
      parentProductId: numericProductId
    }

    setProductRows(prev => {
      // Find the main product row
      const mainRowIndex = prev.findIndex(row => row.productId === numericProductId && !row.isPackStyleRow)
      
      // Find the last pack style row for this product (if any)
      let insertIndex = mainRowIndex + 1
      for (let i = mainRowIndex + 1; i < prev.length; i++) {
        if (prev[i].productId === numericProductId && prev[i].isPackStyleRow) {
          insertIndex = i + 1
        } else {
          break // Stop when we hit a different product
        }
      }
      
      return [...prev.slice(0, insertIndex), newRow, ...prev.slice(insertIndex)]
    })
  }

  const removePackStyle = (rowId: string) => {
    setProductRows(prev => prev.filter(row => row.id !== rowId))
  }

  // Load market price for individual row (used by bulk loader)
  const loadMarketPriceForRow = async (rowId: string) => {
    const row = productRows.find(r => r.id === rowId)
    if (!row) return

    // Find the real product data
    const product = products.find(p => {
      const productRowId = row.id.replace('-main', '').replace(/-pack-\d+$/, '')
      return p.id === productRowId
    })
    
    if (!product) return
    
    // Validate required fields (commodity-aware)
    const missingFields = []
    
    if (!row.packageType) missingFields.push('package type')
    if (!row.grade) missingFields.push('grade')
    if (hasCountSize(product.commodity) && !row.countSize) missingFields.push('count/size')
    
    if (missingFields.length > 0) {
      alert(`Please select ${missingFields.join(', ')} first`)
      return
    }
    
    // Set loading state
    setProductRows(prev => prev.map(r => 
      r.id === rowId ? { ...r, marketPriceLoading: true } : r
    ))
    
    try {
      // Import USDA API service dynamically
      const { fetchUsdaPrice } = await import('../../../../lib/usdaApi')
      
      const result = await fetchUsdaPrice({
        commodity: product.commodity,
        variety: product.variety,
        subtype: product.subtype,
        isOrganic: product.isOrganic,
        packaging: row.packageType,
        countSize: row.countSize,
        grade: row.grade
      })
      
            setProductRows(prev => prev.map(r => 
        r.id === rowId ? { 
          ...r, 
          marketPrice: result.price.toString(),
          marketPriceUnit: result.unit,
          marketPriceDate: result.publishedDate,
          marketPriceSource: result.dataSource,
          marketPriceConfidence: result.confidence,
          marketPriceLoading: false 
        } : r
      ))
    } catch (error) {
      console.error('Failed to fetch USDA price:', error)
      setProductRows(prev => prev.map(r => 
        r.id === rowId ? { 
          ...r, 
          marketPrice: 'Not available for this variety',
          marketPriceUnit: '',
          marketPriceDate: '',
          marketPriceSource: undefined,
          marketPriceConfidence: undefined,
          marketPriceLoading: false
        } : r
      ))
    }
  }

  // Helper function to get confidence dot
  const getConfidenceDot = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return '🟢'
      case 'medium': return '🟡'
      case 'low': return '⚪'
      default: return '⚪'
    }
  }

  // Load all market prices for configured rows
  const loadAllMarketPrices = async () => {
    const eligibleRows = productRows.filter(row => {
      if (row.isPackStyleRow) return false
      
      // Find the real product data
      const product = products.find(p => {
        const productRowId = row.id.replace('-main', '').replace(/-pack-\d+$/, '')
        return p.id === productRowId
      })
      if (!product) return false
      
      // Check required fields based on commodity
      if (!row.packageType || !row.grade) return false
      if (hasCountSize(product.commodity) && !row.countSize) return false
      
      return true
    })
    
    if (eligibleRows.length === 0) {
      alert('Please configure required fields for products first (package type, grade, and count/size where applicable)')
      return
    }
    
    setBulkLoading(true)
    
    // Process rows sequentially to avoid overwhelming the API
    for (const row of eligibleRows) {
      await loadMarketPriceForRow(row.id)
    }
    
    setBulkLoading(false)
  }

  // Generate preview data for base price sheet
  const generatePreviewData = (): PriceSheetProduct[] => {
    const previewProducts: PriceSheetProduct[] = []
    
    // Process each selected product
    getSelectedProducts().forEach(product => {
      const productId = product.id
      const packaging = productPackaging[productId]
      const price = productPrices[productId]
      
      // Skip if no price set
      if (!price || price.trim() === '') return
      
      // Add main product
      previewProducts.push(createPreviewProduct(product, packaging, price, productId))
      
      // Add pack styles for this product
      const packCount = productPackStyles[productId] || 0
      for (let i = 0; i < packCount; i++) {
        const packKey = `${productId}-pack-${i}`
        const packPackaging = productPackaging[packKey] || packaging
        const packPrice = productPrices[packKey]
        
        // Skip pack style if no price set
        if (!packPrice || packPrice.trim() === '') continue
        
        previewProducts.push(createPreviewProduct(product, packPackaging, packPrice, packKey, true))
      }
    })
    
    return previewProducts
  }
  
  const createProductData = (
    product: ProcessedProduct,
    packaging: any,
    price: string
  ) => {
    // Build package description
    let packageDescription = ''
    if (packaging?.packageType && packaging?.size) {
      const config = getCommodityPackaging(product.commodity)
      let packageType: PackageType | undefined
      
      if (config?.hasProcessing && packaging?.processingType) {
        const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
        packageType = processingType?.packageTypes.find(pt => pt.id === packaging.packageType)
      } else if (!config?.hasProcessing) {
        packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
      }
      
      const size = packageType?.sizes.find(s => s.id === packaging.size)
      if (packageType && size) {
        packageDescription = `${size.name} ${packageType.name}`
        
        // Add fruit count for citrus
        if (packaging?.fruitCount && packageType.fruitCounts) {
          const fruitCount = packageType.fruitCounts.find(fc => fc.id === packaging.fruitCount)
          if (fruitCount) {
            packageDescription += ` (${fruitCount.name})`
          }
        }
      }
    }

    return {
      // References (for data integrity)
      cropId: product.cropId,
      variationId: product.variationId,
      regionId: product.regionId,
      
      // Denormalized product details (for performance)
      productName: `${product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)}${product.variety ? `, ${product.variety}` : ''}${product.isOrganic ? ' (Organic)' : ''}`,
      category: product.commodity,
      commodity: product.commodity,
      variety: product.variety,
      subtype: product.subtype,
      isOrganic: product.isOrganic,
      regionName: product.region,
      
      // Pricing and packaging
      packageType: packageDescription || 'Standard Package',
      countSize: undefined, // Not used in new system
      grade: packaging?.grade || 'Standard',
      price: parseFloat(price),
      marketPrice: undefined, // TODO: Add market price integration
      marketPriceUnit: undefined,
      marketPriceDate: undefined,
      availability: 'Available', // Default for now
      isSelected: true,
      customNote: undefined,
      discountPercent: undefined
    }
  }
  
  const createPreviewProduct = (
    product: ProcessedProduct, 
    packaging: any, 
    price: string, 
    id: string,
    isPackStyle: boolean = false
  ): PriceSheetProduct => {
    // Format product name with variety
    let productName = product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)
    if (product.variety) {
      productName += `, ${product.variety}`
    }
    if (product.isOrganic) {
      productName += ' (Organic)'
    }
    
    // Add processing type if available
    if (packaging?.processingType) {
      const config = getCommodityPackaging(product.commodity)
      const processingType = config?.processingTypes?.find(pt => pt.id === packaging.processingType)
      if (processingType) {
        productName += ` - ${processingType.name}`
      }
    }
    
    // Pack styles are equal to main products, no special indicator needed
    
    // Build package description
    let packageDescription = ''
    if (packaging?.packageType && packaging?.size) {
      const config = getCommodityPackaging(product.commodity)
      let packageType: PackageType | undefined
      
      if (config?.hasProcessing && packaging?.processingType) {
        const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
        packageType = processingType?.packageTypes.find(pt => pt.id === packaging.packageType)
      } else if (!config?.hasProcessing) {
        packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
      }
      
      const size = packageType?.sizes.find(s => s.id === packaging.size)
      if (packageType && size) {
        packageDescription = `${size.name} ${packageType.name}`
        
        // Add fruit count for citrus
        if (packaging?.fruitCount && packageType.fruitCounts) {
          const fruitCount = packageType.fruitCounts.find(fc => fc.id === packaging.fruitCount)
          if (fruitCount) {
            packageDescription += ` (${fruitCount.name})`
          }
        }
      }
    }
    
    return {
      id,
      productName,
      region: product.region,
      packageType: packageDescription || 'Standard Package',
      countSize: '', // Not used in new system
      grade: packaging?.grade || 'Standard',
      basePrice: parseFloat(price) || 0,
      adjustedPrice: parseFloat(price) || 0,
      availability: 'Available', // Default for now
      showStrikethrough: false
    }
  }

  const handlePreview = () => {
    setIsPreviewModalOpen(true)
  }

  const handleSendPriceSheet = () => {
    // Close the modal and navigate to send page
    setIsPreviewModalOpen(false)
    router.push('/dashboard/price-sheets/send')
  }

  // Save price sheet to MongoDB
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Get all products with prices (main products and pack styles)
      const productsWithPrices: string[] = []
      
      // Check main products
      getSelectedProducts().forEach(product => {
        const price = productPrices[product.id]
        if (price && price.trim() !== '' && parseFloat(price) > 0) {
          productsWithPrices.push(product.id)
        }
        
        // Check pack styles for this product
        const packCount = productPackStyles[product.id] || 0
        for (let i = 0; i < packCount; i++) {
          const packKey = `${product.id}-pack-${i}`
          const packPrice = productPrices[packKey]
          if (packPrice && packPrice.trim() !== '' && parseFloat(packPrice) > 0) {
            productsWithPrices.push(packKey)
          }
        }
      })

      if (productsWithPrices.length === 0) {
        alert('Please add prices to at least one product before saving.')
        setIsSaving(false)
        return
      }

      // Prepare price sheet data
      const priceSheetData = {
        title: priceSheetTitle,
        status: 'draft' as const,
        notes: undefined
      }

      // Prepare products data using new system
      const productsData: any[] = []
      
      getSelectedProducts().forEach(product => {
        const packaging = productPackaging[product.id]
        const price = productPrices[product.id]
        
        // Add main product if it has a price
        if (price && price.trim() !== '' && parseFloat(price) > 0) {
          productsData.push(createProductData(product, packaging, price))
        }
        
        // Add pack styles for this product
        const packCount = productPackStyles[product.id] || 0
        for (let i = 0; i < packCount; i++) {
          const packKey = `${product.id}-pack-${i}`
          const packPackaging = productPackaging[packKey] || packaging
          const packPrice = productPrices[packKey]
          
          if (packPrice && packPrice.trim() !== '' && parseFloat(packPrice) > 0) {
            productsData.push(createProductData(product, packPackaging, packPrice))
          }
        }
      })

      // Save to backend
      const result = await priceSheetsApi.create({
        priceSheet: priceSheetData,
        products: productsData
      })

      console.log('Price sheet saved:', result)
      
      // Mark as saved
      setHasSaved(true)
      
      // Show success message
      alert(`Price sheet "${priceSheetTitle}" saved successfully with ${productsData.length} products!`)
      
      // Optionally redirect to price sheets list or send page
      // window.location.href = '/dashboard/price-sheets'
      
    } catch (error) {
      console.error('Error saving price sheet:', error)
      alert(`Failed to save price sheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Create New Price Sheet', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading your products...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Create New Price Sheet', current: true }
          ]} 
          className="mb-4"
        />
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadUserData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state if no products
  if (products.length === 0) {
    return (
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Create New Price Sheet', current: true }
          ]} 
          className="mb-4"
        />
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Products Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to set up your crops and growing regions first.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/price-sheets/crops"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Crop
            </Link>
          </div>
        </div>
      </div>
    )
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
          <p className="mt-2 text-gray-600">Generate a professional price sheet using your configured data.</p>
        </div>
      </div>

      <div className="space-y-8">



        {/* Left Panel + Right Panel Builder */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex h-[600px]">
            
            {/* Left Panel - Product Selection */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white">
                <h3 className="font-medium text-gray-900 mb-3">Available Products</h3>
                
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                >
                  <option value="all">All Categories</option>
                  {getAvailableCategories().map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>

                {/* Season Filters */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setInSeasonOnly(!inSeasonOnly)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      inSeasonOnly
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    In Season
                  </button>
                  <button
                    onClick={() => setUpcomingSeasonOnly(!upcomingSeasonOnly)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      upcomingSeasonOnly
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Coming Soon
                  </button>
                </div>

                {/* Select All/Deselect All */}
                {(() => {
                  const visibleProducts = Object.values(getProductsByCommodity()).flat()
                  const visibleCount = visibleProducts.length
                  const selectedVisibleCount = visibleProducts.filter(p => selectedProductIds.has(p.id)).length
                  const allVisibleSelected = visibleCount > 0 && selectedVisibleCount === visibleCount
                  
                  return (
                    <button
                      onClick={() => {
                        if (allVisibleSelected) {
                          // Deselect all visible products
                          const newSelected = new Set(selectedProductIds)
                          visibleProducts.forEach(product => {
                            newSelected.delete(product.id)
                            // Also clean up related state
                            setProductPackStyles(prev => {
                              const newStyles = { ...prev }
                              delete newStyles[product.id]
                              return newStyles
                            })
                            setProductPackaging(prev => {
                              const newPackaging = { ...prev }
                              delete newPackaging[product.id]
                              // Also clean up pack style packaging
                              Object.keys(newPackaging).forEach(key => {
                                if (key.startsWith(`${product.id}-pack-`)) {
                                  delete newPackaging[key]
                                }
                              })
                              return newPackaging
                            })
                            setProductPrices(prev => {
                              const newPrices = { ...prev }
                              delete newPrices[product.id]
                              // Also clean up pack style prices
                              Object.keys(newPrices).forEach(key => {
                                if (key.startsWith(`${product.id}-pack-`)) {
                                  delete newPrices[key]
                                }
                              })
                              return newPrices
                            })
                          })
                          setSelectedProductIds(newSelected)
                        } else {
                          // Select all visible products
                          const newSelected = new Set(selectedProductIds)
                          visibleProducts.forEach(product => {
                            newSelected.add(product.id)
                            // Initialize packaging defaults for new products
                            if (!selectedProductIds.has(product.id)) {
                              initializeProductPackaging(product.id, product.commodity)
                            }
                          })
                          setSelectedProductIds(newSelected)
                        }
                      }}
                      disabled={visibleCount === 0}
                      className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-colors border ${
                        visibleCount === 0
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : allVisibleSelected
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {visibleCount === 0 
                        ? 'No products to select'
                        : allVisibleSelected 
                        ? `Deselect All (${visibleCount})`
                        : `Select All (${visibleCount})`
                      }
                    </button>
                  )
                })()}
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {Object.entries(getProductsByCommodity()).map(([commodity, commodityProducts]) => (
                    <div key={commodity} className="border border-gray-200 rounded-lg bg-white">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                          {commodity.replace('-', ' ')} ({commodityProducts.length})
                        </h4>
                      </div>
                      <div className="p-2 space-y-2">
                        {commodityProducts.slice(0, 3).map((product: any) => (
                          <div
                            key={product.id}
                            className={`p-2 rounded cursor-pointer transition-all ${
                              selectedProductIds.has(product.id)
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                            onClick={() => toggleProductInBuilder(product.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900">
                                  {product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)}
                                  {product.variety && `, ${product.variety}`}
                                </h5>
                                <div className="flex items-center justify-between mt-0.5">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-600">{product.region}</p>
                                    {product.isOrganic && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Organic
                                      </span>
                                    )}
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    isProductInSeason(product)
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : isProductUpcomingSeason(product)
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {formatMonthRange(product)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Configuration */}
            <div className="flex-1 flex flex-col">
              {/* Header with Save Button */}
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">Selected Products ({selectedProductIds.size})</h3>
                  <p className="text-sm text-gray-600">Configure packaging, pricing, and availability</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowPriceInfoModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Pricing Guidance
                  </button>
                </div>
              </div>

              {/* Configuration Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedProductIds.size === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Selected</h4>
                      <p className="text-gray-600">Select products from the left panel to start configuring your price sheet</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="col-span-3">
                        <span className="text-xs font-medium text-gray-700">Product & Region</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-medium text-gray-700">Cut</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs font-medium text-gray-700">Package</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs font-medium text-gray-700">Size</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs font-medium text-gray-700">Count</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs font-medium text-gray-700">Grade</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs font-medium text-gray-700">Price</span>
                      </div>
                    </div>

                    {getSelectedProducts().map((product) => (
                      <div key={product.id} className="space-y-1">
                        {/* Main Product Row */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Product Info with + button - 3 columns */}
                            <div className="col-span-3">
                              <div className="flex items-start space-x-2">
                                <button
                                  onClick={() => addPackStyleForBuilder(product.id)}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors mt-0.5"
                                  title="Add pack style"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)}
                                    {product.variety && `, ${product.variety}`}
                                  </h4>
                                  <p className="text-xs text-gray-600">{product.region}</p>
                                  {product.isOrganic && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      Organic
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Processing Type - 2 columns (if applicable) */}
                            {(() => {
                              const config = getCommodityPackaging(product.commodity)
                              return config?.hasProcessing ? (
                                <div className="col-span-2">
                                  <select 
                                    value={productPackaging[product.id]?.processingType || ''}
                                    onChange={(e) => updateProductPackaging(product.id, 'processingType', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {config.processingTypes?.map(type => (
                                      <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="col-span-2"></div>
                              )
                            })()}

                            {/* Package Type - 1 column */}
                            <div className="col-span-1">
                              <select 
                                value={productPackaging[product.id]?.packageType || ''}
                                onChange={(e) => updateProductPackaging(product.id, 'packageType', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {(() => {
                                  const config = getCommodityPackaging(product.commodity)
                                  const packaging = productPackaging[product.id]
                                  
                                  if (config?.hasProcessing && packaging?.processingType) {
                                    const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
                                    return processingType?.packageTypes.map(pkg => (
                                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                    )) || []
                                  } else if (!config?.hasProcessing) {
                                    return config?.packageTypes?.map(pkg => (
                                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                    )) || []
                                  }
                                  return [<option key="none" value="">Select Package</option>]
                                })()}
                              </select>
                            </div>

                            {/* Size - 1 column */}
                            <div className="col-span-1">
                              <select 
                                value={productPackaging[product.id]?.size || ''}
                                onChange={(e) => updateProductPackaging(product.id, 'size', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {(() => {
                                  const config = getCommodityPackaging(product.commodity)
                                  const packaging = productPackaging[product.id]
                                  
                                  let packageType: PackageType | undefined
                                  
                                  if (config?.hasProcessing && packaging?.processingType && packaging?.packageType) {
                                    const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
                                    packageType = processingType?.packageTypes.find(pt => pt.id === packaging.packageType)
                                  } else if (!config?.hasProcessing && packaging?.packageType) {
                                    packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                  }
                                  
                                  return packageType?.sizes.map(size => (
                                    <option key={size.id} value={size.id}>{size.name}</option>
                                  )) || [<option key="none" value="">Select Size</option>]
                                })()}
                              </select>
                            </div>

                            {/* Fruit Count - 1 column (for citrus only) */}
                            <div className="col-span-1">
                              {(() => {
                                const config = getCommodityPackaging(product.commodity)
                                const packaging = productPackaging[product.id]
                                
                                let packageType: PackageType | undefined
                                
                                if (!config?.hasProcessing && packaging?.packageType) {
                                  packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                }
                                
                                if (packageType?.fruitCounts && packageType.fruitCounts.length > 0) {
                                  return (
                                    <select 
                                      value={productPackaging[product.id]?.fruitCount || ''}
                                      onChange={(e) => updateProductPackaging(product.id, 'fruitCount', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      {packageType.fruitCounts.map(count => (
                                        <option key={count.id} value={count.id}>{count.name}</option>
                                      ))}
                                    </select>
                                  )
                                } else {
                                  return <div className="text-xs text-gray-400">-</div>
                                }
                              })()}
                            </div>

                            {/* Grade - 1 column */}
                            <div className="col-span-1">
                              <select 
                                value={productPackaging[product.id]?.grade || ''}
                                onChange={(e) => updateProductPackaging(product.id, 'grade', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {(() => {
                                  const config = getCommodityPackaging(product.commodity)
                                  return config?.grades.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                  )) || [<option key="standard" value="Standard">Standard</option>]
                                })()}
                              </select>
                            </div>

                            {/* Price - 3 columns */}
                            <div className="col-span-3">
                              <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-xs">$</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={productPrices[product.id] || ''}
                                    onChange={(e) => updateProductPrice(product.id, null, e.target.value)}
                                    className="w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                  />
                                </div>
                                <button
                                  onClick={() => setExpandedOptions(prev => ({
                                    ...prev,
                                    [product.id]: !prev[product.id]
                                  }))}
                                  className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                    expandedOptions[product.id] 
                                      ? 'text-green-600 bg-green-50' 
                                      : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                  }`}
                                >
                                  <svg 
                                    className={`w-3 h-3 transition-transform ${expandedOptions[product.id] ? 'rotate-90' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Additional Options - Inline Expandable Section */}
                          {expandedOptions[product.id] && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="grid grid-cols-2 gap-4">
                                {/* Availability */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                                  <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                    <option>Available</option>
                                    <option>Limited</option>
                                    <option>End Season</option>
                                    <option>Pre-Order</option>
                                    <option>Contact for Availability</option>
                                  </select>
                                </div>
                                
                                {/* Stickers Toggle */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Product Features</label>
                                  <div className="flex items-center space-x-3">
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
                                      />
                                      <span className="ml-2 text-xs text-gray-700">Stickered</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Pack Style Rows */}
                        {getPackStylesForProduct(product.id).map((packIndex) => (
                          <div key={`${product.id}-pack-${packIndex}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:shadow-sm transition-shadow ml-4">
                            <div className="grid grid-cols-12 gap-2 items-center">
                              {/* Product info with remove button */}
                              <div className="col-span-3">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => removePackStyleForBuilder(product.id)}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center border border-red-300 rounded text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                                    title="Remove pack style"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-xs text-gray-500 italic">↳ Additional pack style</span>
                                </div>
                              </div>

                              {/* Processing Type - same as main */}
                              {(() => {
                                const config = getCommodityPackaging(product.commodity)
                                return config?.hasProcessing ? (
                                  <div className="col-span-2">
                                    <select 
                                      value={productPackaging[`${product.id}-pack-${packIndex}`]?.processingType || productPackaging[product.id]?.processingType || ''}
                                      onChange={(e) => updateProductPackaging(`${product.id}-pack-${packIndex}`, 'processingType', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      {config.processingTypes?.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div className="col-span-2"></div>
                                )
                              })()}

                              {/* Package Type */}
                              <div className="col-span-1">
                                <select 
                                  value={productPackaging[`${product.id}-pack-${packIndex}`]?.packageType || productPackaging[product.id]?.packageType || ''}
                                  onChange={(e) => updateProductPackaging(`${product.id}-pack-${packIndex}`, 'packageType', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(() => {
                                    const config = getCommodityPackaging(product.commodity)
                                    const packaging = productPackaging[`${product.id}-pack-${packIndex}`] || productPackaging[product.id]
                                    
                                    if (config?.hasProcessing && packaging?.processingType) {
                                      const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
                                      return processingType?.packageTypes.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                      )) || []
                                    } else if (!config?.hasProcessing) {
                                      return config?.packageTypes?.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                      )) || []
                                    }
                                    return [<option key="none" value="">Select Package</option>]
                                  })()}
                                </select>
                              </div>

                              {/* Size */}
                              <div className="col-span-1">
                                <select 
                                  value={productPackaging[`${product.id}-pack-${packIndex}`]?.size || productPackaging[product.id]?.size || ''}
                                  onChange={(e) => updateProductPackaging(`${product.id}-pack-${packIndex}`, 'size', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(() => {
                                    const config = getCommodityPackaging(product.commodity)
                                    const packaging = productPackaging[`${product.id}-pack-${packIndex}`] || productPackaging[product.id]
                                    
                                    let packageType: PackageType | undefined
                                    
                                    if (config?.hasProcessing && packaging?.processingType && packaging?.packageType) {
                                      const processingType = config.processingTypes?.find(pt => pt.id === packaging.processingType)
                                      packageType = processingType?.packageTypes.find(pt => pt.id === packaging.packageType)
                                    } else if (!config?.hasProcessing && packaging?.packageType) {
                                      packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                    }
                                    
                                    return packageType?.sizes.map(size => (
                                      <option key={size.id} value={size.id}>{size.name}</option>
                                    )) || [<option key="none" value="">Select Size</option>]
                                  })()}
                                </select>
                              </div>

                              {/* Fruit Count - 1 column (for citrus only) */}
                              <div className="col-span-1">
                                {(() => {
                                  const config = getCommodityPackaging(product.commodity)
                                  const packaging = productPackaging[`${product.id}-pack-${packIndex}`] || productPackaging[product.id]
                                  
                                  let packageType: PackageType | undefined
                                  
                                  if (!config?.hasProcessing && packaging?.packageType) {
                                    packageType = config?.packageTypes?.find(pt => pt.id === packaging.packageType)
                                  }
                                  
                                  if (packageType?.fruitCounts && packageType.fruitCounts.length > 0) {
                                    return (
                                      <select 
                                        value={productPackaging[`${product.id}-pack-${packIndex}`]?.fruitCount || productPackaging[product.id]?.fruitCount || ''}
                                        onChange={(e) => updateProductPackaging(`${product.id}-pack-${packIndex}`, 'fruitCount', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        {packageType.fruitCounts.map(count => (
                                          <option key={count.id} value={count.id}>{count.name}</option>
                                        ))}
                                      </select>
                                    )
                                  } else {
                                    return <div className="text-xs text-gray-400">-</div>
                                  }
                                })()}
                              </div>

                              {/* Grade */}
                              <div className="col-span-1">
                                <select 
                                  value={productPackaging[`${product.id}-pack-${packIndex}`]?.grade || productPackaging[product.id]?.grade || ''}
                                  onChange={(e) => updateProductPackaging(`${product.id}-pack-${packIndex}`, 'grade', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(() => {
                                    const config = getCommodityPackaging(product.commodity)
                                    return config?.grades.map(grade => (
                                      <option key={grade} value={grade}>{grade}</option>
                                    )) || [<option key="standard" value="Standard">Standard</option>]
                                  })()}
                                </select>
                              </div>

                              {/* Price - 3 columns */}
                              <div className="col-span-3">
                                <div className="flex items-center space-x-2">
                                  <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-xs">$</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={productPrices[`${product.id}-pack-${packIndex}`] || ''}
                                      onChange={(e) => updateProductPrice(product.id, packIndex, e.target.value)}
                                      className="w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <button
                                    onClick={() => setExpandedOptions(prev => ({
                                      ...prev,
                                      [`${product.id}-pack-${packIndex}`]: !prev[`${product.id}-pack-${packIndex}`]
                                    }))}
                                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                      expandedOptions[`${product.id}-pack-${packIndex}`] 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                    }`}
                                  >
                                    <svg 
                                      className={`w-3 h-3 transition-transform ${expandedOptions[`${product.id}-pack-${packIndex}`] ? 'rotate-90' : ''}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional Options - Inline Expandable Section for Pack Styles */}
                            {expandedOptions[`${product.id}-pack-${packIndex}`] && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Availability */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                                    <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                      <option>Available</option>
                                      <option>Limited</option>
                                      <option>End Season</option>
                                      <option>Pre-Order</option>
                                      <option>Contact for Availability</option>
                                    </select>
                                  </div>
                                  
                                  {/* Stickers Toggle */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Features</label>
                                    <div className="flex items-center space-x-3">
                                      <label className="flex items-center">
                                        <input
                                          type="checkbox"
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
                                        />
                                        <span className="ml-2 text-xs text-gray-700">Stickered</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Original Products and Pricing (Hidden for Demo) */}
        <div className="bg-white shadow rounded-lg" style={{display: 'none'}}>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Products and Pricing</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure products, then refresh market prices for guidance. Products are pre-populated from your crop management data.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {productRows.filter(row => !row.isPackStyleRow).length} products
                {selectedCategory !== 'all' && (
                  <span> in {commodityOptions.find(cat => cat.id === selectedCategory)?.name}</span>
                )}
                {(inSeasonOnly || upcomingSeasonOnly) && (
                  <span>
                    {inSeasonOnly && upcomingSeasonOnly ? ' (in season or upcoming)' : 
                     inSeasonOnly ? ' (in season)' : ' (upcoming season)'}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <div className="flex items-center">
                <label htmlFor="category-filter" className="text-sm text-gray-700 mr-2">
                  Category:
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {getAvailableCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* In Season Only Toggle */}
              <div className="flex items-center">
                <input
                  id="in-season-toggle"
                  type="checkbox"
                  checked={inSeasonOnly}
                  onChange={(e) => setInSeasonOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="in-season-toggle" className="ml-2 text-sm text-gray-700">
                  In Season Only
                </label>
              </div>

              {/* Upcoming Season Toggle */}
              <div className="flex items-center">
                <input
                  id="upcoming-season-toggle"
                  type="checkbox"
                  checked={upcomingSeasonOnly}
                  onChange={(e) => setUpcomingSeasonOnly(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="upcoming-season-toggle" className="ml-2 text-sm text-gray-700">
                  Upcoming Season
                </label>
              </div>
              
              {/* Load USDA Data Button */}
              <button
                onClick={loadAllMarketPrices}
                disabled={bulkLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    🔄 Load USDA Data
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-2 py-3 text-center">
                    {/* No text - just checkbox column */}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Processing Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Package & Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        <button
                          onClick={() => setShowPriceInfoModal(true)}
                          className="flex items-center"
                        >
                          <svg className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 font-normal">USDA-LA</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Availability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productRows.map((row) => {
                  // Find the real product data
                  const product = products.find(p => {
                    if (row.isPackStyleRow) {
                      // For pack style rows, find the parent product by productId
                      const parentRow = productRows.find(r => r.productId === row.productId && !r.isPackStyleRow)
                      if (parentRow) {
                        const productRowId = parentRow.id.replace('-main', '')
                        return p.id === productRowId
                      }
                      return false
                    } else {
                      // For main rows, use the existing logic
                      const productRowId = row.id.replace('-main', '').replace(/-pack-\d+$/, '')
                      return p.id === productRowId
                    }
                  })
                  if (!product) {
                    return null
                  }

                  return (
                    <tr key={row.id} className={`${row.isPackStyleRow ? 'bg-gray-50' : ''}`}>
                      <td className="w-12 px-2 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.isSelected}
                          onChange={() => toggleProductSelection(row.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      
                      <td className="px-4 py-4">
                        {row.isPackStyleRow ? (
                          <div className="ml-6 text-sm text-gray-600">
                            ↳ Additional Pack Style
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.commodity}{product.variety ? `, ${product.variety}` : ''}
                            </div>
                            <div className="flex items-center mt-0.5">
                              <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                isProductInSeason(product) 
                                  ? 'bg-green-400' 
                                  : isProductUpcomingSeason(product)
                                  ? 'bg-orange-400'
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-xs text-gray-500">
                                {product.seasonality || 'Year-round'}
                              </span>
                            </div>
                            {product.isOrganic && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                Organic
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      
                      {/* Processing Type */}
                      <td className="w-28 px-4 py-4">
                        {(() => {
                          const config = getCommodityPackaging(product.commodity)
                          return config?.hasProcessing ? (
                            <select
                              value={row.processingType || ''}
                              onChange={(e) => updateRowData(row.id, 'processingType', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                            >
                              <option value="">-</option>
                              {config.processingTypes?.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )
                        })()}
                      </td>
                      
                      {/* Combined Package & Size */}
                      <td className="w-32 px-4 py-4">
                        <div className="space-y-1">
                          <select
                            value={row.packageType}
                            onChange={(e) => updateRowData(row.id, 'packageType', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                          >
                            {getPackagingOptions(product.commodity).map((pkg, idx) => (
                              <option 
                                key={idx} 
                                value={pkg.name}
                                className={!pkg.isStandard ? 'bg-blue-50 font-medium' : ''}
                              >
                                {!pkg.isStandard ? '🔧 ' : ''}{pkg.name}{!pkg.isStandard ? ' (Custom)' : ''}
                              </option>
                            ))}
                          </select>
                          {hasCountSize(product.commodity) && (
                            <select
                              value={row.countSize || ''}
                              onChange={(e) => updateRowData(row.id, 'countSize', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                            >
                              <option value="">Select size...</option>
                              {getCountSizeOptions(product.commodity).map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      
                      {/* Grade */}
                      <td className="w-20 px-4 py-4">
                        <select
                          value={row.grade || ''}
                          onChange={(e) => updateRowData(row.id, 'grade', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          <option value="">-</option>
                          {getGradeOptions(product.commodity).map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </td>
                      
                      {/* Combined Price Column */}
                      <td className="w-48 px-4 py-4">
                        {/* Your Price Input */}
                        <div className="relative mb-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                            <span className="text-gray-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => updateRowData(row.id, 'price', e.target.value)}
                            className="pl-6 pr-2 py-1.5 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                            placeholder="0.00"
                          />
                        </div>
                        
                        {/* USDA Market Price Below */}
                        <div className="text-xs text-gray-600">
                          {row.marketPriceLoading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading...</span>
                            </div>
                          ) : row.marketPrice && row.marketPrice !== 'Error' ? (
                            <div className="flex items-center space-x-1">
                              {row.marketPriceConfidence && (
                                <span>{getConfidenceDot(row.marketPriceConfidence)}</span>
                              )}
                              <span className="font-medium text-gray-700">${row.marketPrice}</span>
                              {row.marketPriceUnit && (
                                <span className="text-gray-500">/ {row.marketPriceUnit}</span>
                              )}
                            </div>
                          ) : row.marketPrice === 'Error' ? (
                            <span className="text-red-500">Error loading</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="w-36 px-4 py-4">
                        <select
                          value={row.availability}
                          onChange={(e) => updateRowData(row.id, 'availability', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          {availabilityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="w-32 px-4 py-4 text-sm font-medium">
                        {row.isPackStyleRow ? (
                          <button
                            onClick={() => removePackStyle(row.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addPackStyle(row.productId)}
                            className="inline-flex items-center justify-center w-6 h-6 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                            title="Add pack style"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>




        {/* Generate Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/price-sheets"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!canPreviewPriceSheet()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview Price Sheet
          </button>
        </div>
      </div>

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

      {/* Price Information Modal */}
      {showPriceInfoModal && (
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Market Price Confidence Levels & Calculations</h3>
              <button
                onClick={() => setShowPriceInfoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="font-medium text-green-600 mb-2">🟢 High Confidence (USDA-Exact):</p>
                  <p className="text-sm text-gray-700 ml-4">
                    Exact USDA data match for well-known commodities (lettuce, strawberries, tomatoes, carrots, apples) with variety-specific and organic adjustments.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-yellow-600 mb-2">🟡 Medium Confidence (USDA-Estimated):</p>
                  <p className="text-sm text-gray-700 ml-4 mb-2">USDA base data with calculated adjustments:</p>
                  <ul className="ml-8 text-sm text-gray-700 space-y-1">
                    <li>• <span className="font-medium">Organic premiums:</span> 25-60% higher (varies by commodity)</li>
                    <li>• <span className="font-medium">Variety adjustments:</span> ±25% based on market demand</li>
                    <li>• <span className="font-medium">Examples:</span> Butterhead lettuce +25%, Organic strawberries +60%</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-600 mb-2">⚪ Low Confidence (Calculated):</p>
                  <p className="text-sm text-gray-700 ml-4">
                    Estimated pricing based on commodity averages with standard market price ranges (±15% variation).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Data Source:</span> USDA Market News Service - Los Angeles Terminal Market. 
                    Prices represent wholesale "mostly" prices and should be used as guidance only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}