"use client"

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  ShieldCheckIcon, 
  TrashIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import AddCertificationModal from '../../../../components/modals/AddCertificationModal'
import { Capability, CropManagement } from '../../../../types'
import { certificationsApi, cropsApi } from '../../../../lib/api'

export default function Certifications() {
  const [certifications, setCertifications] = useState<Capability[]>([])
  const [userCrops, setUserCrops] = useState<CropManagement[]>([])
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    certification: Capability | null
  }>({ isOpen: false, certification: null })

  // Load certifications and user crops from API
  useEffect(() => {
    loadCertifications()
    loadUserCrops()
  }, [])

  const loadCertifications = async () => {
    try {
      setError(null)
      const response = await certificationsApi.getAll()
      console.log('loadCertifications - API response:', response)
      console.log('loadCertifications - certifications array:', response.certifications)
      
      const certs = response.certifications || []
      console.log('loadCertifications - setting certifications:', certs)
      if (certs.length > 0) {
        console.log('loadCertifications - first cert structure:', certs[0])
        console.log('loadCertifications - first cert keys:', Object.keys(certs[0]))
        console.log('loadCertifications - first cert _id:', certs[0]._id)
        console.log('loadCertifications - first cert id:', certs[0].id)
      }
      
      setCertifications(certs)
    } catch (err) {
      console.error('Failed to load certifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load certifications')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserCrops = async () => {
    try {
      const response = await cropsApi.getAll()
      setUserCrops(response.crops || [])
    } catch (err) {
      console.error('Failed to load user crops:', err)
    }
  }

  const handleAddCertification = async (newCertification: Omit<Capability, 'id'>) => {
    try {
      setError(null)
      
      const response = await certificationsApi.create(newCertification)
      
      // Add to local state
      setCertifications(prev => [...prev, response.certification])
      
      console.log('✅ Certification created successfully:', response.certification)
    } catch (err) {
      console.error('Failed to create certification:', err)
      setError(err instanceof Error ? err.message : 'Failed to create certification')
    }
  }

  const handleDeleteClick = (certification: Capability) => {
    console.log('handleDeleteClick - received certification:', certification)
    console.log('handleDeleteClick - certification.id:', certification.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('handleDeleteClick - certification._id:', (certification as any)._id)
    console.log('handleDeleteClick - extracted ID:', getCertificationId(certification))
    console.log('handleDeleteClick - certification keys:', Object.keys(certification))
    
    setDeleteConfirmation({
      isOpen: true,
      certification
    })
  }

  const handleDeleteConfirm = async () => {
    const certification = deleteConfirmation.certification
    console.log('Delete confirmation - certification object:', certification)
    
    if (!certification) {
      console.error('Cannot delete certification: Certification object is null/undefined')
      setError('Cannot delete certification: Invalid data')
      setDeleteConfirmation({ isOpen: false, certification: null })
      return
    }

    const certId = getCertificationId(certification)
    console.log('Delete confirmation - extracted ID:', certId)
    
    if (!certId) {
      console.error('Cannot delete certification: ID is missing', certification)
      setError('Cannot delete certification: Missing ID')
      setDeleteConfirmation({ isOpen: false, certification: null })
      return
    }

    try {
      setError(null)
      
      await certificationsApi.delete(String(certId))
      
      // Remove from local state
      setCertifications(prev => prev.filter(cert => getCertificationId(cert) !== certId))
      
      console.log('✅ Certification deleted successfully')
    } catch (err) {
      console.error('Failed to delete certification:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete certification')
    } finally {
      setDeleteConfirmation({ isOpen: false, certification: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, certification: null })
  }

  // Helper function to get the correct ID field (handles both 'id' and '_id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCertificationId = (cert: any): string | undefined => {
    return cert.id || cert._id
  }

  // Calculate certification status based on expiration
  const getCertificationStatus = (cert: Capability) => {
    if (!cert.validUntil) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' }
    }

    const today = new Date()
    const expirationDate = new Date(cert.validUntil)
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiration < 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' }
    } else if (daysUntilExpiration <= 60) {
      return { 
        status: 'expiring', 
        label: `Expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`, 
        color: 'bg-yellow-100 text-yellow-800' 
      }
    } else {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' }
    }
  }

  // Derive user commodities from crops
  const userCommodities = Array.from(new Set(userCrops.map(crop => crop.commodity))).sort()

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
              certifications.map((cert, index) => {
                console.log(`Rendering cert ${index}:`, cert)
                console.log(`Cert ${index} keys:`, Object.keys(cert))
                console.log(`Cert ${index} id:`, cert.id)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                console.log(`Cert ${index} _id:`, (cert as any)._id)
                console.log(`Cert ${index} extracted ID:`, getCertificationId(cert))
                
                return (
                <li key={getCertificationId(cert) || `cert-${index}`} className="px-4 py-4 sm:px-6">
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
                            {(() => {
                              const statusInfo = getCertificationStatus(cert)
                              return (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              )
                            })()}
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
                        onClick={() => handleDeleteClick(cert)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
                )
              })
            )}
          </ul>
        </div>
      </div>



      {/* Add Certification Modal */}
      <AddCertificationModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onSave={handleAddCertification}
        availableCrops={userCommodities}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.certification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleDeleteCancel} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Delete Certification
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <strong>{deleteConfirmation.certification.name}</strong>? 
                      This action cannot be undone and will remove this certification from all your price sheets.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
