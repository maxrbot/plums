"use client"

import { useState } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { STANDARD_PACKAGING, PackagingSpec, getPackagingByCategory } from '../../../../lib/packagingSpecs'
import AddPackagingModal from '../../../../components/modals/AddPackagingModal'

// Mock custom packaging (would come from user's saved data)
const mockCustomPackaging: PackagingSpec[] = [
  {
    id: 'custom-strawberry-tray',
    name: '12 oz Tray',
    description: 'Custom strawberry tray for premium market',
    commodities: ['strawberries'],
    isStandard: false,
    category: 'specialty'
  }
]

export default function PackagingReference() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState('all')
  const [customPackaging, setCustomPackaging] = useState<PackagingSpec[]>(mockCustomPackaging)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Get unique commodities from all packaging
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

  const handleAddCustomPackaging = (newPackaging: Omit<PackagingSpec, 'id' | 'isStandard'>) => {
    const customPackage: PackagingSpec = {
      ...newPackaging,
      id: `custom-${Date.now()}`,
      isStandard: false
    }
    setCustomPackaging(prev => [...prev, customPackage])
  }

  return (
    <>
      <Breadcrumbs 
        items={[
          { label: 'Price Sheets', href: '/dashboard/price-sheets' },
          { label: 'Packaging Reference', href: '/dashboard/price-sheets/packaging' }
        ]} 
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Packaging Reference</h1>
              <p className="mt-1 text-gray-600">
                Industry-standard packaging options for your commodities. Add custom packaging if needed.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-600 hover:bg-lime-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Custom Packaging
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">How it works:</p>
                <p className="mt-1">
                  When creating price sheets, packaging options are automatically filtered by commodity. 
                  Standard industry packaging is included by default. Add custom packaging types for specialized needs.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {packages.length} packaging {packages.length === 1 ? 'type' : 'types'}
              </p>
            </div>
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
                        onClick={() => {
                          setCustomPackaging(prev => prev.filter(p => p.id !== pkg.id))
                        }}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

        {/* Summary Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-600">
                {STANDARD_PACKAGING.length}
              </div>
              <div className="text-sm text-gray-500">Standard Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customPackaging.length}
              </div>
              <div className="text-sm text-gray-500">Custom Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {allCommodities.length}
              </div>
              <div className="text-sm text-gray-500">Commodities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Object.keys(categoryLabels).length}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Packaging Modal */}
      <AddPackagingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCustomPackaging}
        availableCommodities={allCommodities}
      />
    </>
  )
}
