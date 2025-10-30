"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'

export interface DuplicatePriceSheetProduct {
  id: string
  productName: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  price: number | null
  availability: string
  isOrganic?: boolean
}

interface PriceSheetDuplicateModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  products: DuplicatePriceSheetProduct[]
  onDuplicate: (updatedData: { title: string; products: DuplicatePriceSheetProduct[] }) => Promise<void>
  isSaving?: boolean
  hasSaved?: boolean
}

export default function PriceSheetDuplicateModal({
  isOpen,
  onClose,
  title: initialTitle,
  products: initialProducts,
  onDuplicate,
  isSaving = false,
  hasSaved = false
}: PriceSheetDuplicateModalProps) {
  const [editedTitle, setEditedTitle] = useState(`Copy of ${initialTitle}`)
  const [editedProducts, setEditedProducts] = useState<DuplicatePriceSheetProduct[]>(initialProducts)

  // Reset state when modal opens with new data
  useEffect(() => {
    setEditedTitle(`Copy of ${initialTitle}`)
    setEditedProducts(initialProducts)
  }, [initialTitle, initialProducts, isOpen])

  // Group products by region
  const productsByRegion = editedProducts.reduce((groups, product) => {
    if (!groups[product.region]) {
      groups[product.region] = []
    }
    groups[product.region].push(product)
    return groups
  }, {} as Record<string, DuplicatePriceSheetProduct[]>)

  const handlePriceChange = (productId: string, newPrice: string) => {
    const priceValue = newPrice === '' ? null : parseFloat(newPrice)
    setEditedProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, price: priceValue }
          : product
      )
    )
  }

  const handleDuplicate = async () => {
    await onDuplicate({
      title: editedTitle,
      products: editedProducts
    })
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '$0.00'
    return `$${price.toFixed(2)}`
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                {/* Clean Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                      <h1 className="text-xl font-semibold text-gray-900">Duplicate Price Sheet</h1>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Success Banner */}
                {hasSaved && (
                  <div className="bg-green-50 px-6 py-3 border-b border-green-200">
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-800">Price sheet duplicated successfully!</p>
                    </div>
                  </div>
                )}

                {/* Title Input Section */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div>
                    <label htmlFor="priceSheetTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Price Sheet Title
                    </label>
                    <input
                      type="text"
                      id="priceSheetTitle"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter price sheet title"
                    />
                    <p className="mt-1 text-xs text-gray-500">Adjust the title and prices as needed for this duplicate</p>
                  </div>
                </div>

                {/* Framed Document Preview */}
                <div className="bg-gray-50 px-6 py-6">
                  <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                    {/* Document Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{editedTitle}</h2>
                      <p className="text-sm text-gray-600 text-center">
                        Adjust prices for your duplicate price sheet
                      </p>
                    </div>

                    {/* Document Content */}
                    <div className="px-8 py-6 max-h-96 overflow-y-auto">
                      {/* Products by Region */}
                      {Object.entries(productsByRegion).map(([region, regionProducts]) => (
                        <div key={region} className="mb-6">
                          <h2 className="text-lg font-medium text-gray-900 mb-3">
                            {region}
                          </h2>
                          
                          <div className="space-y-2">
                            {regionProducts.map((product) => (
                              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-medium text-gray-900">{product.productName}</span>
                                    <span className="text-sm text-gray-500">
                                      {[
                                        product.packageType,
                                        product.countSize,
                                        product.grade
                                      ].filter(Boolean).join(' • ')}
                                    </span>
                                    {product.isOrganic && (
                                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                        Organic
                                      </span>
                                    )}
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                      product.availability === 'Available' ? 'bg-green-100 text-green-700' :
                                      product.availability === 'Limited' ? 'bg-yellow-100 text-yellow-700' :
                                      product.availability === 'Coming Soon' ? 'bg-blue-100 text-blue-700' :
                                      product.availability === 'End of Season' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {product.availability}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={product.price ?? ''}
                                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {editedProducts.length} product{editedProducts.length !== 1 ? 's' : ''} • {Object.keys(productsByRegion).length} region{Object.keys(productsByRegion).length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                      onClick={onClose}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                          Create Duplicate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
