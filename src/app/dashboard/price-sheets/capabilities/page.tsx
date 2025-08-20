"use client"

import { useState } from 'react'
import { 
  PlusIcon, 
  ShieldCheckIcon, 
  TrashIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import AddCertificationModal from '../../../../components/modals/AddCertificationModal'
import { Capability } from '../../../../types'

// Mock capabilities data
const mockCapabilities: Capability[] = [
  {
    id: 1,
    name: 'USDA Organic',
    type: 'certification',
    status: 'active',
    validUntil: '2025-03-15',
    description: 'Certified organic by USDA standards',
    appliesTo: ['Strawberries', 'Lettuce'],
    growingRegions: ['Central Valley - Fresno'],
    documents: ['USDA_Organic_Cert_2024.pdf'],
    notes: '',
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: '1 lb Clamshell',
    type: 'packaging',
    status: 'active',
    validUntil: '',
    description: 'Clear plastic clamshell container',
    appliesTo: ['Strawberries', 'Blueberries'],
    growingRegions: [],
    documents: [],
    notes: '',
    createdAt: '2024-03-15'
  },
  {
    id: 3,
    name: '2 lb Clamshell', 
    type: 'packaging',
    status: 'active',
    validUntil: '',
    description: 'Large plastic clamshell container',
    appliesTo: ['Strawberries'],
    growingRegions: [],
    documents: [],
    notes: '',
    createdAt: '2024-03-16'
  }
]

// Mock crops and regions
const mockCrops = [
  'Strawberries', 'Lettuce', 'Tomatoes', 'Broccoli', 'Cauliflower',
  'Grapes', 'Almonds', 'Pistachios', 'Dates', 'Alfalfa'
]

const mockRegions = [
  'Central Valley - Fresno',
  'Salinas Valley - Salinas', 
  'Imperial Valley - El Centro'
]

export default function Capabilities() {
  const [capabilities, setCapabilities] = useState<Capability[]>(mockCapabilities)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)

  const handleAddCapability = (newCapability: Omit<Capability, 'id'>) => {
    setCapabilities(prev => [...prev, { ...newCapability, id: Date.now() }])
  }

  const handleDeleteCapability = (capabilityId: number) => {
    setCapabilities(prev => prev.filter(capability => capability.id !== capabilityId))
  }

  // Filter only certifications
  const certifications = capabilities.filter(cap => cap.type === 'certification')

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Certifications', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="mt-2 text-gray-600">Manage your organic, food safety, and quality certifications for price sheet generation.</p>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your Certifications
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Organic, food safety, and other certifications you maintain.
                </p>
              </div>
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Certification
              </button>
            </div>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {certifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-500">
                <ShieldCheckIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications added yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add certifications like USDA Organic, SQF, or GlobalGAP.
                </p>
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Certification
                </button>
              </li>
            ) : (
              certifications.map((cert) => (
                <li key={cert.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {cert.name}
                            </p>
                            {cert.validUntil && (
                              <p className="text-sm text-gray-500">
                                Valid until: {new Date(cert.validUntil).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="ml-6 flex-shrink-0">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cert.status === 'active' ? 'bg-green-100 text-green-800' :
                              cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              cert.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cert.status}
                            </span>
                          </div>
                        </div>
                        {cert.appliesTo.length > 0 && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">
                              Applies to: {cert.appliesTo.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteCapability(cert.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>



      {/* Add Certification Modal */}
      <AddCertificationModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onSave={handleAddCapability}
        availableCrops={mockCrops}
      />


    </>
  )
}
