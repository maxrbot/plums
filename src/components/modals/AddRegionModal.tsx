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
    city: '',
    state: '',
    climate: '',
    soilType: '',
    deliveryZones: [''],
    notes: '',
    status: 'active' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      status: 'active',
      createdAt: new Date().toISOString()
    })
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      climate: '',
      soilType: '',
      deliveryZones: [''],
      notes: '',
      status: 'active' as const
    })
    onClose()
  }

  const addDeliveryZone = () => {
    setFormData(prev => ({
      ...prev,
      deliveryZones: [...prev.deliveryZones, '']
    }))
  }

  const removeDeliveryZone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.filter((_, i) => i !== index)
    }))
  }

  const updateDeliveryZone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map((zone, i) => i === index ? value : zone)
    }))
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <MapPinIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Add Growing Region
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Define a new growing region with location details, climate information, and delivery zones.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="e.g., Central Valley - Fresno"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="e.g., Fresno"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="e.g., California"
                      />
                    </div>

                    <div>
                      <label htmlFor="climate" className="block text-sm font-medium text-gray-700">
                        Climate
                      </label>
                      <select
                        id="climate"
                        value={formData.climate}
                        onChange={(e) => setFormData(prev => ({ ...prev, climate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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

                  {/* Delivery Zones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Zones
                    </label>
                    <div className="space-y-2">
                      {formData.deliveryZones.map((zone, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={zone}
                            onChange={(e) => updateDeliveryZone(index, e.target.value)}
                            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            placeholder="e.g., Downtown, North Side, Industrial District"
                          />
                          {formData.deliveryZones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDeliveryZone(index)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDeliveryZone}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Add Delivery Zone
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      placeholder="Additional information about this region..."
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
                      className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
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
