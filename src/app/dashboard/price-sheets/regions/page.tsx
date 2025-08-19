"use client"

import { useState } from 'react'
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import AddRegionModal from '../../../../components/modals/AddRegionModal'
import { GrowingRegion } from '../../../../types'
import { Breadcrumbs } from '../../../../components/ui'

// Mock regions data
const mockRegions: GrowingRegion[] = [
  {
    id: 1,
    name: 'Central Valley - Fresno',
    city: 'Fresno',
    state: 'California',
    climate: 'Mediterranean',
    soilType: 'Loam',
    deliveryZones: ['Downtown Fresno', 'North Fresno', 'Industrial District'],
    status: 'active' as const,
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: 'Salinas Valley - Salinas',
    city: 'Salinas',
    state: 'California',
    climate: 'Mediterranean',
    soilType: 'Sandy Loam',
    deliveryZones: ['Salinas City', 'Monterey Peninsula', 'Carmel Valley'],
    status: 'active' as const,
    createdAt: '2024-03-12'
  },
  {
    id: 3,
    name: 'Imperial Valley - El Centro',
    city: 'El Centro',
    state: 'California',
    climate: 'Desert',
    soilType: 'Clay',
    deliveryZones: ['El Centro', 'Brawley', 'Calexico'],
    status: 'active' as const,
    createdAt: '2024-03-15'
  }
]

export default function GrowingRegions() {
  const [regions, setRegions] = useState<GrowingRegion[]>(mockRegions)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddRegion = (newRegion: Omit<GrowingRegion, 'id'>) => {
    setRegions(prev => [...prev, { ...newRegion, id: Date.now() }])
  }

  const handleDeleteRegion = (regionId: number) => {
    setRegions(prev => prev.filter(region => region.id !== regionId))
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Growing Regions', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Growing Regions</h1>
            <p className="mt-2 text-gray-600">Define where you grow your crops and your delivery zones.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Region
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Regions</dt>
                  <dd className="text-lg font-medium text-gray-900">{regions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Regions</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {regions.filter(region => region.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Delivery Zones</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {regions.reduce((total, region) => total + region.deliveryZones.length, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">States</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(regions.map(region => region.state)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Growing Regions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {regions.map((region) => (
            <div key={region.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{region.name}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Location</h5>
                      <p>{region.city}, {region.state}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Climate & Soil</h5>
                      <p>{region.climate} • {region.soilType}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Delivery Zones</h5>
                      <p className="text-xs">{region.deliveryZones.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Added</h5>
                      <p>{new Date(region.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteRegion(region.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRegion}
      />
    </>
  )
}
