"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckBadgeIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import AddCapabilityModal from '../../../../../components/modals/AddCapabilityModal'
import type { Capability } from '../../../../../types'
import { Breadcrumbs } from '../../../../../components/ui'

// Mock capabilities data
const mockCapabilities: Capability[] = [
  {
    id: 1,
    name: 'USDA Organic Certification',
    type: 'certification',
    status: 'active',
    validUntil: '2025-12-31',
    description: 'Full USDA organic certification for all crops',
    appliesTo: ['All Crops'],
    growingRegions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
    documents: ['USDA_Organic_Cert_2024.pdf'],
    notes: 'Full USDA organic certification covering all organic crops',
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: 'Global GAP Food Safety',
    type: 'food_safety',
    status: 'active',
    validUntil: '2025-06-30',
    description: 'International food safety standard certification',
    appliesTo: ['All Crops'],
    growingRegions: ['Central Valley - Fresno', 'Salinas Valley - Salinas', 'Imperial Valley - El Centro'],
    documents: ['GlobalGAP_Cert_2024.pdf'],
    notes: 'International food safety standard for all crops',
    createdAt: '2024-03-12'
  },
  {
    id: 3,
    name: 'Sustainable Farming Practices',
    type: 'sustainability',
    status: 'active',
    validUntil: null,
    description: 'Water conservation, soil health, and biodiversity practices',
    appliesTo: ['All Crops'],
    growingRegions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
    documents: ['Sustainability_Report_2024.pdf'],
    notes: 'Sustainable farming practices including water conservation and soil health',
    createdAt: '2024-03-15'
  },
  {
    id: 4,
    name: 'Premium Quality Grade',
    type: 'quality',
    status: 'active',
    validUntil: null,
    description: 'Premium grade produce with strict quality standards',
    appliesTo: ['Strawberries', 'Tomatoes', 'Lettuce'],
    growingRegions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
    documents: ['Quality_Standards_2024.pdf'],
    notes: 'Premium quality standards for select high-value crops',
    createdAt: '2024-03-18'
  }
]

// Mock growing regions for reference
const mockRegions = [
  'Central Valley - Fresno',
  'Salinas Valley - Salinas',
  'Imperial Valley - El Centro'
]

// Mock crops for reference
const mockCrops = [
  'Strawberries', 'Lettuce', 'Tomatoes', 'Broccoli', 'Cauliflower',
  'Grapes', 'Almonds', 'Pistachios', 'Dates', 'Alfalfa'
]

export default function Capabilities() {
  const [capabilities, setCapabilities] = useState<Capability[]>(mockCapabilities)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddCapability = (newCapability: Omit<Capability, 'id'>) => {
    setCapabilities(prev => [...prev, { ...newCapability, id: Date.now() }])
  }

  const handleDeleteCapability = (capabilityId: number) => {
    setCapabilities(prev => prev.filter(capability => capability.id !== capabilityId))
  }

  const certificationCount = capabilities.filter(cap => cap.type === 'certification').length
  const foodSafetyCount = capabilities.filter(cap => cap.type === 'food_safety').length
  const sustainabilityCount = capabilities.filter(cap => cap.type === 'sustainability').length
  const qualityCount = capabilities.filter(cap => cap.type === 'quality').length

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Setup Your Data', href: '/dashboard/price-sheets/setup' },
            { label: 'Capabilities & Certifications', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Capabilities & Certifications</h1>
            <p className="mt-2 text-gray-600">Configure your processing capabilities, certifications, and quality metrics.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Capability
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Capabilities</dt>
                  <dd className="text-lg font-medium text-gray-900">{capabilities.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Certifications</dt>
                  <dd className="text-lg font-medium text-gray-900">{certificationCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Quality Standards</dt>
                  <dd className="text-lg font-medium text-gray-900">{qualityCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-orange-600" />
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
      </div>

      {/* Capabilities List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Capabilities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {capabilities.map((capability) => (
            <div key={capability.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{capability.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      capability.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {capability.status.charAt(0).toUpperCase() + capability.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      capability.type === 'certification' ? 'bg-blue-100 text-blue-800' :
                      capability.type === 'food_safety' ? 'bg-green-100 text-green-800' :
                      capability.type === 'sustainability' ? 'bg-green-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {capability.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{capability.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Applies To</h5>
                      <p className="text-xs">{capability.appliesTo.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Growing Regions</h5>
                      <p className="text-xs">{capability.growingRegions.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Status</h5>
                      <p>
                        {capability.validUntil ? 
                          `Valid until ${new Date(capability.validUntil).toLocaleDateString()}` :
                          'No expiration'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {capability.documents.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-900 mb-1 text-sm">Documents</h5>
                      <div className="flex space-x-2">
                        {capability.documents.map((doc, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Added {new Date(capability.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCapability(capability.id)}
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

      {/* Next Steps */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Setup Complete! 🎉
          </h3>
          <p className="text-green-700 mb-4">
            You&apos;ve configured {capabilities.length} capabilities across {mockRegions.length} growing regions. You&apos;re now ready to create professional price sheets!
          </p>
          <Link
            href="/dashboard/price-sheets/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Create Your First Price Sheet
          </Link>
        </div>
      </div>

      {/* Add Capability Modal */}
      <AddCapabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCapability}
        availableCrops={mockCrops}
        availableRegions={mockRegions}
      />
    </>
  )
}
