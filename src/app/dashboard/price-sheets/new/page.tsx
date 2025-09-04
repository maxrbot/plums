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
import PriceSheetPreviewModal from '../../../../components/modals/PriceSheetPreviewModal'
import { getPackagingSpecs } from '../../../../config/packagingSpecs'
import { commodityOptions } from '../../../../config/commodityOptions'
import { cropsApi, regionsApi, priceSheetsApi, packagingApi } from '../../../../lib/api'
import type { CropManagement, CropVariation } from '../../../../types'

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
  const [priceSheetTitle, setPriceSheetTitle] = useState(`AcreList Price Sheet - ${new Date().toLocaleDateString()}`)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [inSeasonOnly, setInSeasonOnly] = useState(false)
  const [upcomingSeasonOnly, setUpcomingSeasonOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPriceInfoModal, setShowPriceInfoModal] = useState(false)

  // State for custom packaging
  const [customPackaging, setCustomPackaging] = useState<Record<string, any[]>>({})

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

      // Load crops, regions, and custom packaging in parallel
      const [cropsRes, regionsRes, packagingRes] = await Promise.all([
        cropsApi.getAll(),
        regionsApi.getAll(),
        packagingApi.getAll().catch(err => {
          console.warn('Failed to load custom packaging:', err)
          return { packaging: [] }
        })
      ])

      const crops = cropsRes.crops || []
      const userRegions = regionsRes.regions || []
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
            // For each growing region in the variation
            variation.growingRegions.forEach((regionConfig) => {
              const region = userRegions.find(r => r.id === regionConfig.regionId || r.name === regionConfig.regionName)
              
              if (region) {
                const productName = [
                  variation.isOrganic ? 'Organic' : 'Conventional',
                  crop.commodity,
                  variation.subtype,
                  variation.variety
                ].filter(Boolean).join(' ')

                const seasonality = formatSeasonality(regionConfig.seasonality)

                // Ensure all IDs are defined
                const cropId = crop.id || `crop_${Date.now()}_${Math.random()}`
                const variationId = variation.id || `var_${Date.now()}_${Math.random()}`
                const regionId = regionConfig.regionId || `region_${Date.now()}_${Math.random()}`
                
                processedProducts.push({
                  id: `${cropId}-${variationId}-${regionId}`,
                  name: productName,
                  region: region.name,
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
  const generatePreviewData = (): PreviewProduct[] => {
    // Include both selected main rows AND pack style rows with prices
    const selectedRows = productRows.filter(row => 
      (row.isSelected && row.price) || // Main rows that are selected
      (row.isPackStyleRow && row.price) // Pack style rows with prices (regardless of selection)
    )
    
    return selectedRows.map((row): PreviewProduct | null => {
      // Find the real product data
      let product: ProcessedProduct | undefined

      if (row.isPackStyleRow) {
        // For pack style rows, find the parent product using parentProductId
        const parentRow = productRows.find(r => 
          r.productId === row.parentProductId && !r.isPackStyleRow
        )
        if (parentRow) {
          const parentProductId = parentRow.id.replace('-main', '')
          product = products.find(p => p.id === parentProductId)
        }
      } else {
        // For main rows, use the standard lookup
        const productRowId = row.id.replace('-main', '')
        product = products.find(p => p.id === productRowId)
      }

      if (!product) return null

      const basePrice = parseFloat(row.price)

      return {
        id: row.id,
        productName: product.name,
        region: product.region,
        packageType: row.packageType,
        countSize: row.countSize,
        grade: row.grade,
        basePrice,
        adjustedPrice: basePrice, // No adjustment in base sheet
        marketPrice: row.marketPrice ? parseFloat(row.marketPrice) : undefined,
        availability: row.availability
      }
    }).filter((product): product is PreviewProduct => product !== null)
  }

  const handlePreview = () => {
    setIsPreviewModalOpen(true)
  }

  // Save price sheet to MongoDB
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Get all rows with prices (both selected main rows and pack style rows)
      const rowsToSave = productRows.filter(row => 
        ((row.isSelected && row.price) || (row.isPackStyleRow && row.price)) && 
        parseFloat(row.price) > 0
      )

      if (rowsToSave.length === 0) {
        alert('Please add prices to at least one product before saving.')
        setIsSaving(false)
        return
      }

      // Prepare price sheet data
      const priceSheetData = {
        title: priceSheetTitle,
        status: 'draft' as const,
        notes: additionalNotes || undefined
      }

      // Prepare products data
      const productsData = rowsToSave.map(row => {
        // Find the real product data
        let product: ProcessedProduct | undefined

        if (row.isPackStyleRow) {
          // For pack style rows, find the parent product using parentProductId
          const parentRow = productRows.find(r => 
            r.productId === row.parentProductId && !r.isPackStyleRow
          )
          if (parentRow) {
            const parentProductId = parentRow.id.replace('-main', '')
            product = products.find(p => p.id === parentProductId)
          }
        } else {
          // For main rows, use the standard lookup
          const productRowId = row.id.replace('-main', '')
          product = products.find(p => p.id === productRowId)
        }

        if (!product) {
          console.error('Product lookup failed:', {
            rowId: row.id,
            isPackStyleRow: row.isPackStyleRow,
            parentProductId: row.parentProductId,
            productId: row.productId,
            availableProducts: products.map(p => ({ id: p.id, name: p.name }))
          })
          throw new Error(`Product not found for row ${row.id}${row.isPackStyleRow ? ` (pack style, parent: ${row.parentProductId})` : ''}`)
        }

        return {
          // References (for data integrity)
          cropId: product.cropId, // This will be converted to ObjectId on backend
          variationId: product.variationId,
          regionId: product.regionId, // This will be converted to ObjectId on backend
          
          // Denormalized product details (for performance)
          productName: product.name, // e.g., "Organic Lime Key Lime"
          category: product.commodity, // Using commodity as category for now
          commodity: product.commodity,
          variety: product.variety,
          subtype: product.subtype,
          isOrganic: product.isOrganic,
          regionName: product.region,
          
          // Pricing and packaging
          packageType: row.packageType,
          countSize: row.countSize || undefined,
          grade: row.grade || undefined,
          price: parseFloat(row.price),
          marketPrice: row.marketPrice ? parseFloat(row.marketPrice) : undefined,
          marketPriceUnit: row.marketPriceUnit || undefined,
          marketPriceDate: row.marketPriceDate ? new Date(row.marketPriceDate) : undefined,
          availability: row.availability,
          isSelected: row.isSelected || row.isPackStyleRow, // Pack style rows are considered selected
          customNote: undefined,
          discountPercent: undefined
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
        {/* Price Sheet Title */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Price Sheet Details</h2>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Price Sheet Title
            </label>
            <input
              type="text"
              id="title"
              value={priceSheetTitle}
              onChange={(e) => setPriceSheetTitle(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter price sheet title"
            />
          </div>
        </div>



        {/* Products and Pricing */}
        <div className="bg-white shadow rounded-lg">
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



        {/* Additional Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            rows={4}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any additional notes, terms, or special information for this price sheet..."
          />
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
            disabled={productRows.filter(row => row.isSelected && row.price).length === 0}
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
        products={generatePreviewData()}
        additionalNotes={additionalNotes}
        onSave={handleSave}
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