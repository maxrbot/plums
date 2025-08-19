"use client"

import { useState } from 'react'
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import type { CropManagement } from '../../../../types'
import { Breadcrumbs, AddVariationModal } from '../../../../components/ui'

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
  const [crops, setCrops] = useState<CropManagement[]>(mockCrops)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddCrop = (newCrop: CropManagement) => {
    setCrops(prev => [...prev, newCrop])
  }

  const [editingCrop, setEditingCrop] = useState<CropManagement | null>(null)

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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Crops</dt>
                  <dd className="text-lg font-medium text-gray-900">{crops.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Growing Regions</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockRegions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Seasons</dt>
                  <dd className="text-lg font-medium text-gray-900">3</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Organic Crops</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {crops.filter(crop => crop.variations.some(v => v.isOrganic)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crops List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Crops</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {crops.map((crop) => (
            <div key={crop.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 capitalize">
                      {crop.commodity.replace('-', ' ')} ({crop.category.replace('-', ' ')})
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {crop.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {crop.variations.length} variation{crop.variations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Variations</h5>
                      <p className="text-xs">
                        {crop.variations.map(v => `${v.variety} (${v.isOrganic ? 'Organic' : 'Conventional'})`).join(', ')}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Growing Regions</h5>
                      <p className="text-xs">
                        {Array.from(new Set(crop.variations.flatMap(v => v.growingRegions.map(r => r.regionName)))).join(', ')}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Total Seasonality</h5>
                      <p className="text-xs">
                        {crop.variations.some(v => v.growingRegions.some(r => r.seasonality.isYearRound)) 
                          ? 'Year-round available' 
                          : 'Seasonal growing'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Pricing Range</h5>
                      <p className="text-xs">
                        ${Math.min(...crop.variations.map(v => v.targetPricing.minPrice))}-${Math.max(...crop.variations.map(v => v.targetPricing.maxPrice))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Added {new Date(crop.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{crop.variations.length} variation{crop.variations.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="flex items-center ml-4">
                  <button 
                    onClick={() => handleEditCrop(crop)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center space-x-1"
                    title="Edit variations for this commodity"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="text-xs">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            setCrops(prev => prev.map(crop => 
              crop.id === editingCrop.id ? cropData : crop
            ))
          } else {
            // Add new crop
            handleAddCrop(cropData)
          }
        }}
        availableRegions={mockRegions}
        existingCrop={editingCrop || undefined}
        isEditMode={!!editingCrop}
      />
    </>
  )
}
