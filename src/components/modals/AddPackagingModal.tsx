"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import { PackagingSpec } from '../../lib/packagingSpecs'

interface AddPackagingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (packaging: Omit<PackagingSpec, 'id' | 'isStandard'>) => void
  availableCommodities: string[]
}

export default function AddPackagingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  availableCommodities
}: AddPackagingModalProps) {

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commodities: [] as string[],
    category: 'container' as 'container' | 'carton' | 'bag' | 'bulk' | 'specialty'
  })

  // Package categories
  const packageCategories = [
    { value: 'container', label: 'Container' },
    { value: 'carton', label: 'Carton' },
    { value: 'bag', label: 'Bag' },
    { value: 'bulk', label: 'Bulk' },
    { value: 'specialty', label: 'Specialty' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSave({
      ...formData,
      category: formData.category
    })
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      commodities: [],
      category: 'container'
    })
    onClose()
  }

  const toggleCommodity = (commodity: string) => {
    setFormData(prev => ({
      ...prev,
      commodities: prev.commodities.includes(commodity)
        ? prev.commodities.filter(c => c !== commodity)
        : [...prev.commodities, commodity]
    }))
  }

  // Check if commodities exist
  const noCommoditiesAvailable = !availableCommodities || availableCommodities.length === 0

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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CubeTransparentIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Add Custom Packaging
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Add a custom packaging type that is not in our standard list.
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Commodities Warning */}
                {noCommoditiesAvailable ? (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-600">
                      <CubeTransparentIcon className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">
                        Add Crops First
                      </h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        You need to add crops to your catalog before setting up custom packaging.
                        Packaging types are applied to specific commodities.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose()
                          window.location.href = '/dashboard/price-sheets/crops'
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Crop Management
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Package Name and Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Package Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g., Custom Display Box (10ct)"
                        />
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <select
                          id="category"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'container' | 'carton' | 'bag' | 'bulk' | 'specialty' }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        >
                          {packageCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <input
                        type="text"
                        id="description"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Specialized retail display box for premium berries"
                      />
                    </div>

                    {/* Applies To Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Applies To *
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Select which commodities this packaging applies to
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.commodities.includes('All Commodities')}
                            onChange={() => toggleCommodity('All Commodities')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">All Current & Future Commodities</span>
                        </label>
                        {availableCommodities.map(commodity => (
                          <label key={commodity} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.commodities.includes(commodity)}
                              onChange={() => toggleCommodity(commodity)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{commodity}</span>
                          </label>
                        ))}
                      </div>
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
                        Add Packaging
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
