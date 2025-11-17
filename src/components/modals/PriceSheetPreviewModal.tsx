"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, BookmarkIcon, RocketLaunchIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'

export interface PriceSheetProduct {
  id: string
  productName: string
  commodity?: string
  variety?: string
  subtype?: string // Type field (e.g., "Red", "Green" for Table Grapes)
  region: string
  packageType: string
  size?: string // Weight-based size (e.g., "40lb")
  countSize?: string // Count-based size or fruit count (e.g., "4 Count", "88s")
  grade?: string
  basePrice: number | null
  adjustedPrice: number | null
  availability: string
  showStrikethrough?: boolean // whether to show strikethrough for discounts
  // Extended options
  isStickered?: boolean
  isOrganic?: boolean
  specialNotes?: string
  hasOverride?: boolean
  overrideComment?: string
  plu?: string // PLU code
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
  userEmail?: string
  userPhone?: string
  onSave?: () => void
  onSendPriceSheet?: () => void
  isSaving?: boolean
  hasSaved?: boolean
  mode?: 'save' | 'send' // 'save' shows save button, 'send' is for preview only
  onSaveCustomPricing?: (productId: string, customValue: number | string) => void // Callback for saving custom pricing or comment
  allowPriceEditing?: boolean // Whether to allow price editing (for send mode)
  priceType?: 'FOB' | 'DELIVERED' // Initial price type
  onPriceTypeChange?: (priceType: 'FOB' | 'DELIVERED') => void // Callback when price type changes
}

export default function PriceSheetPreviewModal({
  isOpen,
  onClose,
  title,
  onTitleChange,
  products,
  contactInfo,
  userEmail,
  userPhone,
  onSave,
  onSendPriceSheet,
  isSaving = false,
  hasSaved = false,
  mode = 'save',
  onSaveCustomPricing,
  allowPriceEditing = false,
  priceType: initialPriceType = 'FOB',
  onPriceTypeChange
}: PriceSheetPreviewModalProps) {
  // Edit mode state
  const [isEditingPrices, setIsEditingPrices] = useState(false)
  const [editedPrices, setEditedPrices] = useState<Record<string, number | string>>({}) // Can be number (price) or string (comment)
  const [isSavingPrices, setIsSavingPrices] = useState(false)
  
  // Pricing tools state
  const [priceType, setPriceType] = useState<'FOB' | 'DELIVERED'>(initialPriceType)
  const [bulkAdjustment, setBulkAdjustment] = useState<string>('')
  
  // Update local state when prop changes OR when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal opened - syncing priceType:', initialPriceType)
      setPriceType(initialPriceType)
    }
  }, [initialPriceType, isOpen])
  
  // Notify parent when price type changes
  const handlePriceTypeChange = (newPriceType: 'FOB' | 'DELIVERED') => {
    console.log('💰 Price type changed to:', newPriceType)
    console.log('💰 onPriceTypeChange callback exists?', !!onPriceTypeChange)
    setPriceType(newPriceType)
    if (onPriceTypeChange) {
      console.log('💰 Calling parent callback with:', newPriceType)
      onPriceTypeChange(newPriceType)
    } else {
      console.warn('⚠️ No onPriceTypeChange callback provided!')
    }
  }
  
  // Handle price/comment change - flexible input
  const handlePriceChange = (productId: string, newValue: string) => {
    // If it's a valid number, store as number; otherwise store as string (comment)
    const priceValue = parseFloat(newValue)
    if (!isNaN(priceValue) && priceValue >= 0 && newValue.trim() !== '') {
      setEditedPrices(prev => ({
        ...prev,
        [productId]: priceValue
      }))
    } else if (newValue.trim() !== '') {
      // Store as comment if it's not a valid number
      setEditedPrices(prev => ({
        ...prev,
        [productId]: newValue.trim()
      }))
    } else {
      // Remove if empty
      setEditedPrices(prev => {
        const newPrices = { ...prev }
        delete newPrices[productId]
        return newPrices
      })
    }
  }
  
  // Get price for display (edited or original)
  const getDisplayPrice = (product: PriceSheetProduct): number | null => {
    const edited = editedPrices[product.id]
    if (edited !== undefined) {
      return typeof edited === 'number' ? edited : null
    }
    return product.adjustedPrice
  }
  
  // Get comment for display (edited or original)
  const getDisplayComment = (product: PriceSheetProduct): string | undefined => {
    const edited = editedPrices[product.id]
    if (edited !== undefined && typeof edited === 'string') {
      return edited
    }
    return product.overrideComment
  }
  
  // Apply bulk adjustment to all products
  const handleApplyBulkAdjustment = () => {
    const adjustment = parseFloat(bulkAdjustment)
    if (isNaN(adjustment) || adjustment === 0) return
    
    const newEditedPrices: Record<string, number | string> = { ...editedPrices }
    
    products.forEach(product => {
      // Only apply to products with numeric prices (not comments)
      const currentPrice = getDisplayPrice(product)
      if (currentPrice !== null) {
        const newPrice = Math.max(0, currentPrice + adjustment) // Don't allow negative prices
        newEditedPrices[product.id] = parseFloat(newPrice.toFixed(2))
      }
    })
    
    setEditedPrices(newEditedPrices)
    setBulkAdjustment('') // Clear the input after applying
  }
  
  // Save custom pricing
  const handleSaveCustomPricing = () => {
    if (!onSaveCustomPricing) return
    
    setIsSavingPrices(true)
    
    // Call the callback for each edited price/comment
    Object.entries(editedPrices).forEach(([productId, value]) => {
      onSaveCustomPricing(productId, value)
    })
    
    setTimeout(() => {
      setIsSavingPrices(false)
      setIsEditingPrices(false)
    }, 300)
  }
  
  // Reset state when modal closes
  const handleClose = () => {
    setIsEditingPrices(false)
    setEditedPrices({})
    setIsSavingPrices(false)
    setPriceType('FOB')
    setBulkAdjustment('')
    onClose()
  }
  // Group products by shipping point, then by commodity
  const groupedProducts = products.reduce((acc, product) => {
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
  }, {} as Record<string, Record<string, PriceSheetProduct[]>>)

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '$0.00'
    return `$${price.toFixed(2)}`
  }
  
  const getAvailabilityBadge = (availability: string) => {
    const badgeClasses: Record<string, string> = {
      'Available': 'bg-green-50 text-green-700 border-green-200',
      'Coming Soon': 'bg-blue-50 text-blue-700 border-blue-200',
      'End of Season': 'bg-amber-50 text-amber-700 border-amber-200',
      'Limited Supply': 'bg-orange-50 text-orange-700 border-orange-200',
      'Sold Out': 'bg-red-50 text-red-700 border-red-200',
      'Program': 'bg-purple-50 text-purple-700 border-purple-200'
    }
    const className = badgeClasses[availability] || badgeClasses['Available']
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
        {availability}
      </span>
    )
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
                    <h1 className="text-xl font-semibold text-gray-900">Price Sheet Preview</h1>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Warning Banner for Missing Contact Info */}
                {(!userEmail || !userPhone) && (
                  <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Contact Information Missing
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {!userEmail && !userPhone && 'Your email and phone number are missing. '}
                            {!userEmail && userPhone && 'Your email is missing. '}
                            {userEmail && !userPhone && 'Your phone number is missing. '}
                            Please update your profile in <a href="/dashboard/settings" className="font-medium underline hover:text-yellow-900">Settings</a> so recipients can contact you.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                {/* Pricing Tools Panel - Only show when editing prices */}
                {isEditingPrices && allowPriceEditing && (
                  <div className="bg-gradient-to-r from-lime-50 to-green-50 border-y border-lime-200 px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                      {/* Price Type Toggle */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Price Type:</span>
                        <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handlePriceTypeChange('FOB')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                              priceType === 'FOB'
                                ? 'bg-lime-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            FOB
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePriceTypeChange('DELIVERED')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                              priceType === 'DELIVERED'
                                ? 'bg-lime-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            DELIVERED
                          </button>
                        </div>
                      </div>

                      {/* Bulk Adjustment Tool */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Adjust All Prices:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={bulkAdjustment}
                            onChange={(e) => setBulkAdjustment(e.target.value)}
                            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                          />
                          <button
                            type="button"
                            onClick={handleApplyBulkAdjustment}
                            disabled={!bulkAdjustment || parseFloat(bulkAdjustment) === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          (+ to add, - to subtract)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Framed Document Preview */}
                <div className="bg-gray-50 px-6 py-6">
                  <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                    {/* Document Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{title}</h2>
                      <p className="text-sm text-gray-600 text-center">
                        Pricing and Availability Subject to Change
                      </p>
                    </div>

                    {/* Document Content */}
                    <div className="px-8 py-6 max-h-[500px] overflow-y-auto">

                  {/* Products grouped by Shipping Point and Commodity */}
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

                          {/* Products Table */}
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avail</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{priceType} Price</th>
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
                                
                                return (
                                  <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-1.5">
                                        <div className="text-xs font-medium text-gray-900">
                                          {product.isOrganic && (
                                            <span className="text-green-600 font-semibold">Organic </span>
                                          )}
                                          {displayName}
                                        </div>
                                        {product.plu && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                            #{product.plu}
                                          </span>
                                        )}
                                      </div>
                                      {product.isStickered && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                                          Stickered
                                        </span>
                                      )}
                                      {product.specialNotes && (
                                        <p className="text-xs text-gray-500 mt-1">{product.specialNotes}</p>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900">{product.packageType || '-'}</td>
                                    <td className="px-3 py-2 text-xs text-gray-900">{product.size || product.countSize || '-'}</td>
                                    <td className="px-3 py-2 text-xs text-gray-900">{product.grade || '-'}</td>
                                    <td className="px-3 py-2">{getAvailabilityBadge(product.availability)}</td>
                                    <td className="px-3 py-2 text-right">
                                      {isEditingPrices && allowPriceEditing ? (
                                        <input
                                          type="text"
                                          placeholder="Price or comment"
                                          value={
                                            editedPrices[product.id] !== undefined 
                                              ? editedPrices[product.id] 
                                              : product.hasOverride && product.overrideComment
                                                ? product.overrideComment
                                                : (product.adjustedPrice || 0)
                                          }
                                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                          className="w-32 px-2 py-1 text-sm font-bold text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                                        />
                                      ) : product.hasOverride && product.overrideComment ? (
                                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                          {getDisplayComment(product)}
                                        </span>
                                      ) : (
                                        <div className="text-sm font-bold text-gray-900">
                                          {product.showStrikethrough && product.basePrice !== null && product.basePrice !== getDisplayPrice(product) ? (
                                            <div className="flex items-center justify-end space-x-2">
                                              <span className="text-xs text-gray-400 line-through">
                                                {formatPrice(product.basePrice)}
                                              </span>
                                              <span>{formatPrice(getDisplayPrice(product))}</span>
                                            </div>
                                          ) : (
                                            formatPrice(getDisplayPrice(product))
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
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
                    {products.length} product{products.length !== 1 ? 's' : ''} • {Object.keys(groupedProducts).length} shipping point{Object.keys(groupedProducts).length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Show edit controls when allowPriceEditing is true */}
                    {allowPriceEditing && !isEditingPrices && (
                      <button
                        type="button"
                        onClick={() => setIsEditingPrices(true)}
                        className="inline-flex items-center px-4 py-2 border border-lime-500 text-sm font-medium rounded-md text-lime-700 bg-white hover:bg-lime-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Modify Pricing
                      </button>
                    )}
                    
                    {/* Show save/cancel when editing */}
                    {isEditingPrices && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPrices(false)
                            setEditedPrices({})
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCustomPricing}
                          disabled={isSavingPrices || Object.keys(editedPrices).length === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isSavingPrices ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    )}
                    
                    {/* Regular close button (hidden when editing) */}
                    {!isEditingPrices && (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Close
                      </button>
                    )}
                    
                    {/* Save/Send buttons for 'save' mode */}
                    {mode === 'save' && !isEditingPrices && (
                      <>
                        {!hasSaved && onSave && (
                          <button
                            type="button"
                            onClick={onSave}
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <BookmarkIcon className="h-4 w-4 mr-2" />
                                Save Price Sheet
                              </>
                            )}
                          </button>
                        )}
                        {hasSaved && onSendPriceSheet && (
                          <button
                            type="button"
                            onClick={onSendPriceSheet}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <RocketLaunchIcon className="h-4 w-4 mr-2" />
                            Send Price Sheet
                          </button>
                        )}
                      </>
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
