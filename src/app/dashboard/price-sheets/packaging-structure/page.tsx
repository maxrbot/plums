"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CropManagement } from '../../../../types'
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cropsApi } from '../../../../lib/api'
import AddPackagingItemModal from '../../../../components/modals/AddPackagingItemModal'
import { useUser } from '@/contexts/UserContext'
import { Breadcrumbs } from '../../../../components/ui'

interface PackageType {
  id: string
  name: string
  weight?: string
  count?: string
}

interface SizeGrade {
  id: string
  name: string
  description?: string
}

interface PackagingConfig {
  commodityId: string
  commodityName: string
  packageTypes: PackageType[]
  sizeGrades: SizeGrade[]
}

export default function PackagingStructurePage() {
  const searchParams = useSearchParams()
  const { user, updateUser } = useUser()
  const [crops, setCrops] = useState<CropManagement[]>([])
  const [packagingConfigs, setPackagingConfigs] = useState<PackagingConfig[]>([])
  const [expandedCommodities, setExpandedCommodities] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'package' | 'size'>('package')
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('')
  const [selectedCommodityName, setSelectedCommodityName] = useState<string>('')
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadCrops()
  }, [])

  // Auto-expand commodity from URL parameter
  useEffect(() => {
    const commodityParam = searchParams?.get('commodity')
    if (commodityParam && packagingConfigs.length > 0) {
      // Find the config with matching commodity name
      const matchingConfig = packagingConfigs.find(c => c.commodityName === commodityParam)
      if (matchingConfig) {
        setExpandedCommodities(prev => new Set([...prev, matchingConfig.commodityId]))
        
        // Scroll to the commodity section
        setTimeout(() => {
          const element = document.getElementById(`commodity-${matchingConfig.commodityName}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [searchParams, packagingConfigs])

  // Auto-save when packagingConfigs changes
  useEffect(() => {
    if (packagingConfigs.length > 0 && !isLoading) {
      // Clear any existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      
      // Set new timeout to save after 500ms of no changes
      const timeout = setTimeout(() => {
        savePackagingStructure()
      }, 500)
      
      setSaveTimeout(timeout)
    }
  }, [packagingConfigs])

  const loadCrops = async () => {
    try {
      const response = await cropsApi.getAll()
      
      // Transform crops with proper ID handling - use commodity as-is from database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedCrops: CropManagement[] = response.crops.map((crop: any) => {
        const cropId = crop.id || crop._id?.toString() || `temp_${Date.now()}_${Math.random()}`
        // Use commodity name as-is since it's already properly formatted in the database
        const commodityName = crop.commodity || 'Unknown'
        return {
          id: cropId,
          category: crop.category || 'unknown',
          commodity: commodityName,
          variations: crop.variations || [],
          status: crop.status || 'active',
          createdAt: crop.createdAt || new Date().toISOString()
        }
      })
      
      setCrops(transformedCrops)
      
      // Load user's packaging structure
      await loadPackagingStructure(transformedCrops)
      
      console.log('✅ Loaded crops:', transformedCrops.length)
    } catch (error) {
      console.error('❌ Error loading crops:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPackagingStructure = async (crops: CropManagement[]) => {
    try {
      console.log('📥 Loading packaging structure for', crops.length, 'crops')
      console.log('👤 User from context:', user)
      
      // Get saved structure from user context
      const savedStructure = (user as any)?.packagingStructure || {}
      
      console.log('📦 Saved structure from user:', savedStructure)
      
      // Initialize configs with saved data or empty arrays
      // Use commodity NAME (not ID) as the key to match how we save
      const configs = crops.map((crop: CropManagement) => ({
        commodityId: crop.id,
        commodityName: crop.commodity,
        packageTypes: savedStructure[crop.commodity]?.packageTypes || [],
        sizeGrades: savedStructure[crop.commodity]?.sizeGrades || []
      }))
      
      console.log('✅ Initialized configs:', configs.length, 'items')
      setPackagingConfigs(configs)
    } catch (error) {
      console.error('❌ Error loading packaging structure:', error)
      // Initialize with empty configs if load fails
      const configs = crops.map((crop: CropManagement) => ({
        commodityId: crop.id,
        commodityName: crop.commodity,
        packageTypes: [],
        sizeGrades: []
      }))
      console.log('🔄 Fallback: initialized', configs.length, 'empty configs')
      setPackagingConfigs(configs)
    }
  }

  const savePackagingStructure = async () => {
    try {
      // Convert configs array to object keyed by commodity NAME (not ID)
      const structureToSave = packagingConfigs.reduce((acc, config) => {
        // Use commodityName (capitalized) as the key
        acc[config.commodityName] = {
          packageTypes: config.packageTypes,
          sizeGrades: config.sizeGrades
        }
        return acc
      }, {} as Record<string, { packageTypes: Array<{ id: string; name: string }>; sizeGrades: Array<{ id: string; name: string }> }>)

      console.log('💾 Saving packaging structure (keyed by commodity name):', structureToSave)

      // Use updateUser from context
      await updateUser({
        packagingStructure: structureToSave
      })

      console.log('✅ Saved packaging structure')
    } catch (error) {
      console.error('❌ Error saving packaging structure:', error)
    }
  }

  const toggleCommodity = (commodityId: string) => {
    setExpandedCommodities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commodityId)) {
        newSet.delete(commodityId)
      } else {
        newSet.add(commodityId)
      }
      return newSet
    })
  }

  const openAddModal = (commodityId: string, commodityName: string, type: 'package' | 'size') => {
    setSelectedCommodityId(commodityId)
    setSelectedCommodityName(commodityName)
    setModalType(type)
    setShowModal(true)
  }

  const handleAddItem = (names: string[]) => {
    if (modalType === 'package') {
      setPackagingConfigs(prev => prev.map(config => {
        if (config.commodityId === selectedCommodityId) {
          const newPackages = names.map((name, index) => ({
            id: `pkg_${Date.now()}_${index}`,
            name: name
          }))
          return {
            ...config,
            packageTypes: [...config.packageTypes, ...newPackages]
          }
        }
        return config
      }))
    } else {
      setPackagingConfigs(prev => prev.map(config => {
        if (config.commodityId === selectedCommodityId) {
          const newSizes = names.map((name, index) => ({
            id: `size_${Date.now()}_${index}`,
            name: name
          }))
          return {
            ...config,
            sizeGrades: [...config.sizeGrades, ...newSizes]
          }
        }
        return config
      }))
    }
  }

  const removePackageType = (commodityId: string, packageId: string) => {
    setPackagingConfigs(prev => prev.map(config => {
      if (config.commodityId === commodityId) {
        return {
          ...config,
          packageTypes: config.packageTypes.filter(p => p.id !== packageId)
        }
      }
      return config
    }))
  }

  const removeSizeGrade = (commodityId: string, sizeId: string) => {
    setPackagingConfigs(prev => prev.map(config => {
      if (config.commodityId === commodityId) {
        return {
          ...config,
          sizeGrades: config.sizeGrades.filter(s => s.id !== sizeId)
        }
      }
      return config
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your commodities...</div>
      </div>
    )
  }

  if (crops.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Commodities Yet</h3>
          <p className="text-gray-500 mb-6">
            Add commodities in the Commodities page first, then come back here to define your packaging structure.
          </p>
          <a
            href="/dashboard/price-sheets/crops"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Commodities
          </a>
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
            { label: 'Packaging', current: true }
          ]} 
          className="mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900">Packaging Structure</h1>
        <p className="mt-2 text-sm text-gray-600">
          Define how you package and size each commodity. This will be used when creating price sheets.
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Build Your Custom Structure</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>For each commodity you grow, add the package types and size grades you use. This creates your personalized packaging structure that will be available when building price sheets.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commodities List */}
      <div className="space-y-4">
        {console.log('🎨 Rendering configs:', packagingConfigs.length, packagingConfigs)}
        {packagingConfigs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No packaging configs loaded. Check console for errors.
          </div>
        )}
        {packagingConfigs.map((config) => {
          const crop = crops.find(c => c.id === config.commodityId)
          const isExpanded = expandedCommodities.has(config.commodityId)
          const variationCount = crop?.variations.length || 0

          return (
            <div 
              key={config.commodityId} 
              id={`commodity-${config.commodityName}`}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Commodity Header */}
              <button
                onClick={() => toggleCommodity(config.commodityId)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-lg font-semibold text-gray-900 capitalize">
                    {config.commodityName.replace('-', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({variationCount} variation{variationCount !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{config.packageTypes.length} package type{config.packageTypes.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{config.sizeGrades.length} size grade{config.sizeGrades.length !== 1 ? 's' : ''}</span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Package Types */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Package Types</h4>
                        <button
                          onClick={() => openAddModal(config.commodityId, config.commodityName, 'package')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Package
                        </button>
                      </div>
                      {config.packageTypes.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">No package types defined yet</div>
                      ) : (
                        <div className="space-y-2">
                          {config.packageTypes.map((pkg) => (
                            <div key={pkg.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                              <span className="text-sm text-gray-900">{pkg.name}</span>
                              <button
                                onClick={() => removePackageType(config.commodityId, pkg.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Size Grades */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Size Grades</h4>
                        <button
                          onClick={() => openAddModal(config.commodityId, config.commodityName, 'size')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Size
                        </button>
                      </div>
                      {config.sizeGrades.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">No size grades defined yet</div>
                      ) : (
                        <div className="space-y-2">
                          {config.sizeGrades.map((size) => (
                            <div key={size.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                              <span className="text-sm text-gray-900">{size.name}</span>
                              <button
                                onClick={() => removeSizeGrade(config.commodityId, size.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Packaging Item Modal */}
      <AddPackagingItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddItem}
        type={modalType}
        commodityName={selectedCommodityName}
      />
    </>
  )
}

