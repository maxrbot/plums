"use client"

import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import type { CropManagement, GrowingRegion } from '../../../../types'
import { Breadcrumbs, AddVariationModal } from '../../../../components/ui'
import { cropsApi, regionsApi } from '../../../../lib/api'

// Mock crop data with new structure
const mockCrops: CropManagement[] = [
  {
    id: 'crop_1',
    category: 'berries',
    commodity: 'strawberry',
    variations: [
      {
        id: 'var_1',
        variety: 'Albion',
        isOrganic: true,
        growingRegions: [
          {
            regionId: '1',
            regionName: 'Central Valley - Fresno',
            seasonality: { startMonth: 3, endMonth: 8, isYearRound: false }
          },
          {
            regionId: '2',
            regionName: 'Salinas Valley - Salinas',
            seasonality: { startMonth: 4, endMonth: 9, isYearRound: false }
          }
        ],
        targetPricing: {
          minPrice: 4.00,
          maxPrice: 5.50,
          unit: 'lb',
          notes: 'Premium organic berries, seasonal pricing'
        },
        growingPractices: ['USDA Organic', 'Sustainable', 'Regenerative Agriculture'],
        minOrder: 50,
        orderUnit: 'case',
        notes: 'Premium organic strawberries with extended growing season'
      },
      {
        id: 'var_2',
        variety: 'Chandler',
        isOrganic: false,
        growingRegions: [
          {
            regionId: '1',
            regionName: 'Central Valley - Fresno',
            seasonality: { startMonth: 3, endMonth: 7, isYearRound: false }
          }
        ],
        targetPricing: {
          minPrice: 3.50,
          maxPrice: 4.75,
          unit: 'lb',
          notes: 'Conventional berries, competitive pricing'
        },
        growingPractices: ['Non-GMO Verified', 'Cover Cropping', 'Water Conservation'],
        minOrder: 100,
        orderUnit: 'case',
        notes: 'High-yield conventional variety'
      }
    ],
    status: 'active',
    createdAt: '2024-03-10'
  },
  {
    id: 'crop_2',
    category: 'leafy-greens',
    commodity: 'lettuce',
    variations: [
      {
        id: 'var_3',
        variety: 'Butterhead Blend',
        isOrganic: true,
        growingRegions: [
          {
            regionId: '2',
            regionName: 'Salinas Valley - Salinas',
            seasonality: { startMonth: 2, endMonth: 6, isYearRound: false }
          }
        ],
        targetPricing: {
          minPrice: 2.25,
          maxPrice: 3.25,
          unit: 'head',
          notes: 'Hydroponic premium quality'
        },
        growingPractices: ['USDA Organic', 'Hydroponic', 'Biodynamic Certified'],
                  minOrder: 2,
          orderUnit: 'pallet',
        notes: 'Premium hydroponic lettuce mix'
      }
    ],
    status: 'active',
    createdAt: '2024-03-12'
  },
  {
    id: 'crop_3',
    category: 'tomatoes',
    commodity: 'heirloom-tomato',
    variations: [
      {
        id: 'var_4',
        variety: 'Brandywine',
        isOrganic: true,
        growingRegions: [
          {
            regionId: '1',
            regionName: 'Central Valley - Fresno',
            seasonality: { startMonth: 6, endMonth: 10, isYearRound: false }
          }
        ],
        targetPricing: {
          minPrice: 2.75,
          maxPrice: 4.25,
          unit: 'lb',
          notes: 'Heirloom variety, limited availability'
        },
        growingPractices: ['USDA Organic', 'Heirloom', 'Regenerative Agriculture'],
                  minOrder: 500,
          orderUnit: 'dollar',
        notes: 'Heirloom variety with premium pricing'
      }
    ],
    status: 'active',
    createdAt: '2024-03-15'
  }
]

// Mock growing regions for reference
const mockRegions = [
  {
    id: 1,
    name: 'Central Valley - Fresno',
    city: 'Fresno',
    state: 'CA',
    climate: 'Mediterranean',
    soilType: 'Loam',
    deliveryZones: ['Central CA', 'Northern CA'],
    status: 'active' as const,
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: 'Salinas Valley - Salinas',
    city: 'Salinas',
    state: 'CA',
    climate: 'Mediterranean',
    soilType: 'Sandy Loam',
    deliveryZones: ['Central CA', 'Coastal CA'],
    status: 'active' as const,
    createdAt: '2024-03-10'
  },
  {
    id: 3,
    name: 'Imperial Valley - El Centro',
    city: 'El Centro',
    state: 'CA',
    climate: 'Desert',
    soilType: 'Clay',
    deliveryZones: ['Southern CA', 'Southwest'],
    status: 'active' as const,
    createdAt: '2024-03-10'
  }
]

export default function CropManagement() {
  const [crops, setCrops] = useState<CropManagement[]>([])
  const [regions, setRegions] = useState<GrowingRegion[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCrop, setEditingCrop] = useState<CropManagement | null>(null)
  const [collapsedCommodities, setCollapsedCommodities] = useState<Set<string>>(new Set())

  // Helper function to get month name
  const getMonthName = (monthNumber: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthNumber - 1] || ''
  }

  // Helper function to format seasonality
  const formatSeasonality = (startMonth: number, endMonth: number): string => {
    return `${getMonthName(startMonth)} - ${getMonthName(endMonth)}`
  }

  // Toggle commodity collapse state
  const toggleCommodity = (commodityId: string) => {
    const newCollapsed = new Set(collapsedCommodities)
    if (newCollapsed.has(commodityId)) {
      newCollapsed.delete(commodityId)
    } else {
      newCollapsed.add(commodityId)
    }
    setCollapsedCommodities(newCollapsed)
  }

  // Calculate meaningful metrics
  const calculateMetrics = () => {
    const allVariations = crops.flatMap(crop => crop.variations)
    const totalProducts = allVariations.length
    
    // Organic vs Conventional breakdown
    const organicCount = allVariations.filter(v => v.isOrganic).length
    const conventionalCount = allVariations.filter(v => !v.isOrganic).length
    const hasMixedTypes = organicCount > 0 && conventionalCount > 0
    
    // In season calculation (current month)
    const currentMonth = new Date().getMonth() + 1 // 1-12
    const inSeasonCount = allVariations.filter(variation => 
      variation.growingRegions.some(region => {
        if (region.seasonality.isYearRound) return true
        const { startMonth, endMonth } = region.seasonality
        // Handle seasons that cross year boundary (e.g., Nov-Mar)
        if (startMonth <= endMonth) {
          return currentMonth >= startMonth && currentMonth <= endMonth
        } else {
          return currentMonth >= startMonth || currentMonth <= endMonth
        }
      })
    ).length
    
    // Active growing regions
    const uniqueRegions = new Set(
      allVariations.flatMap(v => v.growingRegions.map(r => r.regionName))
    )
    const activeRegionsCount = uniqueRegions.size
    
    return {
      totalProducts,
      organicCount,
      conventionalCount,
      hasMixedTypes,
      inSeasonCount,
      activeRegionsCount
    }
  }

  const metrics = calculateMetrics()

  // Load crops and regions from API
  useEffect(() => {
    loadCrops()
    loadRegions()
  }, [])

  const loadCrops = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await cropsApi.getAll()
      
      // Backend now returns transformed data with 'id' field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedCrops: CropManagement[] = response.crops.map((crop: any) => {
        const cropId = crop.id || crop._id?.toString() || `temp_${Date.now()}_${Math.random()}`
        return {
          id: cropId,
          category: crop.category || 'unknown',
          commodity: crop.commodity || 'unknown',
          variations: crop.variations || [],
          status: 'active' as const,
          createdAt: crop.createdAt ? new Date(crop.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }
      })
      
      setCrops(transformedCrops)
    } catch (err) {
      console.error('Failed to load crops:', err)
      setError(err instanceof Error ? err.message : 'Failed to load crops')
      // Show empty state on error
      setCrops([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadRegions = async () => {
    try {
      const response = await regionsApi.getAll()
      
      // Transform backend data to frontend format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedRegions: GrowingRegion[] = response.regions.map((region: any) => ({
        id: region._id,
        name: region.name,
        city: region.location?.city || '',
        state: region.location?.state || '',
        climate: '', // Not used in new structure
        soilType: '', // Not used in new structure
        deliveryZones: [], // Not used in new structure
        status: 'active' as const,
        createdAt: new Date(region.createdAt).toISOString().split('T')[0],
        // Store additional data for editing
        farmingTypes: region.farmingTypes || [],
        acreage: region.acreage || '',
        notes: region.notes || '',
        location: region.location
      }))
      
      setRegions(transformedRegions)
    } catch (err) {
      console.error('Failed to load regions:', err)
      // Don't set error state for regions, just use empty array
      setRegions([])
    }
  }

  const handleAddCrop = async (newCrop: CropManagement) => {
    try {
      setError(null)
      
      // Transform frontend data to backend format
      const cropData = {
        category: newCrop.category,
        commodity: newCrop.commodity,
        variations: newCrop.variations || []
      }

      const response = await cropsApi.create(cropData)
      
      // Add the new crop to the list
      const transformedCrop: CropManagement = {
        id: response.crop._id,
        category: response.crop.category,
        commodity: response.crop.commodity,
        variations: response.crop.variations || [],
        status: 'active' as const,
        createdAt: new Date(response.crop.createdAt).toISOString().split('T')[0]
      }
      
      setCrops([...crops, transformedCrop])
      setIsModalOpen(false)
      
      console.log('✅ Crop created successfully:', response.crop)
    } catch (err) {
      console.error('Failed to create crop:', err)
      setError(err instanceof Error ? err.message : 'Failed to create crop')
    }
  }

  const handleUpdateCrop = async (updatedCrop: CropManagement) => {
    try {
      setError(null)
      
      // Transform frontend data to backend format
      const cropData = {
        category: updatedCrop.category,
        commodity: updatedCrop.commodity,
        variations: updatedCrop.variations || []
      }

      const response = await cropsApi.update(updatedCrop.id.toString(), cropData)
      
      // Update the crop in the list
      const transformedCrop: CropManagement = {
        id: response.crop._id,
        category: response.crop.category,
        commodity: response.crop.commodity,
        variations: response.crop.variations || [],
        status: 'active' as const,
        createdAt: new Date(response.crop.createdAt).toISOString().split('T')[0]
      }
      
      setCrops(prev => prev.map(crop => 
        crop.id === updatedCrop.id ? transformedCrop : crop
      ))
      setIsModalOpen(false)
      setEditingCrop(null)
      
      console.log('✅ Crop updated successfully:', response.crop)
    } catch (err) {
      console.error('Failed to update crop:', err)
      setError(err instanceof Error ? err.message : 'Failed to update crop')
    }
  }

  const handleEditCrop = (crop: CropManagement) => {
    // Set the crop we're editing and open the modal
    setEditingCrop(crop)
    setIsModalOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Crop Management', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
            <p className="mt-2 text-gray-600">Set up your crop catalog, varieties, and growing seasons.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Crop
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        {/* Total Products (Variations) */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.totalProducts}</dd>
                  {metrics.hasMixedTypes && (
                    <dd className="text-xs text-gray-500 mt-1">
                      {metrics.organicCount} organic • {metrics.conventionalCount} conventional
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* In Season Now */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Season Now</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.inSeasonCount}</dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    {getMonthName(new Date().getMonth() + 1)} availability
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Growing Regions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Growing Regions</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.activeRegionsCount}</dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    Active locations
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Overview */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Price Range</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.totalProducts > 0 ? (
                      `$${Math.min(...crops.flatMap(c => c.variations.map(v => v.targetPricing.minPrice))).toFixed(2)} - $${Math.max(...crops.flatMap(c => c.variations.map(v => v.targetPricing.maxPrice))).toFixed(2)}`
                    ) : '$0'}
                  </dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    Target pricing span
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadCrops}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Crops List */}
      <div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading crops...</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No crops yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first crop.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Crop
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group crops by category */}
            {Object.entries(
              crops.reduce((acc, crop) => {
                // Safely handle undefined category
                const categoryName = (crop.category || 'other').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                if (!acc[categoryName]) acc[categoryName] = []
                acc[categoryName].push(crop)
                return acc
              }, {} as Record<string, typeof crops>)
            ).map(([categoryName, categorycrops]) => (
              <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{categoryName}</h3>
                  <p className="text-sm text-gray-500">
                    {categorycrops.length} commodit{categorycrops.length !== 1 ? 'ies' : 'y'} • {categorycrops.reduce((sum, crop) => sum + crop.variations.length, 0)} total variations
                  </p>
                </div>
                
                {/* Commodities within category */}
                <div className="divide-y divide-gray-200">
                  {categorycrops.map((crop) => (
                    <div key={crop.id} className="p-6">
                      {/* Commodity Header - Collapsible */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleCommodity(crop.id.toString())}
                          className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2 -ml-2 transition-colors"
                        >
                          {collapsedCommodities.has(crop.id.toString()) ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          )}
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {crop.commodity.replace('-', ' ')}
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {crop.variations.length} variation{crop.variations.length !== 1 ? 's' : ''}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </button>
                        <button 
                          onClick={() => handleEditCrop(crop)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit variations for this commodity"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit All Variations
                        </button>
                      </div>
                      
                      {/* Variations Table - Collapsible */}
                      {!collapsedCommodities.has(crop.id.toString()) && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variation
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Growing Regions
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Seasonality
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Target Price
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Min Order
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {crop.variations.map((variation, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-900">
                                  <div className="font-medium">
                                    {variation.subtype && (
                                      <span className="text-gray-500 capitalize">{variation.subtype.replace('-', ' ')} • </span>
                                    )}
                                    <span className="capitalize">{variation.variety || 'Standard'}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    variation.isOrganic 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {variation.isOrganic ? 'Organic' : 'Conventional'}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  <div className="space-y-1">
                                    {variation.growingRegions.map((region, regionIndex) => (
                                      <div key={regionIndex} className="text-xs">
                                        {region.regionName}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  <div className="space-y-1">
                                    {variation.growingRegions.map((region, regionIndex) => (
                                      <div key={regionIndex} className="text-xs">
                                        {region.seasonality.isYearRound 
                                          ? 'Year-round' 
                                          : formatSeasonality(region.seasonality.startMonth, region.seasonality.endMonth)
                                        }
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900">
                                  <div className="font-medium">
                                    ${variation.targetPricing.minPrice.toFixed(2)} - ${variation.targetPricing.maxPrice.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    per {variation.targetPricing.unit}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {variation.minOrder} {variation.orderUnit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Add/Edit Variation Modal */}
      <AddVariationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCrop(null)
        }}
        onSave={(cropData) => {
          if (editingCrop) {
            // Update existing crop
            handleUpdateCrop(cropData)
          } else {
            // Add new crop
            handleAddCrop(cropData)
          }
        }}
        availableRegions={regions}
        existingCrops={crops}
        existingCrop={editingCrop || undefined}
        isEditMode={!!editingCrop}
      />
    </>
  )
}
