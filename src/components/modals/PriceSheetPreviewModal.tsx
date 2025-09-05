"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline'

interface PriceSheetProduct {
  id: string
  productName: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  basePrice: number
  adjustedPrice: number
  availability: string
  showStrikethrough?: boolean // whether to show strikethrough for discounts
}

interface PriceSheetPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onTitleChange?: (title: string) => void
  products: PriceSheetProduct[]
  contactInfo?: {
    name: string
    pricingTier: string
    pricingAdjustment: number
  }
  onSave?: () => void
  isSaving?: boolean
  hasSaved?: boolean
  mode?: 'save' | 'send' // 'save' shows save button, 'send' is for preview only
}

export default function PriceSheetPreviewModal({
  isOpen,
  onClose,
  title,
  onTitleChange,
  products,
  contactInfo,
  onSave,
  isSaving = false,
  hasSaved = false,
  mode = 'save'
}: PriceSheetPreviewModalProps) {
  // Group products by region
  const productsByRegion = products.reduce((groups, product) => {
    if (!groups[product.region]) {
      groups[product.region] = []
    }
    groups[product.region].push(product)
    return groups
  }, {} as Record<string, PriceSheetProduct[]>)

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

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
                {/* Minimal Header */}
                <div className="bg-white px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h1 className="text-lg font-semibold text-gray-900">Price Sheet Preview</h1>
                      <div className="text-sm text-gray-500">
                        AcreList • sales@acrelist.com • (555) 123-4567
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Title Input Section */}
                {mode === 'save' && onTitleChange && (
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div>
                      <label htmlFor="priceSheetTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Price Sheet Title
                      </label>
                      <input
                        type="text"
                        id="priceSheetTitle"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter price sheet title"
                      />
                      <p className="mt-1 text-xs text-gray-500">This will be the title shown on your price sheet</p>
                    </div>
                  </div>
                )}

                {/* Preview Header with Title */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 text-center">{title}</h2>
                  <p className="text-sm text-gray-500 text-center mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Clean Preview Content */}
                <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">

                  {/* Clean Products by Region */}
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
                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                  product.availability === 'Available' ? 'bg-green-100 text-green-700' :
                                  product.availability === 'Limited' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {product.availability}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {product.showStrikethrough && product.adjustedPrice < product.basePrice && (
                                  <span className="text-sm text-red-500 line-through">
                                    {formatPrice(product.basePrice)}
                                  </span>
                                )}
                                <span className="text-lg font-semibold text-gray-900">
                                  {formatPrice(product.adjustedPrice)}
                                </span>
                              </div>
                              {product.adjustedPrice < product.basePrice && product.showStrikethrough && (
                                <div className="text-xs text-green-600 font-medium">
                                  Save {formatPrice(product.basePrice - product.adjustedPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {products.length} product{products.length !== 1 ? 's' : ''} • {Object.keys(productsByRegion).length} region{Object.keys(productsByRegion).length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {mode === 'save' && (
                      <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving || !onSave || hasSaved}
                        className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                          hasSaved 
                            ? 'text-green-700 bg-green-100 cursor-not-allowed'
                            : 'text-white bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : hasSaved ? (
                          <>
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Saved
                          </>
                        ) : (
                          <>
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Save Price Sheet
                          </>
                        )}
                      </button>
                    )}
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
