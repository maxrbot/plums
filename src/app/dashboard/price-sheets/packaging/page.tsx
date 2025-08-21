"use client"

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { STANDARD_PACKAGING, PackagingSpec, getPackagingByCategory } from '../../../../lib/packagingSpecs'
import AddPackagingModal from '../../../../components/modals/AddPackagingModal'
import { packagingApi, cropsApi } from '../../../../lib/api'
import type { CropManagement } from '../../../../types'

export default function PackagingReference() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState('all')
  const [customPackaging, setCustomPackaging] = useState<PackagingSpec[]>([])
  const [userCrops, setUserCrops] = useState<CropManagement[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(['container', 'carton', 'bag', 'bulk', 'specialty'])
  )

  // Load custom packaging and user crops from API
  useEffect(() => {
    loadCustomPackaging()
    loadUserCrops()
  }, [])

  const loadCustomPackaging = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await packagingApi.getAll()
      
      // Transform backend data to frontend format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedPackaging: PackagingSpec[] = response.packaging.map((pkg: any) => ({
        id: pkg._id,
        name: pkg.name,
        description: pkg.description,
        commodities: pkg.commodities || [],
        isStandard: false,
        category: pkg.category
      }))
      
      setCustomPackaging(transformedPackaging)
    } catch (err) {
      console.error('Failed to load custom packaging:', err)
      setError(err instanceof Error ? err.message : 'Failed to load custom packaging')
      // Show empty state on error
      setCustomPackaging([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserCrops = async () => {
    try {
      const response = await cropsApi.getAll()
      
      // Transform backend data to frontend format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedCrops: CropManagement[] = response.crops.map((crop: any) => ({
        id: crop._id,
        category: crop.category,
        commodity: crop.commodity,
        variations: crop.variations || [],
        status: 'active' as const,
        createdAt: new Date(crop.createdAt).toISOString().split('T')[0]
      }))
      
      setUserCrops(transformedCrops)
    } catch (err) {
      console.error('Failed to load user crops:', err)
      // Don't set error for crops, just use empty array
      setUserCrops([])
    }
  }

  const handleAddCustomPackaging = async (newPackaging: Omit<PackagingSpec, 'id' | 'isStandard'>) => {
    try {
      setError(null)
      
      // Transform frontend data to backend format
      const packagingData = {
        name: newPackaging.name,
        description: newPackaging.description,
        commodities: newPackaging.commodities,
        category: newPackaging.category
      }

      const response = await packagingApi.create(packagingData)
      
      // Add the new packaging to the list
      const transformedPackaging: PackagingSpec = {
        id: response.packaging._id,
        name: response.packaging.name,
        description: response.packaging.description,
        commodities: response.packaging.commodities || [],
        isStandard: false,
        category: response.packaging.category
      }
      
      setCustomPackaging([...customPackaging, transformedPackaging])
      setIsAddModalOpen(false)
      
      console.log('✅ Custom packaging created successfully:', response.packaging)
    } catch (err) {
      console.error('Failed to create custom packaging:', err)
      setError(err instanceof Error ? err.message : 'Failed to create custom packaging')
    }
  }

  const handleDeleteCustomPackaging = async (packagingId: string) => {
    try {
      setError(null)
      
      await packagingApi.delete(packagingId)
      
      // Remove from local state
      setCustomPackaging(prev => prev.filter(p => p.id !== packagingId))
      
      console.log('✅ Custom packaging deleted successfully')
    } catch (err) {
      console.error('Failed to delete custom packaging:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete custom packaging')
    }
  }

  // Toggle category collapse state
  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories)
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category)
    } else {
      newCollapsed.add(category)
    }
    setCollapsedCategories(newCollapsed)
  }

  // Get user's actual commodities from their crop management
  const userCommodities = Array.from(new Set(
    userCrops.map(crop => crop.commodity)
  )).sort()

  // Get unique commodities from all packaging (for filtering display)
  const allCommodities = Array.from(new Set(
    [...STANDARD_PACKAGING, ...customPackaging].flatMap(pkg => pkg.commodities)
  )).sort()

  // Filter packaging based on search and commodity
  const filteredPackaging = [...STANDARD_PACKAGING, ...customPackaging].filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCommodity = selectedCommodity === 'all' || 
                            pkg.commodities.includes(selectedCommodity)
    return matchesSearch && matchesCommodity
  })

  // Group by category
  const groupedPackaging = filteredPackaging.reduce((groups, pkg) => {
    if (!groups[pkg.category]) {
      groups[pkg.category] = []
    }
    groups[pkg.category].push(pkg)
    return groups
  }, {} as Record<string, PackagingSpec[]>)

  const categoryLabels = {
    container: 'Containers & Clamshells',
    carton: 'Cartons & Boxes',
    bag: 'Bags & Sacks',
    bulk: 'Bulk Containers',
    specialty: 'Specialty Packaging'
  }



  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Packaging Reference', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Packaging Reference</h1>
            <p className="mt-2 text-gray-600">Industry-standard packaging options for your commodities. Add custom packaging if needed.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Custom Packaging
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search packaging types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>

            {/* Commodity Filter */}
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
            >
              <option value="all">All Commodities</option>
              {allCommodities.map(commodity => (
                <option key={commodity} value={commodity}>
                  {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Packaging Categories */}
        {Object.entries(groupedPackaging).map(([category, packages]) => (
          <div key={category} className="bg-white shadow rounded-lg">
            {/* Collapsible Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-lg font-medium text-gray-900">
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {packages.length} packaging {packages.length === 1 ? 'type' : 'types'}
                </p>
              </div>
              {collapsedCategories.has(category) ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {/* Collapsible Package List */}
            {!collapsedCategories.has(category) && (
              <div className="divide-y divide-gray-200">
                {packages.map((pkg) => (
                <div key={pkg.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {pkg.name}
                        </h3>
                        {!pkg.isStandard && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {pkg.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pkg.commodities.map(commodity => (
                          <span
                            key={commodity}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!pkg.isStandard && (
                      <button
                        onClick={() => handleDeleteCustomPackaging(pkg.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {Object.keys(groupedPackaging).length === 0 && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packaging found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or commodity filter.
            </p>
          </div>
        )}


      </div>

      {/* Add Custom Packaging Modal */}
      <AddPackagingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCustomPackaging}
        availableCommodities={userCommodities}
      />
    </>
  )
}
