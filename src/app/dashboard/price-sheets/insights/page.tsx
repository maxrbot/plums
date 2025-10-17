'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowPathIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { fetchUsdaPrice, getAvailableMarkets } from '@/lib/usdaApi'
import { cropsApi } from '@/lib/api'
import { allCommodities as commodities, type CommodityConfig } from '@/config'

interface CropVariation {
  _id: string
  commodity: string
  variety: string
  subtype?: string
  isOrganic: boolean
  growingRegion: string
  seasonality: string[]
  packagingTypes: string[]
  certifications: string[]
}

interface MarketData {
  high: string
  low: string
  mostly: string
  unit: string
  date: string
  confidence: 'high' | 'medium' | 'low'
  dataSource: 'usda-exact' | 'usda-estimated' | 'calculated'
}

interface RetailPrice {
  retailer: string
  price: string
  unit: string
  salePrice?: string
  promotion?: string
  location: string
  date: string
  source: 'scraped' | 'manual' | 'api'
}

interface RetailPriceData {
  commodity: string
  variety?: string
  isOrganic: boolean
  prices: RetailPrice[]
  averagePrice?: number
  markupFromWholesale?: number
}

interface CropMarketData extends CropVariation {
  marketData?: MarketData
  loading: boolean
  error?: string
}

type TabType = 'usda' | 'retail' | 'structure'

export default function MarketInsightsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('usda')
  const [crops, setCrops] = useState<CropMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedMarket, setSelectedMarket] = useState('los-angeles')
  const [availableMarkets] = useState(getAvailableMarkets())
  const [showConfidenceModal, setShowConfidenceModal] = useState(false)
  const [retailPriceData, setRetailPriceData] = useState<RetailPriceData[]>([])
  const [retailLoading, setRetailLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedCommodities, setExpandedCommodities] = useState<Set<string>>(new Set())
  const [expandedVarieties, setExpandedVarieties] = useState<Set<string>>(new Set())

  // Helper functions for expansion state
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
      // Also collapse all commodities and varieties within this category
      const commoditiesInCategory = commodities.filter(c => c.category === categoryName)
      const newExpandedCommodities = new Set(expandedCommodities)
      const newExpandedVarieties = new Set(expandedVarieties)
      
      commoditiesInCategory.forEach(commodity => {
        newExpandedCommodities.delete(commodity.id)
        // Remove all varieties for this commodity
        const varietiesToRemove = Array.from(expandedVarieties).filter(v => v.startsWith(`${commodity.id}-`))
        varietiesToRemove.forEach(v => newExpandedVarieties.delete(v))
      })
      
      setExpandedCommodities(newExpandedCommodities)
      setExpandedVarieties(newExpandedVarieties)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleCommodity = (commodityId: string) => {
    const newExpanded = new Set(expandedCommodities)
    if (newExpanded.has(commodityId)) {
      newExpanded.delete(commodityId)
      // Also collapse all varieties within this commodity
      const varietiesToRemove = Array.from(expandedVarieties).filter(v => v.startsWith(`${commodityId}-`))
      const newExpandedVarieties = new Set(expandedVarieties)
      varietiesToRemove.forEach(v => newExpandedVarieties.delete(v))
      setExpandedVarieties(newExpandedVarieties)
    } else {
      newExpanded.add(commodityId)
    }
    setExpandedCommodities(newExpanded)
  }

  const toggleVariety = (commodityId: string, varietyId: string) => {
    const varietyKey = `${commodityId}-${varietyId}`
    const newExpanded = new Set(expandedVarieties)
    if (newExpanded.has(varietyKey)) {
      newExpanded.delete(varietyKey)
    } else {
      newExpanded.add(varietyKey)
    }
    setExpandedVarieties(newExpanded)
  }

  // Mock function to simulate retail price scraping based on user's commodities
  const loadRetailPriceData = useCallback(async (userCrops: CropMarketData[]) => {
    setRetailLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Get unique commodities from user's crops
    const userCommodities = [...new Set(userCrops.map(crop => crop.commodity))]
    
    // Define comprehensive retail price templates for common commodities
    const retailPriceTemplates: Record<string, Omit<RetailPriceData, 'commodity'>> = {
      strawberry: {
        variety: 'Mixed Varieties',
        isOrganic: false, // We'll create both organic and conventional
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '6.99',
            unit: 'per lb',
            salePrice: '5.99',
            promotion: 'Weekly Sale',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '4.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Safeway',
            price: '5.49',
            unit: 'per lb',
            salePrice: '4.49',
            promotion: 'Buy 2 Get 1 Free',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 5.16,
        markupFromWholesale: 172
      },
      lettuce: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '2.99',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '1.99',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Vons',
            price: '2.49',
            unit: 'per head',
            salePrice: '1.99',
            promotion: 'Digital Coupon',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 2.32,
        markupFromWholesale: 132
      },
      tomato: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '3.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Sprouts',
            price: '2.99',
            unit: 'per lb',
            salePrice: '2.49',
            promotion: 'Manager Special',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '3.49',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 3.32,
        markupFromWholesale: 145
      },
      cucumber: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '1.99',
            unit: 'each',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '1.49',
            unit: 'each',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Vons',
            price: '1.79',
            unit: 'each',
            salePrice: '1.29',
            promotion: '3 for $3',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 1.52,
        markupFromWholesale: 118
      },
      carrot: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '2.49',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '1.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Safeway',
            price: '2.29',
            unit: 'per lb',
            salePrice: '1.79',
            promotion: 'Weekly Special',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 2.02,
        markupFromWholesale: 125
      },
      broccoli: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '3.49',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Sprouts',
            price: '2.99',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '3.29',
            unit: 'per head',
            salePrice: '2.79',
            promotion: 'Digital Deal',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 3.02,
        markupFromWholesale: 138
      },
      spinach: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '4.99',
            unit: 'per 5oz bag',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '3.99',
            unit: 'per 5oz bag',
            salePrice: '2.99',
            promotion: 'Buy 2 Save $2',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Vons',
            price: '4.49',
            unit: 'per 5oz bag',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 4.16,
        markupFromWholesale: 165
      },
      bell_pepper: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '2.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '2.49',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Safeway',
            price: '2.79',
            unit: 'per lb',
            salePrice: '1.99',
            promotion: 'Weekend Sale',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 2.42,
        markupFromWholesale: 142
      },
      celery: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '2.49',
            unit: 'per bunch',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '1.99',
            unit: 'per bunch',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Vons',
            price: '2.29',
            unit: 'per bunch',
            salePrice: '1.79',
            promotion: 'Digital Deal',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 2.02,
        markupFromWholesale: 128
      },
      broccoli: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '3.49',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Sprouts',
            price: '2.99',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '3.29',
            unit: 'per head',
            salePrice: '2.79',
            promotion: 'Digital Deal',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 3.02,
        markupFromWholesale: 138
      },
      cauliflower: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '4.99',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '3.99',
            unit: 'per head',
            salePrice: '2.99',
            promotion: 'Weekly Special',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Safeway',
            price: '4.49',
            unit: 'per head',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 4.16,
        markupFromWholesale: 155
      },
      asparagus: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '5.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Sprouts',
            price: '4.99',
            unit: 'per lb',
            salePrice: '3.99',
            promotion: 'Manager Special',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Ralphs',
            price: '5.49',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 5.16,
        markupFromWholesale: 185
      },
      eggplant: {
        variety: 'Mixed Varieties',
        isOrganic: false,
        prices: [
          {
            retailer: 'Whole Foods Market',
            price: '3.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Kroger',
            price: '2.99',
            unit: 'per lb',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          },
          {
            retailer: 'Vons',
            price: '3.49',
            unit: 'per lb',
            salePrice: '2.79',
            promotion: 'Buy 2 Get 1 Free',
            location: 'Los Angeles, CA',
            date: new Date().toISOString().split('T')[0],
            source: 'scraped'
          }
        ],
        averagePrice: 3.09,
        markupFromWholesale: 148
      }
    }
    
    // Generate retail data for user's commodities
    const mockRetailData: RetailPriceData[] = []
    
    userCommodities.forEach(commodity => {
      const template = retailPriceTemplates[commodity]
      if (template) {
        // Check if user has organic versions of this commodity
        const hasOrganic = userCrops.some(crop => crop.commodity === commodity && crop.isOrganic)
        const hasConventional = userCrops.some(crop => crop.commodity === commodity && !crop.isOrganic)
        
        // Add conventional version if user has it
        if (hasConventional) {
          mockRetailData.push({
            commodity,
            ...template,
            isOrganic: false
          })
        }
        
        // Add organic version if user has it (with premium pricing)
        if (hasOrganic) {
          const organicPrices = template.prices.map(price => ({
            ...price,
            price: (parseFloat(price.price) * 1.4).toFixed(2), // 40% organic premium
            salePrice: price.salePrice ? (parseFloat(price.salePrice) * 1.4).toFixed(2) : undefined
          }))
          
          mockRetailData.push({
            commodity,
            variety: 'Organic Mixed Varieties',
            isOrganic: true,
            prices: organicPrices,
            averagePrice: template.averagePrice ? template.averagePrice * 1.4 : undefined,
            markupFromWholesale: template.markupFromWholesale ? Math.round(template.markupFromWholesale * 1.2) : undefined
          })
        }
      }
    })
    
    setRetailPriceData(mockRetailData)
    setRetailLoading(false)
  }, [])

  const loadCropsWithMarketData = useCallback(async () => {
    try {
      // Fetch user's crops from backend API
      const response = await cropsApi.getAll()
      const backendCrops = response.crops || []
      
      // Flatten variations to get individual product variations
      const cropsData: CropVariation[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backendCrops.forEach((crop: any) => {
        if (crop.variations && crop.variations.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          crop.variations.forEach((variation: any) => {
            cropsData.push({
              _id: `${crop._id}-${variation.id}`,
              commodity: crop.commodity,
              variety: variation.variety,
              subtype: variation.subtype,
              isOrganic: variation.isOrganic,
              growingRegion: variation.growingRegion,
              seasonality: variation.seasonality || [],
              packagingTypes: variation.packagingTypes || [],
              certifications: variation.certifications || []
            })
          })
        }
      })
      
      // Initialize crops with loading state
      const cropsWithLoading: CropMarketData[] = cropsData.map(crop => ({
        ...crop,
        loading: true
      }))
      setCrops(cropsWithLoading)
      setLoading(false)

      // Fetch market data for each crop variation
      const updatedCrops = await Promise.all(
        cropsData.map(async (crop) => {
          try {
            const marketPrice = await fetchUsdaPrice({
              commodity: crop.commodity,
              variety: crop.variety,
              subtype: crop.subtype,
              isOrganic: crop.isOrganic,
              market: selectedMarket,
              packaging: (crop.packagingTypes && crop.packagingTypes[0]) || 'Standard Package',
              grade: 'US No. 1',
              countSize: ''
            })

            const marketData: MarketData = {
              high: marketPrice.priceRange?.high?.toString() || '',
              low: marketPrice.priceRange?.low?.toString() || '',
              mostly: marketPrice.priceRange?.mostly?.toString() || marketPrice.price?.toString() || '',
              unit: marketPrice.unit || '',
              date: marketPrice.publishedDate || '',
              confidence: marketPrice.confidence || 'low',
              dataSource: marketPrice.dataSource || 'calculated'
            }

            return {
              ...crop,
              marketData,
              loading: false
            }
          } catch (error) {
            console.error(`Error fetching market data for ${crop.commodity} ${crop.variety}:`, error)
            return {
              ...crop,
              loading: false,
              error: 'Failed to load market data'
            }
          }
        })
      )

      setCrops(updatedCrops)
      setLastUpdated(new Date())
      
      // Load retail pricing data based on the loaded crops
      loadRetailPriceData(updatedCrops)
    } catch (error) {
      console.error('Error loading crops:', error)
      setLoading(false)
    }
  }, [selectedMarket, loadRetailPriceData])

  useEffect(() => {
    loadCropsWithMarketData()
  }, [loadCropsWithMarketData])

  useEffect(() => {
    // Reload data when market changes (but not on initial load)
    if (crops.length > 0) {
      loadCropsWithMarketData()
    }
  }, [selectedMarket, crops.length, loadCropsWithMarketData])

  const refreshMarketData = () => {
    loadCropsWithMarketData()
    // Retail data will be refreshed automatically when crops are loaded
  }

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getConfidenceDot = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return '🟢'
      case 'medium': return '🟡'
      case 'low': return '⚪'
      default: return '⚪'
    }
  }

  const getUsdaReportUrl = (commodity: string) => {
    // Determine if it's a fruit or vegetable
    const fruitCommodities = ['orange', 'lemon', 'lime', 'strawberry', 'apple', 'grape']
    const category = fruitCommodities.includes(commodity) ? 'fruits' : 'vegetables'
    
    // Use the main USDA Market News search page - this is the working public interface
    return `https://mymarketnews.ams.usda.gov/viewReport/3006`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading market intelligence...</p>
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
            { label: 'Market Intelligence', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Intelligence</h1>
            <p className="text-gray-600">USDA pricing data and retail market insights for your crops</p>
            </div>
            <button
              onClick={refreshMarketData}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Refresh all market data"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('usda')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'usda'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                USDA Wholesale Pricing
              </button>
              <button
                onClick={() => setActiveTab('retail')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'retail'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Retail Price Intelligence
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Beta
                </span>
              </button>
              <button
                onClick={() => setActiveTab('structure')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'structure'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Commodity Structure
              </button>
            </nav>
          </div>
        </div>

        {/* USDA Pricing Tab Content */}
        {activeTab === 'usda' && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-medium text-gray-900">Your Crops Market Data</h2>
                  {lastUpdated && (
                    <span className="text-sm text-gray-500">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {/* Market Selector */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="market-select" className="text-sm font-medium text-gray-700">
                      Market:
                    </label>
                    <select
                      id="market-select"
                      value={selectedMarket}
                      onChange={(e) => setSelectedMarket(e.target.value)}
                      className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableMarkets.map((market) => (
                        <option key={market.id} value={market.id}>
                          {market.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No crops found. Add crops in the Crop Management page to see market data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        High Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Low Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mostly Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => setShowConfidenceModal(true)}
                          className="hover:text-blue-600 underline decoration-dotted underline-offset-2 cursor-pointer"
                        >
                          Confidence
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crops.map((crop) => (
                      <tr key={crop._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {crop.commodity.charAt(0).toUpperCase() + crop.commodity.slice(1)} {crop.variety}
                            </div>
                            {crop.subtype && (
                              <div className="text-sm text-gray-500">{crop.subtype}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            crop.isOrganic 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {crop.isOrganic ? 'Organic' : 'Conventional'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {crop.loading ? (
                            <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                          ) : crop.error ? (
                            <span className="text-red-500">Error</span>
                          ) : crop.marketData?.unit ? (
                            crop.marketData.unit
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.loading ? (
                            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                          ) : crop.error ? (
                            <span className="text-red-500">Error</span>
                          ) : crop.marketData?.high ? (
                            `$${crop.marketData.high}`
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.loading ? (
                            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                          ) : crop.error ? (
                            <span className="text-red-500">Error</span>
                          ) : crop.marketData?.low ? (
                            `$${crop.marketData.low}`
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.loading ? (
                            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                          ) : crop.error ? (
                            <span className="text-red-500">Error</span>
                          ) : crop.marketData?.mostly ? (
                            `$${crop.marketData.mostly}`
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {crop.loading ? (
                            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                          ) : crop.error ? (
                            <span className="text-red-500">Error</span>
                          ) : crop.marketData ? (
                            <div className="flex items-center space-x-2">
                              <span>{getConfidenceDot(crop.marketData.confidence)}</span>
                              <span className={`capitalize ${getConfidenceColor(crop.marketData.confidence)}`}>
                                {crop.marketData.confidence}
                              </span>
                              <a
                                href={getUsdaReportUrl(crop.commodity)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="View USDA Market Report"
                              >
                                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Retail Intelligence Tab Content */}
        {activeTab === 'retail' && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Retail Pricing Intelligence</h2>
                  <p className="text-sm text-gray-600 mt-1">Current retail prices from major grocery chains</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Beta Feature
                  </span>
                  {retailLoading && (
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
              </div>
            </div>

            {retailLoading ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Scanning retail websites...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : retailPriceData.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">🏪</div>
                <p className="text-gray-500 mb-2">No retail pricing data available</p>
                <p className="text-sm text-gray-400">
                  {crops.length === 0 
                    ? "Add crops in Crop Management to see retail pricing data"
                    : "Retail pricing data is not yet available for your commodities"
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {retailPriceData.map((item, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {item.isOrganic ? 'Organic ' : ''}{item.commodity.replace('_', ' ')} {item.variety}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            Average: <span className="font-medium text-gray-900">${item.averagePrice?.toFixed(2)}</span>
                          </span>
                          {item.markupFromWholesale && (
                            <span className="text-sm text-gray-500">
                              Markup: <span className="font-medium text-orange-600">{item.markupFromWholesale}%</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {item.prices.length} retailer{item.prices.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.prices.map((price, priceIndex) => (
                        <div key={priceIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{price.retailer}</h4>
                            <span className="text-xs text-gray-500 capitalize">{price.source}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Regular Price:</span>
                              <span className={`font-medium ${price.salePrice ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                ${price.price} {price.unit}
                              </span>
                            </div>
                            
                            {price.salePrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-red-600">Sale Price:</span>
                                <span className="font-medium text-red-600">
                                  ${price.salePrice} {price.unit}
                                </span>
                              </div>
                            )}
                            
                            {price.promotion && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {price.promotion}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            <div>{price.location}</div>
                            <div>Updated: {new Date(price.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Footer notes */}
      <div className="mt-6 space-y-2 text-center">
        <p className="text-sm text-gray-500">
          Market data sourced from USDA Market News. Retail prices scraped from public websites.
        </p>
        <p className="text-xs text-gray-400">
          Retail pricing data is for informational purposes only and may not reflect current in-store prices.
        </p>
      </div>

      {/* Confidence Modal */}
      {showConfidenceModal && (
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Market Price Confidence Levels & Calculations</h3>
              <button
                onClick={() => setShowConfidenceModal(false)}
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
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Commodity Structure Tab Content */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Commodity Structure Overview</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Complete breakdown of processing, packaging, and sizing specifications for all supported commodities. Now includes Root Vegetables and Vine Crops!
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Expand all categories
                        const allCategories = [...new Set(commodities.map(c => c.category))]
                        setExpandedCategories(new Set(allCategories))
                        
                        // Expand all commodities
                        setExpandedCommodities(new Set(commodities.map(c => c.id)))
                        setExpandedVarieties(new Set(commodities.flatMap(c => 
                          Object.keys(c.varieties).map(v => `${c.id}-${v}`)
                        )))
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => {
                        setExpandedCategories(new Set())
                        setExpandedCommodities(new Set())
                        setExpandedVarieties(new Set())
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {(() => {
                  // Group commodities by category
                  const categorizedCommodities = commodities.reduce((acc, commodity) => {
                    if (!acc[commodity.category]) {
                      acc[commodity.category] = []
                    }
                    acc[commodity.category].push(commodity)
                    return acc
                  }, {} as Record<string, typeof commodities>)

                  return Object.entries(categorizedCommodities).map(([categoryName, commoditiesInCategory]) => {
                    const isCategoryExpanded = expandedCategories.has(categoryName)
                    const totalCommodities = commoditiesInCategory.length
                    const totalVarieties = commoditiesInCategory.reduce((sum, c) => sum + Object.keys(c.varieties).length, 0)
                    
                    return (
                      <div key={categoryName} className="border border-gray-300 rounded-lg">
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(categoryName)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`transform transition-transform ${isCategoryExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRightIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-blue-900">{categoryName}</h3>
                              <p className="text-sm text-blue-700">{totalCommodities} commodities • {totalVarieties} varieties</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Category
                            </span>
                          </div>
                        </button>

                        {/* Category Content */}
                        {isCategoryExpanded && (
                          <div className="border-t border-gray-200 bg-white">
                            <div className="space-y-0">
                              {commoditiesInCategory.map(commodity => {
                  const isExpanded = expandedCommodities.has(commodity.id)
                  const varietyCount = Object.keys(commodity.varieties).length
                  
                  return (
                    <div key={commodity.id} className="border border-gray-200 rounded-lg">
                      {/* Commodity Header */}
                      <button
                        onClick={() => toggleCommodity(commodity.id)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-semibold text-gray-900">{commodity.name}</h4>
                            <p className="text-sm text-gray-600">{varietyCount} varieties • {commodity.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            commodity.usdaCoverage.hasPricing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {commodity.usdaCoverage.hasPricing ? 'USDA Pricing' : 'No USDA Data'}
                          </span>
                        </div>
                      </button>

                      {/* Commodity Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200">
                          {(() => {
                            // Check if all varieties have identical processing/packaging configurations
                            const varieties = Object.entries(commodity.varieties)
                            const firstVariety = varieties[0]?.[1]
                            
                            // Generate base configurations (same for all varieties)
                            const baseConfigurations: any[] = []
                            
                            if (commodity.processing.hasProcessing && commodity.processing.types) {
                              commodity.processing.types.forEach(processingType => {
                                processingType.packageTypes.forEach(packageType => {
                                  packageType.sizes.forEach(size => {
                                    if (packageType.fruitCounts && packageType.fruitCounts.length > 0) {
                                      packageType.fruitCounts.forEach(fruitCount => {
                                        baseConfigurations.push({
                                          processing: processingType.name,
                                          packageType: packageType.name,
                                          packageSize: size.name,
                                          itemSize: fruitCount.name
                                        })
                                      })
                                    } else {
                                      baseConfigurations.push({
                                        processing: processingType.name,
                                        packageType: packageType.name,
                                        packageSize: size.name,
                                        itemSize: '-'
                                      })
                                    }
                                  })
                                })
                              })
                            } else {
                              commodity.packaging.types.forEach(packageType => {
                                packageType.sizes.forEach(size => {
                                  if (packageType.fruitCounts && packageType.fruitCounts.length > 0) {
                                    packageType.fruitCounts.forEach(fruitCount => {
                                      baseConfigurations.push({
                                        processing: 'Fresh',
                                        packageType: packageType.name,
                                        packageSize: size.name,
                                        itemSize: fruitCount.name
                                      })
                                    })
                                  } else {
                                    baseConfigurations.push({
                                      processing: 'Fresh',
                                      packageType: packageType.name,
                                      packageSize: size.name,
                                      itemSize: '-'
                                    })
                                  }
                                })
                              })
                            }

                            // If there are multiple varieties, show unified view with variety comparison
                            if (varieties.length > 1) {
                              return (
                                <div className="p-6">
                                  <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                                      Processing & Packaging Options
                                      <span className="ml-2 text-xs text-gray-500">(applies to all varieties)</span>
                                    </h5>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full">
                                        <thead>
                                          <tr className="border-b border-gray-200">
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cut/Processing</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Size</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Size</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {baseConfigurations.map((config, index) => {
                                            // Check if this is the default configuration
                                            const isDefault = (() => {
                                              if (commodity.processing.hasProcessing) {
                                                const defaultProcessing = commodity.processing.types?.find(pt => pt.isDefault)?.name
                                                const defaultPackage = commodity.packaging.defaultPackage
                                                const defaultSize = commodity.packaging.defaultSize
                                                
                                                // For processed commodities, check processing + package + size match
                                                const processingMatches = config.processing === defaultProcessing
                                                const packageMatches = config.packageType.toLowerCase() === defaultPackage.toLowerCase()
                                                const sizeMatches = config.packageSize === defaultSize
                                                
                                                return processingMatches && packageMatches && sizeMatches
                                              } else {
                                                // For direct packaging (like oranges) - check for default fruit count too
                                                const defaultPackage = commodity.packaging.defaultPackage
                                                const defaultSize = commodity.packaging.defaultSize
                                                
                                                const packageMatches = config.packageType.toLowerCase() === defaultPackage.toLowerCase() &&
                                                                     config.packageSize.includes(defaultSize)
                                                
                                                // For citrus with fruit counts, also check if item size is default
                                                if (config.itemSize && config.itemSize !== '-') {
                                                  // Find the default fruit count from packaging config
                                                  const packageType = commodity.packaging.types.find(pt => 
                                                    pt.type.toLowerCase() === defaultPackage.toLowerCase()
                                                  )
                                                  const defaultFruitCount = packageType?.fruitCounts?.find(fc => fc.isDefault)?.name
                                                  return packageMatches && config.itemSize === defaultFruitCount
                                                }
                                                
                                                return packageMatches
                                              }
                                            })()
                                            
                                            return (
                                              <tr key={index} className={`hover:bg-gray-50 ${isDefault ? 'bg-green-50' : ''}`}>
                                                <td className={`px-3 py-2 text-sm ${isDefault ? 'text-green-800 font-medium' : 'text-gray-900'}`}>
                                                  {config.processing}
                                                  {isDefault && <span className="ml-2 text-xs text-green-600">(Default)</span>}
                                                </td>
                                                <td className={`px-3 py-2 text-sm ${isDefault ? 'text-green-800 font-medium' : 'text-gray-900'}`}>{config.packageType}</td>
                                                <td className={`px-3 py-2 text-sm ${isDefault ? 'text-green-800 font-medium' : 'text-gray-900'}`}>{config.packageSize}</td>
                                                <td className={`px-3 py-2 text-sm ${isDefault ? 'text-green-800 font-medium' : 'text-gray-900'}`}>{config.itemSize}</td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">Variety-Specific Differences</h5>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full">
                                        <thead>
                                          <tr className="border-b border-gray-200">
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight/Item</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Price/lb</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">USDA Coverage</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {varieties.map(([varietyId, variety]) => (
                                            <tr key={varietyId} className="hover:bg-gray-50">
                                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{variety.name}</td>
                                              <td className="px-3 py-2 text-sm text-gray-900">{variety.itemWeight.base.toFixed(2)} lbs</td>
                                              <td className="px-3 py-2 text-sm font-medium text-gray-900">${variety.pricing.basePricePerLb.toFixed(2)}</td>
                                              <td className="px-3 py-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                  variety.usdaMapping?.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                                  variety.usdaMapping?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  variety.usdaMapping?.confidence === 'low' ? 'bg-orange-100 text-orange-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {variety.usdaMapping?.confidence || 'none'}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-xs text-gray-500">
                                                {varietyId === commodity.defaultVariety && <span className="font-medium text-blue-600">Default</span>}
                                                {variety.pricing.priceVolatility === 'high' && <span className="ml-1 text-orange-600">High volatility</span>}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )
                            } else {
                              // Single variety - show traditional expanded view
                              const [varietyId, variety] = varieties[0]
                              const varietyKey = `${commodity.id}-${varietyId}`
                              const isVarietyExpanded = expandedVarieties.has(varietyKey)
                              
                              const varietyRows = baseConfigurations.map(config => ({
                                ...config,
                                itemWeight: variety.itemWeight.base.toFixed(2),
                                basePrice: variety.pricing.basePricePerLb.toFixed(2),
                                usdaConfidence: variety.usdaMapping?.confidence || 'none'
                              }))

                              return (
                                <div className="border-t border-gray-100">
                                  <button
                                    onClick={() => toggleVariety(commodity.id, varietyId)}
                                    className="w-full px-6 py-3 flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`transform transition-transform ml-6 ${isVarietyExpanded ? 'rotate-90' : ''}`}>
                                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <div className="text-left">
                                        <h5 className="text-base font-medium text-gray-900">{variety.name}</h5>
                                        <p className="text-sm text-gray-500">{varietyRows.length} configurations • ${variety.pricing.basePricePerLb.toFixed(2)}/lb base</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        variety.usdaMapping?.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                        variety.usdaMapping?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        variety.usdaMapping?.confidence === 'low' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variety.usdaMapping?.confidence || 'none'}
                                      </span>
                                    </div>
                                  </button>

                                  {isVarietyExpanded && (
                                    <div className="px-6 pb-4">
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                          <thead>
                                            <tr className="border-b border-gray-200">
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cut/Processing</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Size</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Size</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight/Item</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/lb</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {varietyRows.map((row, index) => (
                                              <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-sm text-gray-900">{row.processing}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{row.packageType}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{row.packageSize}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{row.itemSize}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{row.itemWeight} lbs</td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900">${row.basePrice}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )
                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Legend:</span>
                    <span className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">High</span>
                      Direct USDA data available
                    </span>
                    <span className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">Medium</span>
                      USDA category match
                    </span>
                    <span className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-2">Low</span>
                      Regional estimates
                    </span>
                    <span className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">None</span>
                      Calculated pricing
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total configurations: {commodities.reduce((total, commodity) => 
                      total + Object.keys(commodity.varieties).length, 0
                    )} varieties across {commodities.length} commodities
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}
