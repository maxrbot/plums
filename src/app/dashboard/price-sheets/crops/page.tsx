"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import type { CropManagement, GrowingRegion } from '../../../../types'
import { Breadcrumbs, AddVariationModal } from '../../../../components/ui'
import CropImportModal from '../../../../components/modals/CropImportModal'
import { cropsApi, regionsApi, shippingPointsApi } from '../../../../lib/api'
import { useUser } from '../../../../contexts/UserContext'
import Link from 'next/link'

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
        shippingPoints: [
          {
            pointId: '1',
            pointName: 'Fresno Distribution Center',
            availability: { startMonth: 3, endMonth: 8, isYearRound: false }
          },
          {
            pointId: '2',
            pointName: 'Salinas Cooler Facility',
            availability: { startMonth: 4, endMonth: 9, isYearRound: false }
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
        shippingPoints: [
          {
            pointId: '1',
            pointName: 'Fresno Distribution Center',
            availability: { startMonth: 3, endMonth: 7, isYearRound: false }
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
        shippingPoints: [
          {
            pointId: '2',
            pointName: 'Salinas Cooler Facility',
            availability: { startMonth: 2, endMonth: 6, isYearRound: false }
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
        shippingPoints: [
          {
            pointId: '1',
            pointName: 'Fresno Distribution Center',
            availability: { startMonth: 6, endMonth: 10, isYearRound: false }
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

// Mock shipping points for reference
const mockShippingPoints = [
  {
    id: 1,
    name: 'Fresno Distribution Center',
    city: 'Fresno',
    state: 'CA',
    facilityType: 'distribution_center' as const,
    operationTypes: ['Organic', 'Conventional'],
    capacity: '50,000 cases',
    status: 'active' as const,
    createdAt: '2024-03-10',
    shipping: {
      zones: ['Central CA', 'Northern CA'],
      methods: ['Truck', 'Rail'],
      leadTime: 2
    }
  },
  {
    id: 2,
    name: 'Salinas Cooler Facility',
    city: 'Salinas',
    state: 'CA',
    facilityType: 'cooler' as const,
    operationTypes: ['Organic', 'Specialty'],
    capacity: '25,000 cases',
    status: 'active' as const,
    createdAt: '2024-03-10',
    shipping: {
      zones: ['Central CA', 'Coastal CA'],
      methods: ['Truck'],
      leadTime: 1
    }
  },
  {
    id: 3,
    name: 'Imperial Valley Warehouse',
    city: 'El Centro',
    state: 'CA',
    facilityType: 'warehouse' as const,
    operationTypes: ['Conventional'],
    capacity: '75,000 cases',
    status: 'active' as const,
    createdAt: '2024-03-10',
    shipping: {
      zones: ['Southern CA', 'Southwest'],
      methods: ['Truck', 'Air'],
      leadTime: 3
    }
  }
]

export default function CropManagement() {
  const router = useRouter()
  const { user } = useUser()
  const [crops, setCrops] = useState<CropManagement[]>([])
  const [regions, setRegions] = useState<GrowingRegion[]>([])
  const [shippingPoints, setShippingPoints] = useState<any[]>([])
  const [hasShippingPoints, setHasShippingPoints] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCrop, setEditingCrop] = useState<CropManagement | null>(null)
  const [collapsedCommodities, setCollapsedCommodities] = useState<Set<string>>(new Set())
  const [showImportDropdown, setShowImportDropdown] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Helper function to get month name
  const getMonthName = (monthNumber: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthNumber - 1] || ''
  }

  // Helper function to format seasonality
  const formatSeasonality = (startMonth: number, endMonth: number): string => {
    if (!startMonth || !endMonth || startMonth === 0 || endMonth === 0) return 'Not specified'
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
      (variation.shippingPoints || variation.growingRegions || []).some(region => {
        const availability = region.availability || region.seasonality
        if (availability?.isYearRound) return true
        const { startMonth, endMonth } = availability || {}
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
      allVariations.flatMap(v => (v.shippingPoints || v.growingRegions || []).map(r => r.regionName || r.pointName))
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

  // Load crops, regions, and shipping points from API
  useEffect(() => {
    loadCrops()
    loadRegions()
    loadShippingPoints()
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
      const transformedRegions: GrowingRegion[] = response.regions.map((region: any, index: number) => {
        // Use placeId if available, otherwise fallback to _id, then generate unique ID
        const regionId = region.location?.placeId || region.id || region._id?.toString() || `temp_${Date.now()}_${index}`
        return {
          id: regionId,
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
        }
      })
      
      setRegions(transformedRegions)
    } catch (err) {
      console.error('Failed to load regions:', err)
      // Don't set error state for regions, just use empty array
      setRegions([])
    }
  }

  const loadShippingPoints = async () => {
    try {
      const response = await shippingPointsApi.getAll()
      const points = response.shippingPoints || []
      setShippingPoints(points)
      setHasShippingPoints(points.length > 0)
    } catch (err) {
      console.error('Failed to load shipping points:', err)
      setShippingPoints([])
      setHasShippingPoints(false)
    }
  }

  const handleAddCrop = async (newCrop: CropManagement) => {
    try {
      setError(null)
      
      console.log('🆕 handleAddCrop called')
      
      // Transform frontend data to backend format
      const cropData = {
        category: newCrop.category,
        commodity: newCrop.commodity,
        variations: newCrop.variations || []
      }

      const response = await cropsApi.create(cropData)
      
      // Add the new crop to the list
      const transformedCrop: CropManagement = {
        id: response.crop.id || response.crop._id, // Backend returns 'id', fallback to '_id'
        category: response.crop.category,
        commodity: response.crop.commodity,
        variations: response.crop.variations || [],
        status: 'active' as const,
        createdAt: new Date(response.crop.createdAt).toISOString().split('T')[0]
      }
      
      console.log('✅ Crop created successfully with ID:', transformedCrop.id)
      
      // Update state in a single batch
      setCrops(prev => [...prev, transformedCrop])
      setEditingCrop(transformedCrop)
      
      // Don't close modal - allow user to add more variations
      // setIsModalOpen(false)
      
      return transformedCrop
    } catch (err) {
      console.error('Failed to create crop:', err)
      setError(err instanceof Error ? err.message : 'Failed to create crop')
      throw err
    }
  }

  const handleUpdateCrop = async (updatedCrop: CropManagement) => {
    try {
      setError(null)
      
      console.log('🔄 handleUpdateCrop called with:', {
        id: updatedCrop.id,
        category: updatedCrop.category,
        commodity: updatedCrop.commodity,
        variationsCount: updatedCrop.variations?.length || 0
      })
      
      // Validate that we have a valid ID
      if (!updatedCrop.id) {
        throw new Error('Cannot update crop: missing crop ID')
      }
      
      // Transform frontend data to backend format
      const cropData = {
        category: updatedCrop.category,
        commodity: updatedCrop.commodity,
        variations: updatedCrop.variations || []
      }

      const cropId = updatedCrop.id.toString()
      console.log('📡 Updating crop with ID:', cropId)
      
      const response = await cropsApi.update(cropId, cropData)
      
      // Update the crop in the list
      const transformedCrop: CropManagement = {
        id: response.crop.id || response.crop._id, // Backend returns 'id', fallback to '_id'
        category: response.crop.category,
        commodity: response.crop.commodity,
        variations: response.crop.variations || [],
        status: 'active' as const,
        createdAt: new Date(response.crop.createdAt).toISOString().split('T')[0]
      }
      
      setCrops(prev => prev.map(crop => 
        crop.id === updatedCrop.id ? transformedCrop : crop
      ))
      
      // Update editingCrop with the latest data so modal stays in sync
      setEditingCrop(transformedCrop)
      
      // Don't close modal - allow user to add more variations
      // setIsModalOpen(false)
      
      console.log('✅ Crop updated successfully:', response.crop)
    } catch (err) {
      console.error('Failed to update crop:', err)
      setError(err instanceof Error ? err.message : 'Failed to update crop')
      // On error, don't clear editing state - let user try again
    }
  }

  const handleDeleteCrop = async (cropId: string) => {
    try {
      setError(null)
      
      console.log('🗑️ Deleting crop with ID:', cropId)
      
      // Delete from backend
      await cropsApi.delete(cropId)
      
      // Remove from local state
      setCrops(prev => prev.filter(crop => crop.id !== cropId))
      
      console.log('✅ Crop deleted successfully')
    } catch (err) {
      console.error('Failed to delete crop:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete crop')
    }
  }

  const handleEditCrop = (crop: CropManagement) => {
    // Set the crop we're editing and open the modal
    setEditingCrop(crop)
    setIsModalOpen(true)
  }

  const handleImportCrops = async (importData: any[]) => {
    try {
      // Transform CSV data to CropManagement format
      const transformedCrops = importData.map((row, index) => {
        const crop: CropManagement = {
          id: `imported_${Date.now()}_${index}`,
          category: row.category || 'other',
          commodity: row.commodity,
          variations: [{
            id: `var_${Date.now()}_${index}`,
            variety: row.variety,
            isOrganic: row.is_organic === 'true' || row.is_organic === '1',
            shippingPoints: row.shipping_point_name ? [{
              pointId: `point_${Date.now()}_${index}`,
              pointName: row.shipping_point_name,
              facilityType: row.facility_type || 'warehouse',
              availability: {
                startMonth: parseInt(row.availability_start_month) || 1,
                endMonth: parseInt(row.availability_end_month) || 12,
                isYearRound: !row.availability_start_month && !row.availability_end_month
              },
              shipping: {
                zones: row.shipping_zones ? row.shipping_zones.split(',').map((z: string) => z.trim()) : [],
                leadTime: parseInt(row.lead_time_days) || 2
              }
            }] : [],
            targetPricing: {
              minPrice: parseFloat(row.min_price) || 0,
              maxPrice: parseFloat(row.max_price) || 0,
              unit: row.price_unit || 'lb',
              notes: row.notes || ''
            },
            growingPractices: row.is_organic === 'true' ? ['USDA Organic'] : [],
            minOrder: parseInt(row.min_order) || 1,
            orderUnit: row.order_unit || 'case',
            notes: row.notes || ''
          }]
        }
        return crop
      })

      // Add to existing crops
      setCrops(prevCrops => [...prevCrops, ...transformedCrops])
      
      // TODO: Save to backend via API
      console.log('Imported crops:', transformedCrops)
      
    } catch (error) {
      console.error('Import error:', error)
      throw new Error('Failed to import crops')
    }
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
          <div className="flex items-center space-x-3">
            {/* Import Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowImportDropdown(!showImportDropdown)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Import Crops
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </button>
              
              {showImportDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Quick Import
                    </div>
                    <button
                      onClick={() => {
                        alert('CSV import feature coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <DocumentArrowUpIcon className="h-4 w-4 mr-3 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Upload CSV File</div>
                        <div className="text-xs text-gray-500">Import from spreadsheet or export</div>
                      </div>
                    </button>
                    
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-t border-gray-200 mt-1">
                      ERP Systems (Live Inventory)
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement Famous Software ERP integration
                        alert('Famous Software ERP integration coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Famous Software ERP</div>
                        <div className="text-xs text-gray-500">Facility inventory & shipping data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement Produce Pro ERP integration
                        alert('Produce Pro ERP integration coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Produce Pro ERP</div>
                        <div className="text-xs text-gray-500">Warehouse & distribution data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement FreshByte integration
                        alert('FreshByte ERP integration coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">FreshByte ERP</div>
                        <div className="text-xs text-gray-500">Cooler & packing house data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement RedLine Solutions integration
                        alert('RedLine Solutions integration coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-red-600" />
                      <div className="text-left">
                        <div className="font-medium">RedLine Solutions</div>
                        <div className="text-xs text-gray-500">Real-time facility tracking</div>
                      </div>
                    </button>
                    
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-t border-gray-200 mt-1">
                      File Import (All Sizes)
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement daily file watch
                        alert('Automated file import coming soon!')
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-orange-600" />
                      <div className="text-left">
                        <div className="font-medium">Daily File Import</div>
                        <div className="text-xs text-gray-500">Auto-sync facility & inventory data</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {!hasShippingPoints && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Please <Link href="/dashboard/price-sheets/regions" className="font-medium underline hover:text-amber-800">add a shipping point</Link> before adding commodities
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!hasShippingPoints}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                  hasShippingPoints
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
                title={!hasShippingPoints ? 'Add a shipping point first' : ''}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Crop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
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

        {/* Active Shipping Points */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Shipping Points</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.activeRegionsCount}</dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    Active locations
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
            {!hasShippingPoints && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-md border border-amber-200">
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Please <Link href="/dashboard/price-sheets/regions" className="font-medium underline hover:text-amber-800">add a shipping point</Link> before adding commodities
                  </span>
                </div>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!hasShippingPoints}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                  hasShippingPoints
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
                title={!hasShippingPoints ? 'Add a shipping point first' : ''}
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
                const rawCategory = crop.category || 'other'
                const categoryName = rawCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
                  {categorycrops.map((crop, cropIndex) => (
                    <div key={crop.id || `${categoryName}-${crop.commodity}-${cropIndex}`} className="p-6">
                      {/* Commodity Header - Collapsible */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleCommodity(crop.id?.toString() || `${categoryName}-${crop.commodity}-${cropIndex}`)}
                          className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2 -ml-2 transition-colors"
                        >
                          {collapsedCommodities.has(crop.id?.toString() || `${categoryName}-${crop.commodity}-${cropIndex}`) ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          )}
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {(crop.commodity || 'unknown').replace('-', ' ')}
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
                      {!collapsedCommodities.has(crop.id?.toString() || `${categoryName}-${crop.commodity}-${cropIndex}`) && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PLU
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variation
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shipping Points
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Seasonality
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pack Types
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size Grades
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {crop.variations.map((variation, index) => (
                              <tr key={variation.id || `${crop.id || crop.commodity}-var-${index}`} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {variation.plu || '-'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900">
                                  <div className="font-medium capitalize">
                                    {/* Build variation name: Type + Variety (or either one) */}
                                    {variation.subtype && typeof variation.subtype === 'string' && (
                                      <span className="text-gray-700">{variation.subtype.replace('-', ' ')}</span>
                                    )}
                                    {variation.subtype && variation.variety && ' '}
                                    {variation.variety && (
                                      <span className="text-gray-900">{variation.variety}</span>
                                    )}
                                    {!variation.subtype && !variation.variety && 'Standard'}
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
                                    {(variation.shippingPoints || variation.growingRegions || []).map((region, regionIndex) => (
                                      <div key={`${variation.id || index}-region-${regionIndex}`} className="text-xs">
                                        {region.regionName || region.pointName}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  <div className="space-y-1">
                                    {(variation.shippingPoints || variation.growingRegions || []).map((region, regionIndex) => {
                                      const availability = region.availability || region.seasonality
                                      return (
                                      <div key={`${variation.id || index}-availability-${regionIndex}`} className="text-xs">
                                        {availability?.isYearRound 
                                          ? 'Year-round' 
                                          : availability 
                                            ? (() => {
                                                const firstSeason = formatSeasonality(availability.startMonth, availability.endMonth)
                                                if (availability.isSplitSeason && availability.secondSeasonStart && availability.secondSeasonEnd) {
                                                  const secondSeason = formatSeasonality(availability.secondSeasonStart, availability.secondSeasonEnd)
                                                  return `${firstSeason}, ${secondSeason}`
                                                }
                                                return firstSeason
                                              })()
                                            : 'Not specified'
                                        }
                                      </div>
                                      )
                                    })}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {(() => {
                                    const packagingStructure = user?.packagingStructure?.[crop.commodity]
                                    const packTypesCount = packagingStructure?.packageTypes?.length || 0
                                    
                                    if (packTypesCount > 0) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                          <span className="text-green-700 font-medium">{packTypesCount} type{packTypesCount > 1 ? 's' : ''}</span>
                                        </div>
                                      )
                                    }
                                    return (
                                      <button
                                        onClick={() => router.push(`/dashboard/price-sheets/packaging-structure?commodity=${encodeURIComponent(crop.commodity)}`)}
                                        className="text-gray-500 hover:text-blue-600 text-xs underline"
                                      >
                                        Configure
                                      </button>
                                    )
                                  })()}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {(() => {
                                    const packagingStructure = user?.packagingStructure?.[crop.commodity]
                                    const sizeGradesCount = packagingStructure?.sizeGrades?.length || 0
                                    
                                    if (sizeGradesCount > 0) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                          <span className="text-green-700 font-medium">{sizeGradesCount} grade{sizeGradesCount > 1 ? 's' : ''}</span>
                                        </div>
                                      )
                                    }
                                    return (
                                      <button
                                        onClick={() => router.push(`/dashboard/price-sheets/packaging-structure?commodity=${encodeURIComponent(crop.commodity)}`)}
                                        className="text-gray-500 hover:text-blue-600 text-xs underline"
                                      >
                                        Configure
                                      </button>
                                    )
                                  })()}
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
        onSave={async (cropData) => {
          console.log('💾 Modal onSave called with:', {
            category: cropData.category,
            commodity: cropData.commodity,
            variationsCount: cropData.variations?.length || 0,
            cropDataId: cropData.id,
            editingCrop: editingCrop ? { id: editingCrop.id, category: editingCrop.category, commodity: editingCrop.commodity } : null
          })
          
          // Check if we already have this crop in state (use editingCrop if available, otherwise search)
          const existingCropInState = editingCrop || crops.find(crop => 
            crop.category === cropData.category && crop.commodity === cropData.commodity
          )
          
          console.log('🔍 Found existing crop in state:', existingCropInState ? { id: existingCropInState.id, variationsCount: existingCropInState.variations?.length } : 'NOT FOUND')
          
          if (existingCropInState) {
            // Update existing crop
            console.log('📝 Updating existing crop with ID:', existingCropInState.id)
            const updatedCrop = {
              ...cropData,
              id: existingCropInState.id, // Use the ID from state
              createdAt: existingCropInState.createdAt // Preserve creation date
            }
            await handleUpdateCrop(updatedCrop)
          } else {
            // Create new crop and get the result
            console.log('✨ Creating new crop')
            const newCrop = await handleAddCrop(cropData)
            console.log('✅ New crop created, returned:', newCrop ? { id: newCrop.id } : 'NO RETURN VALUE')
          }
        }}
        onDelete={handleDeleteCrop}
        availableRegions={regions}
        existingCrops={crops}
        existingCrop={editingCrop || undefined}
        isEditMode={!!editingCrop}
      />

      {/* Import Modal */}
      <CropImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCrops}
      />
    </>
  )
}
