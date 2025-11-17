"use client"

import { useState, useEffect } from 'react'
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import AddShippingPointModal from '../../../../components/modals/AddShippingPointModal'
import { ShippingPoint, GrowingRegion } from '../../../../types'
import { Breadcrumbs } from '../../../../components/ui'
import { shippingPointsApi } from '../../../../lib/api'

// Mock shipping points data
const mockShippingPoints: ShippingPoint[] = [
  {
    id: 1,
    name: 'Fresno Distribution Center',
    city: 'Fresno',
    state: 'California',
    climate: '',
    soilType: '',
    deliveryZones: [],
    status: 'active' as const,
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: 'Salinas Cooler Facility',
    city: 'Salinas',
    state: 'California',
    climate: '',
    soilType: '',
    deliveryZones: [],
    status: 'active' as const,
    createdAt: '2024-03-12'
  },
  {
    id: 3,
    name: 'Imperial Valley Warehouse',
    city: 'El Centro',
    state: 'California',
    climate: '',
    soilType: '',
    deliveryZones: [],
    status: 'active' as const,
    createdAt: '2024-03-15'
  }
]

export default function ShippingPoints() {
  const [regions, setRegions] = useState<ShippingPoint[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<ShippingPoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load regions from API
  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await shippingPointsApi.getAll()
      
      // Backend now returns transformed data with 'id' field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedRegions: ShippingPoint[] = response.regions.map((region: any, index: number) => {
        // Use MongoDB _id as the primary ID (needed for API calls), fallback to other IDs
        const regionId = region.id || region._id?.toString() || `temp_${Date.now()}_${index}`
        return {
          id: regionId,
          name: region.name || 'Unknown Region',
          city: region.location?.city || '',
          state: region.location?.state || '',
          climate: '', // Not used in new structure
          soilType: '', // Not used in new structure
          deliveryZones: [], // Not used in new structure
          status: 'active' as const,
          createdAt: region.createdAt ? new Date(region.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          // Store additional data for editing
          farmingTypes: region.farmingTypes || [],
          acreage: region.acreage || '',
          notes: region.notes || '',
          location: region.location || {},
          facilityType: region.facilityType,
          capacity: region.capacity,
          shipping: region.shipping
        }
      })
      
      setRegions(transformedRegions)
    } catch (err) {
      console.error('Failed to load regions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load regions')
      // Fall back to mock data on error
      setRegions(mockShippingPoints)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRegion = async (shippingPointData: Omit<ShippingPoint, 'id'>) => {
    if (editingRegion) {
      // Update existing region
      await handleUpdateRegion(editingRegion.id, shippingPointData)
    } else {
      // Create new region
      await handleAddRegion(shippingPointData)
    }
  }

  const handleAddRegion = async (newShippingPoint: Omit<ShippingPoint, 'id'>) => {
    try {
      setError(null)
      
      // Transform frontend data to backend format with new shipping point fields
      const shippingPointData = {
        name: newShippingPoint.name,
        facilityType: newShippingPoint.facilityType,
        location: newShippingPoint.location || {
          city: newShippingPoint.city,
          state: newShippingPoint.state,
          country: 'US',
          formattedAddress: `${newShippingPoint.city}, ${newShippingPoint.state}`,
        },
        capacity: newShippingPoint.capacity,
        notes: newShippingPoint.notes || '',
        shipping: newShippingPoint.shipping || {
          zones: [],
          methods: ['Truck'],
          leadTime: 2
        },
        // Legacy fields for backward compatibility
        farmingTypes: [],
        acreage: ''
      }

      const response = await shippingPointsApi.create(shippingPointData)
      
      // Add the new region to the list - use the MongoDB ID from response
      const regionId = response.region.id || response.region._id?.toString() || `temp_${Date.now()}_${Math.random()}`
      const transformedRegion: ShippingPoint = {
        id: regionId,
        name: response.region.name,
        city: response.region.location?.city || '',
        state: response.region.location?.state || '',
        facilityType: response.region.facilityType,
        capacity: response.region.capacity,
        status: 'active' as const,
        createdAt: new Date(response.region.createdAt).toISOString().split('T')[0],
        notes: response.region.notes || '',
        location: response.region.location,
        shipping: response.region.shipping || {
          zones: [],
          methods: ['Truck'],
          leadTime: 2
        },
        // Legacy fields for backward compatibility
        climate: '',
        soilType: '',
        deliveryZones: [],
        farmingTypes: response.region.farmingTypes || [],
        acreage: response.region.acreage || ''
      }
      
      setRegions([...regions, transformedRegion])
      setIsModalOpen(false)
      setEditingRegion(null)
    } catch (err) {
      console.error('Failed to create region:', err)
      setError(err instanceof Error ? err.message : 'Failed to create region')
    }
  }

  const handleUpdateRegion = async (regionId: number | string, updatedData: Omit<ShippingPoint, 'id'>) => {
    try {
      setError(null)
      
      // Transform frontend data to backend format
      const shippingPointData = {
        name: updatedData.name,
        facilityType: updatedData.facilityType,
        location: updatedData.location || {
          city: updatedData.city,
          state: updatedData.state,
          country: 'US',
          formattedAddress: `${updatedData.city}, ${updatedData.state}`,
        },
        capacity: updatedData.capacity,
        notes: updatedData.notes || '',
        shipping: updatedData.shipping || {
          zones: [],
          methods: ['Truck'],
          leadTime: 2
        },
        // Legacy fields for backward compatibility
        farmingTypes: [],
        acreage: ''
      }

      const response = await shippingPointsApi.update(regionId.toString(), shippingPointData)
      
      // Update the region in the list
      setRegions(prev => prev.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            name: response.region.name,
            city: response.region.location?.city || '',
            state: response.region.location?.state || '',
            facilityType: response.region.facilityType,
            capacity: response.region.capacity,
            notes: response.region.notes || '',
            location: response.region.location,
            shipping: response.region.shipping || {
              zones: [],
              methods: ['Truck'],
              leadTime: 2
            }
          }
        }
        return region
      }))
      
      setIsModalOpen(false)
      setEditingRegion(null)
    } catch (err) {
      console.error('Failed to update region:', err)
      setError(err instanceof Error ? err.message : 'Failed to update region')
    }
  }

  const handleDeleteRegion = async (regionId: number | string) => {
    try {
      setError(null)
      await shippingPointsApi.delete(regionId.toString())
      setRegions(prev => prev.filter(region => region.id !== regionId))
    } catch (err) {
      console.error('Failed to delete region:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete region')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Shipping Points', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Points</h1>
            <p className="mt-2 text-gray-600">Manage your facilities, warehouses, and distribution centers where you ship products from.</p>
          </div>
          <button
            onClick={() => {
              setEditingRegion(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Shipping Point
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Shipping Points</dt>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Shipping Points</dt>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Locations</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {regions.filter(region => region.city && region.state).length}
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadRegions}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Regions Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Shipping Points</h3>
        
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading shipping points...</p>
          </div>
        ) : regions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping points yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first shipping point.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingRegion(null)
                  setIsModalOpen(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Shipping Point
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((region) => (
              <div key={region.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{region.name}</h4>
                      <div className="flex items-center mt-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-600">{region.city}, {region.state}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Added {new Date(region.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingRegion(region)
                          setIsModalOpen(true)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit region"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRegion(region.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete region"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Add/Edit Region Modal */}
      <AddShippingPointModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRegion(null)
        }}
        onSave={handleSaveRegion}
        editingRegion={editingRegion}
      />
    </>
  )
}
