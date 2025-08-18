"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { GrowingRegion } from '../../types'

interface AddRegionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (region: Omit<GrowingRegion, 'id'>) => void
}

export default function AddRegionModal({ isOpen, onClose, onSave }: AddRegionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    farmingTypes: [] as string[],
    acreage: '',
    climate: '',
    soilType: '',
    notes: '',
    status: 'active' as const
  })
  
  const [showNotesInput, setShowNotesInput] = useState(false)

  // Farming type options
  const farmingTypeOptions = [
    'Orchard',
    'Row Crops', 
    'Vineyard',
    'Greenhouse',
    'Hydroponic',
    'Pasture',
    'Mixed Farming',
    'Specialty Crops',
    'Regenerative',
    'Berry Farm'
  ]

  // Acreage options
  const acreageOptions = [
    { value: 'under-50', label: 'Under 50 acres' },
    { value: '50-200', label: '50-200 acres' },
    { value: '200-500', label: '200-500 acres' },
    { value: '500+', label: '500+ acres' }
  ]

  const toggleFarmingType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      farmingTypes: prev.farmingTypes.includes(type)
        ? prev.farmingTypes.filter(t => t !== type)
        : [...prev.farmingTypes, type]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Transform the data to match the existing GrowingRegion interface
    const regionData = {
      name: formData.name,
      city: formData.location, // Store location in city field for now
      state: '', // Will be populated from Google Maps API later
      climate: formData.climate,
      soilType: formData.soilType,
      deliveryZones: [], // Remove delivery zones for now
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0]
    }
    onSave(regionData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      location: '',
      farmingTypes: [],
      acreage: '',
      climate: '',
      soilType: '',
      notes: '',
      status: 'active' as const
    })
    setShowNotesInput(false)
    onClose()
  }



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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
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
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Add Growing Region
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Add a new growing region with location, farming types, and agricultural details.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Region Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Central Valley - Fresno"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Start typing city, state..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Google Maps integration coming soon
                      </p>
                    </div>
                  </div>

                  {/* Farming Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Farming Types
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {farmingTypeOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleFarmingType(type)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            formData.farmingTypes.includes(type)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Approximate Acreage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Approximate Acreage
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {acreageOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                            formData.acreage === option.value
                              ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="acreage"
                            value={option.value}
                            checked={formData.acreage === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, acreage: e.target.value }))}
                            className="sr-only"
                          />
                          <span className="flex flex-1 justify-center">
                            <span className={`block text-sm font-medium text-center ${
                              formData.acreage === option.value ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {option.label}
                            </span>
                          </span>
                          {formData.acreage === option.value && (
                            <div className="absolute top-2 right-2">
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Climate and Soil Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="climate" className="block text-sm font-medium text-gray-700">
                        Climate
                      </label>
                      <select
                        id="climate"
                        value={formData.climate}
                        onChange={(e) => setFormData(prev => ({ ...prev, climate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select climate</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Desert">Desert</option>
                        <option value="Temperate">Temperate</option>
                        <option value="Tropical">Tropical</option>
                        <option value="Continental">Continental</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
                        Soil Type
                      </label>
                      <select
                        id="soilType"
                        value={formData.soilType}
                        onChange={(e) => setFormData(prev => ({ ...prev, soilType: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select soil type</option>
                        <option value="Loam">Loam</option>
                        <option value="Clay">Clay</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Silt">Silt</option>
                        <option value="Peat">Peat</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes Section */}
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
                        placeholder="Additional information about this region..."
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
                      Add Region
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
