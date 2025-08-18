"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Capability } from '../../types'

interface AddCapabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (capability: Omit<Capability, 'id'>) => void
  availableCrops: string[]
  availableRegions: string[]
  modalType?: 'certification' | 'packaging'
}

export default function AddCapabilityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  availableCrops, 
  availableRegions,
  modalType 
}: AddCapabilityModalProps) {
  const [selectedType, setSelectedType] = useState<Capability['type'] | ''>(modalType || '')
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'certification' as Capability['type'],
    status: 'active' as Capability['status'],
    validUntil: '',
    description: '',
    appliesTo: [] as string[],
    growingRegions: [] as string[],
    documents: [''],
    notes: '',
    // Packaging specific
    packageType: '',
    packageMeasurement: '',
    packageUnit: '',
    isCustomCert: false
  })

  // Common certifications
  const commonCertifications = [
    'USDA Organic',
    'SQF (Safe Quality Food)',
    'BRC (British Retail Consortium)',
    'GlobalGAP',
    'HACCP',
    'Non-GMO Project Verified',
    'Fair Trade Certified',
    'Rainforest Alliance',
    'CCOF Certified',
    'Biodynamic Certified',
    'Other/Custom'
  ]

  // Package types
  const packageTypes = [
    'Clamshell',
    'Bag',
    'Carton',
    'Box',
    'Tray',
    'Punnet',
    'Bulk Bin',
    'Pouch',
    'Net Bag',
    'Wrapped'
  ]

  // Units for packaging
  const packageUnits = [
    { value: 'lb', label: 'pounds (lb)' },
    { value: 'oz', label: 'ounces (oz)' },
    { value: 'kg', label: 'kilograms (kg)' },
    { value: 'g', label: 'grams (g)' },
    { value: 'ct', label: 'count (ct)' },
    { value: 'each', label: 'each' },
    { value: 'dozen', label: 'dozen' }
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file')
        return
      }
      
      setUploadedFile(file)
      // Update documents array with file name
      setFormData(prev => ({
        ...prev,
        documents: [file.name]
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build the capability name based on type
    let capabilityName = formData.name
    if (selectedType === 'packaging') {
      capabilityName = `${formData.packageMeasurement} ${formData.packageUnit} ${formData.packageType}`.trim()
    }
    
    onSave({
      ...formData,
      name: capabilityName,
      type: selectedType as Capability['type'],
      createdAt: new Date().toISOString()
    })
    handleClose()
  }

  const handleClose = () => {
    setSelectedType(modalType || '')
    setShowNotesInput(false)
    setUploadedFile(null)
    setFormData({
      name: '',
      type: 'certification' as Capability['type'],
      status: 'active' as Capability['status'],
      validUntil: '',
      description: '',
      appliesTo: [],
      growingRegions: [],
      documents: [],
      notes: '',
      packageType: '',
      packageMeasurement: '',
      packageUnit: '',
      isCustomCert: false
    })
    onClose()
  }

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      appliesTo: prev.appliesTo.includes(crop)
        ? prev.appliesTo.filter(c => c !== crop)
        : [...prev.appliesTo, crop]
    }))
  }

  const capabilityTypes = [
    { value: 'certification', label: 'Certification', available: true },
    { value: 'packaging', label: 'Packaging', available: true },
    { value: 'processing', label: 'Processing - Coming Soon', available: false }
  ]

  // Check if crops exist
  const noCropsAvailable = !availableCrops || availableCrops.length === 0

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {modalType === 'certification' ? 'Add Certification' : 
                       modalType === 'packaging' ? 'Add Packaging Type' :
                       'Add Capability or Certification'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Configure a new capability, certification, or quality standard for your agricultural operations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Crops Warning */}
                {noCropsAvailable ? (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-600">
                      <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">
                        Add Crops First
                      </h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        You need to add crops to your catalog before setting up capabilities and certifications.
                        Capabilities are applied to specific crops in your price sheets.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose()
                          window.location.href = '/dashboard/price-sheets/setup/crops'
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Crop Management
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Type Selection - only show if modalType not provided */}
                    {!modalType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          What type of capability are you adding? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {capabilityTypes.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              disabled={!type.available}
                              onClick={() => {
                                if (type.available) {
                                  setSelectedType(type.value as Capability['type'])
                                }
                              }}
                              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                                selectedType === type.value
                                  ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                                  : type.available
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span className="flex flex-1">
                                <span className="flex flex-col">
                                  <span className={`block text-sm font-medium ${
                                    selectedType === type.value ? 'text-blue-900' : 
                                    type.available ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {type.label}
                                  </span>
                                </span>
                              </span>
                              {selectedType === type.value && (
                                <div className="absolute top-4 right-4">
                                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conditional Forms Based on Type */}
                    {selectedType === 'certification' && (
                      <div className="space-y-6">
                        {/* Certification Type and Valid Until - Same Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="certification" className="block text-sm font-medium text-gray-700">
                              Certification Type *
                            </label>
                            <select
                              id="certification"
                              required
                              value={formData.isCustomCert ? 'Other/Custom' : formData.name}
                              onChange={(e) => {
                                const isCustom = e.target.value === 'Other/Custom'
                                setFormData(prev => ({ 
                                  ...prev, 
                                  name: isCustom ? '' : e.target.value,
                                  isCustomCert: isCustom
                                }))
                              }}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Select certification</option>
                              {commonCertifications.map(cert => (
                                <option key={cert} value={cert}>{cert}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                              Valid Until
                            </label>
                            <input
                              type="date"
                              id="validUntil"
                              value={formData.validUntil}
                              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty if no expiration</p>
                          </div>
                        </div>

                        {/* Custom Certification Input */}
                        {formData.isCustomCert && (
                          <div>
                            <label htmlFor="customCert" className="block text-sm font-medium text-gray-700">
                              Custom Certification Name *
                            </label>
                            <input
                              type="text"
                              id="customCert"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="Enter certification name"
                            />
                          </div>
                        )}

                        {/* Document Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Certification Document (optional)
                          </label>
                          <div className="mt-1 flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-8 w-8 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Upload a file</span>
                                  <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                            </div>
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm text-green-800 font-medium">{uploadedFile.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadedFile(null)
                                    setFormData(prev => ({ ...prev, documents: [] }))
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedType === 'packaging' && (
                      <div className="space-y-6">
                        {/* Package Type */}
                        <div>
                          <label htmlFor="packageType" className="block text-sm font-medium text-gray-700">
                            Package Type *
                          </label>
                          <select
                            id="packageType"
                            required
                            value={formData.packageType}
                            onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Select package type</option>
                            {packageTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* Size/Measurement */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Size/Measurement *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="packageMeasurement" className="block text-sm text-gray-600">
                                Measurement
                              </label>
                              <input
                                type="number"
                                id="packageMeasurement"
                                required
                                step="0.1"
                                value={formData.packageMeasurement}
                                onChange={(e) => setFormData(prev => ({ ...prev, packageMeasurement: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder="e.g., 1, 2.5, 10"
                              />
                            </div>

                            <div>
                              <label htmlFor="packageUnit" className="block text-sm text-gray-600">
                                Unit
                              </label>
                              <select
                                id="packageUnit"
                                required
                                value={formData.packageUnit}
                                onChange={(e) => setFormData(prev => ({ ...prev, packageUnit: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              >
                                <option value="">Select unit</option>
                                {packageUnits.map(unit => (
                                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Example: 1 lb, 2.5 kg, 10 ct, 1 dozen
                          </p>
                        </div>

                        {/* Package Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g., Clear plastic clamshell with ventilation holes"
                          />
                        </div>
                      </div>
                    )}

                    {/* Applies To Section (for both types) */}
                    {selectedType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Applies To *
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Select which crops this {selectedType} applies to
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.appliesTo.includes('All Crops')}
                              onChange={() => toggleCrop('All Crops')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">All Current & Future Crops</span>
                          </label>
                          {availableCrops.map(crop => (
                            <label key={crop} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.appliesTo.includes(crop)}
                                onChange={() => toggleCrop(crop)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{crop}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Section */}
                    {selectedType && (
                      <>
                        {!showNotesInput ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowNotesInput(true)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              + Add a note
                            </button>
                          </div>
                        ) : (
                          <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              rows={3}
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="Additional information, requirements, or notes..."
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowNotesInput(false)}
                              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                            >
                              Hide notes
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedType}
                        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          selectedType
                            ? 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Add {selectedType === 'certification' ? 'Certification' : selectedType === 'packaging' ? 'Package Option' : 'Capability'}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
