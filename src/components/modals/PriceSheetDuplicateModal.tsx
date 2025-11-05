"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'
import { getLegacyCommodityPackaging } from '../../config'

export interface DuplicatePriceSheetProduct {
  id: string
  productName: string
  commodity?: string
  variety?: string
  subtype?: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  price: number | null
  availability: string
  isOrganic?: boolean
  isStickered?: boolean
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

  // Group products by shipping point, then by commodity
  const groupedProducts = editedProducts.reduce((acc, product) => {
    const shippingPoint = product.region || 'Other'
    
    if (!acc[shippingPoint]) {
      acc[shippingPoint] = {}
    }
    
    const commodity = product.commodity || 'Other'
    const commodityKey = commodity.charAt(0).toUpperCase() + commodity.slice(1)
    
    if (!acc[shippingPoint][commodityKey]) {
      acc[shippingPoint][commodityKey] = []
    }
    
    acc[shippingPoint][commodityKey].push(product)
    return acc
  }, {} as Record<string, Record<string, DuplicatePriceSheetProduct[]>>)

  const handleFieldChange = (productId: string, field: keyof DuplicatePriceSheetProduct, value: any) => {
    setEditedProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, [field]: value }
          : product
      )
    )
  }

  const handlePriceChange = (productId: string, newPrice: string) => {
    const priceValue = newPrice === '' ? null : parseFloat(newPrice)
    handleFieldChange(productId, 'price', priceValue)
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
  
  const getAvailabilityBadge = (availability: string) => {
    const badgeClasses: Record<string, string> = {
      'Available': 'bg-green-50 text-green-700 border-green-200',
      'Limited': 'bg-amber-50 text-amber-700 border-amber-200',
      'New Crop': 'bg-blue-50 text-blue-700 border-blue-200',
      'Pre-order': 'bg-purple-50 text-purple-700 border-purple-200'
    }
    const className = badgeClasses[availability] || badgeClasses['Available']
    return className
  }
  
  // Get available package options for a commodity
  const getPackageOptions = (commodity?: string) => {
    if (!commodity) return []
    const config = getLegacyCommodityPackaging(commodity)
    if (!config) return []
    
    // If commodity has processing, return all package types from all processing types
    if (config.hasProcessing && config.processing?.types) {
      const allPackageTypes: any[] = []
      config.processing.types.forEach((procType: any) => {
        if (procType.packageTypes) {
          allPackageTypes.push(...procType.packageTypes)
        }
      })
      return allPackageTypes
    }
    
    // Otherwise, return direct packaging types
    return config.packaging?.types || []
  }
  
  // Get available size options for a commodity and package type
  const getSizeOptions = (commodity?: string, packageType?: string) => {
    if (!commodity || !packageType) return []
    const packageOptions = getPackageOptions(commodity)
    const pkg = packageOptions.find((p: any) => p.id === packageType || p.type === packageType)
    return pkg?.sizes || []
  }
  
  // Get available grade options for a commodity
  const getGradeOptions = (commodity?: string) => {
    if (!commodity) return ['Fancy', 'Extra Fancy', 'Choice', 'Standard', 'US #1', 'US #2']
    const config = getLegacyCommodityPackaging(commodity)
    if (config?.quality?.grades && config.quality.grades.length > 0) {
      return config.quality.grades
    }
    // Fallback to common grades
    return ['Fancy', 'Extra Fancy', 'Choice', 'Standard', 'US #1', 'US #2']
  }
  
  // Get available availability options
  const getAvailabilityOptions = () => {
    return ['Available', 'Limited', 'New Crop', 'Pre-order']
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
                        Adjust all product details for your duplicate price sheet
                      </p>
                    </div>

                    {/* Document Content */}
                    <div className="px-8 py-6 max-h-[500px] overflow-y-auto">
                      <div className="space-y-6">
                        {Object.entries(groupedProducts).map(([shippingPoint, commodities]) => (
                          <div key={shippingPoint} className="space-y-4">
                            {/* Shipping Point Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Point</div>
                                  <div className="text-sm font-bold text-gray-900">{shippingPoint}</div>
                                </div>
                              </div>
                            </div>

                            {/* Commodities within this Shipping Point */}
                            {Object.entries(commodities).map(([commodity, commodityProducts]) => (
                              <div key={commodity} className="bg-white border border-gray-200 rounded-lg overflow-hidden ml-4">
                                {/* Commodity Header */}
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                  <h3 className="text-sm font-semibold text-gray-900">{commodity}</h3>
                                </div>

                                {/* Products Table - Editable */}
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avail</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {commodityProducts.map((product) => {
                                        // Build display name
                                        let displayName = '-'
                                        if (product.productName) {
                                          displayName = product.productName
                                        } else if (product.variety && product.subtype) {
                                          displayName = `${product.subtype} ${product.variety}`
                                        } else if (product.subtype) {
                                          displayName = product.subtype
                                        } else if (product.variety) {
                                          displayName = product.variety
                                        }
                                        
                                        // Remove "Organic" from display name if product is organic
                                        if (product.isOrganic && displayName.toLowerCase().startsWith('organic ')) {
                                          displayName = displayName.substring(8)
                                        }
                                        
                                        const packageOptions = getPackageOptions(product.commodity)
                                        const sizeOptions = getSizeOptions(product.commodity, product.packageType)
                                        
                                        return (
                                          <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                              <div className="text-xs font-medium text-gray-900">
                                                {product.isOrganic && (
                                                  <span className="text-green-600 font-semibold">Organic </span>
                                                )}
                                                {displayName}
                                              </div>
                                              {product.isStickered && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                                                  Stickered
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className="text-xs text-gray-900">{product.packageType || '-'}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className="text-xs text-gray-900">{product.countSize || '-'}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                              {(() => {
                                                const gradeOptions = getGradeOptions(product.commodity)
                                                return gradeOptions.length > 0 ? (
                                                  <select
                                                    value={product.grade || ''}
                                                    onChange={(e) => handleFieldChange(product.id, 'grade', e.target.value)}
                                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                  >
                                                    <option value="">-</option>
                                                    {gradeOptions.map(grade => (
                                                      <option key={grade} value={grade}>{grade}</option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <span className="text-xs text-gray-500">{product.grade || '-'}</span>
                                                )
                                              })()}
                                            </td>
                                            <td className="px-3 py-2">
                                              <select
                                                value={product.availability}
                                                onChange={(e) => handleFieldChange(product.id, 'availability', e.target.value)}
                                                className={`text-xs border rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${getAvailabilityBadge(product.availability)}`}
                                              >
                                                {getAvailabilityOptions().map(avail => (
                                                  <option key={avail} value={avail}>{avail}</option>
                                                ))}
                                              </select>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                              <div className="flex items-center justify-end space-x-1">
                                                <span className="text-gray-600 text-xs">$</span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  value={product.price ?? ''}
                                                  onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                  className="w-16 px-1 py-1 border border-gray-300 rounded text-right font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                                                  placeholder="0.00"
                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {editedProducts.length} product{editedProducts.length !== 1 ? 's' : ''} • {Object.keys(groupedProducts).length} shipping point{Object.keys(groupedProducts).length !== 1 ? 's' : ''}
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
