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
}

export default function AddCapabilityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  availableCrops, 
  availableRegions 
}: AddCapabilityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'certification' as Capability['type'],
    status: 'active' as Capability['status'],
    validUntil: '',
    description: '',
    appliesTo: [] as string[],
    growingRegions: [] as string[],
    documents: [''],
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      createdAt: new Date().toISOString()
    })
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'certification' as Capability['type'],
      status: 'active' as Capability['status'],
      validUntil: '',
      description: '',
      appliesTo: [],
      growingRegions: [],
      documents: [''],
      notes: ''
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

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      growingRegions: prev.growingRegions.includes(region)
        ? prev.growingRegions.filter(r => r !== region)
        : [...prev.growingRegions, region]
    }))
  }

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, '']
    }))
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const updateDocument = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => i === index ? value : doc)
    }))
  }

  const capabilityTypes = [
    { value: 'certification', label: 'Certification' },
    { value: 'food_safety', label: 'Food Safety' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'quality', label: 'Quality Standard' },
    { value: 'processing', label: 'Processing' },
    { value: 'packaging', label: 'Packaging' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'suspended', label: 'Suspended' }
  ]

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
                      Add Capability or Certification
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Configure a new capability, certification, or quality standard for your agricultural operations.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., USDA Organic Certification"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Type *
                      </label>
                      <select
                        id="type"
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Capability['type'] }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select type</option>
                        {capabilityTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        id="status"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Capability['status'] }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Leave empty if no expiration</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Describe what this capability or certification covers..."
                    />
                  </div>

                  {/* Applicable Crops */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applies To
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.appliesTo.includes('All Crops')}
                          onChange={() => toggleCrop('All Crops')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">All Crops</span>
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

                  {/* Growing Regions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Growing Regions
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableRegions.map(region => (
                        <label key={region} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.growingRegions.includes(region)}
                            onChange={() => toggleRegion(region)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{region}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Documents
                    </label>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={doc}
                            onChange={(e) => updateDocument(index, e.target.value)}
                            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g., USDA_Organic_Cert_2024.pdf"
                          />
                          {formData.documents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDocument}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Document
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Additional information, requirements, or notes..."
                    />
                  </div>

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
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Add Capability
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
