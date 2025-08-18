"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CropManagement, CropVariation, GrowingRegion } from '../../types'
import { getCategoryNames, getCommodityNames, getVarietiesByCommodity } from '../../config/commodityOptions'

interface AddVariationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cropManagement: CropManagement) => void
  availableRegions: GrowingRegion[]
  existingCrop?: CropManagement // For editing existing commodity
  isEditMode?: boolean
}

// Certification and practice options
const organicCertifications = [
  'USDA Organic', 'CCOF Certified', 'Oregon Tilth Certified', 'Demeter Certified', 
  'Fair Trade Certified', 'Biodynamic Certified', 'Regenerative Agriculture', 'Soil Health Certified'
]

const conventionalPractices = [
  'Non-GMO Verified', 'GMO-Free', 'Cover Cropping', 'Carbon Farming', 'Water Conservation', 
  'Sustainable Farming', 'Habitat Conservation', 'Integrated Pest Management', 'Precision Agriculture'
]

const growingPractices = [
  'Organic', 'Sustainable', 'Hydroponic', 'Heirloom', 'Non-GMO', 
  'Biodynamic', 'Regenerative', 'Integrated Pest Management'
]

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

export default function AddVariationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  availableRegions, 
  existingCrop,
  isEditMode = false 
}: AddVariationModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    commodity: '',
    variations: [] as Omit<CropVariation, 'id'>[]
  })

  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false)
  const [showAddVariationForm, setShowAddVariationForm] = useState(false)
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [currentVariation, setCurrentVariation] = useState<Omit<CropVariation, 'id'>>({
    variety: '',
    isOrganic: false,
    growingRegions: [],
    targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
    growingPractices: [],
    minOrder: 0,
    orderUnit: 'case',
    notes: ''
  })

  // Get available options
  const categories = getCategoryNames()
  const commodities = formData.category ? getCommodityNames(formData.category) : []
  const varieties = (formData.category && formData.commodity) ? getVarietiesByCommodity(formData.category, formData.commodity) : []

  // Initialize form data if editing
  useEffect(() => {
    if (existingCrop && isEditMode) {
      setFormData({
        category: existingCrop.category,
        commodity: existingCrop.commodity,
        variations: existingCrop.variations.map(v => ({
          variety: v.variety,
          isOrganic: v.isOrganic,
          growingRegions: v.growingRegions,
          targetPricing: v.targetPricing,
          growingPractices: v.growingPractices,
          minOrder: v.minOrder,
          orderUnit: v.orderUnit,
          notes: v.notes
        }))
      })
    }
  }, [existingCrop, isEditMode])

  // Reset dependent fields when category changes
  useEffect(() => {
    if (formData.category) {
      setFormData(prev => ({ ...prev, commodity: '', variations: [] }))
    }
  }, [formData.category])

  // Reset commodity when commodity changes
  useEffect(() => {
    if (formData.commodity) {
      setFormData(prev => ({ ...prev, variations: [] }))
    }
  }, [formData.commodity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.variations.length === 0) {
      alert('Please add at least one variation')
      return
    }

    const cropManagement: CropManagement = {
      id: existingCrop?.id || `crop_${Date.now()}`,
      category: formData.category,
      commodity: formData.commodity,
      variations: formData.variations.map((v, index) => ({
        ...v,
        id: `variation_${Date.now()}_${index}`
      })),
      status: 'active',
      createdAt: existingCrop?.createdAt || new Date().toISOString()
    }

    onSave(cropManagement)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      category: '',
      commodity: '',
      variations: []
    })
    setCurrentVariation({
      variety: '',
      isOrganic: false,
      growingRegions: [],
      targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
      growingPractices: [],
      minOrder: 0,
      orderUnit: 'case',
      notes: ''
    })
    setShowAdditionalInputs(false)
    setShowAddVariationForm(false)
    onClose()
  }

  const addVariation = () => {
    if (!currentVariation.variety) {
      alert('Please select a variety')
      return
    }
    if (currentVariation.growingRegions.length === 0) {
      alert('Please select at least one growing region')
      return
    }

    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { ...currentVariation }]
    }))

    // Reset current variation
    setCurrentVariation({
      variety: '',
      isOrganic: false,
      growingRegions: [],
      targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
      growingPractices: [],
      minOrder: 0,
      orderUnit: 'case',
      notes: ''
    })
    setShowAdditionalInputs(false)
    setShowAddVariationForm(false)
  }

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }))
  }

  const toggleGrowingRegion = (region: GrowingRegion) => {
    const regionConfig = {
      regionId: region.id.toString(),
      regionName: region.name,
      seasonality: { startMonth: 0, endMonth: 0, isYearRound: false }
    }

    setCurrentVariation(prev => ({
      ...prev,
      growingRegions: prev.growingRegions.some(r => r.regionId === region.id.toString())
        ? prev.growingRegions.filter(r => r.regionId !== region.id.toString())
        : [...prev.growingRegions, regionConfig]
    }))
  }

  const updateRegionSeasonality = (regionId: string, field: keyof typeof currentVariation.growingRegions[0]['seasonality'], value: number | boolean) => {
    setCurrentVariation(prev => ({
      ...prev,
      growingRegions: prev.growingRegions.map(region => 
        region.regionId === regionId 
          ? { ...region, seasonality: { ...region.seasonality, [field]: value } }
          : region
      )
    }))
  }

  const toggleGrowingPractice = (practice: string) => {
    setCurrentVariation(prev => ({
      ...prev,
      growingPractices: prev.growingPractices.includes(practice)
        ? prev.growingPractices.filter(p => p !== practice)
        : [...prev.growingPractices, practice]
    }))
  }

  const getAvailableCertifications = () => {
    return currentVariation.isOrganic ? organicCertifications : conventionalPractices
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <SparklesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {isEditMode ? 'Edit Variations' : 'Add New Variation'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {isEditMode 
                          ? `Manage variations for ${existingCrop?.commodity}`
                          : 'Configure a new crop with variations and growing details.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Category and Commodity Selection */}
                  {!isEditMode && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <select
                          id="category"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">
                          Commodity *
                        </label>
                        <select
                          id="commodity"
                          required
                          disabled={!formData.category}
                          value={formData.commodity}
                          onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                          <option value="">{formData.category ? 'Select commodity' : 'Select category first'}</option>
                          {commodities.map(commodity => (
                            <option key={commodity.id} value={commodity.id}>{commodity.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Current Variations Summary */}
                  {formData.variations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Current Variations ({formData.variations.length})</h4>
                      <div className="space-y-2">
                        {formData.variations.map((variation, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-md p-3 border">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                {variation.variety} ({variation.isOrganic ? 'Organic' : 'Conventional'})
                              </span>
                              <span className="text-xs text-gray-500">
                                {variation.growingRegions.length} region(s)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariation(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variation Form - Conditional rendering based on state */}
                  {formData.commodity && (formData.variations.length === 0 || showAddVariationForm || isEditMode) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        {formData.variations.length === 0 ? 'Add First Variation' : 
                         isEditMode ? `Add New Variation to ${formData.commodity.replace('-', ' ')}` : 
                         'Add Another Variation'}
                      </h4>
                      
                      {/* Basic Variation Details */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
                        <div>
                          <label htmlFor="variety" className="block text-sm font-medium text-gray-700">
                            Variety *
                          </label>
                          <select
                            id="variety"
                            required
                            value={currentVariation.variety}
                            onChange={(e) => setCurrentVariation(prev => ({ ...prev, variety: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Select variety</option>
                            {varieties.map(variety => (
                              <option key={variety} value={variety}>{variety}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Growing Method *
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="growingMethod"
                                checked={currentVariation.isOrganic}
                                onChange={() => setCurrentVariation(prev => ({ ...prev, isOrganic: true }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Organic</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="growingMethod"
                                checked={!currentVariation.isOrganic}
                                onChange={() => setCurrentVariation(prev => ({ ...prev, isOrganic: false }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Conventional</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Growing Regions */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Growing Regions *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableRegions.map(region => {
                            const isSelected = currentVariation.growingRegions.some(r => r.regionId === region.id.toString())
                            const regionConfig = currentVariation.growingRegions.find(r => r.regionId === region.id.toString())
                            
                            return (
                              <div key={region.id} className="relative">
                                <label className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-blue-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleGrowingRegion(region)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-900">{region.name}</span>
                                  </div>
                                  
                                  {/* Month Selection for Selected Regions */}
                                  {isSelected && regionConfig && (
                                    <div className="mt-3 ml-6">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-700">Growing Season:</span>
                                        <button
                                          type="button"
                                          onClick={() => updateRegionSeasonality(regionConfig.regionId, 'isYearRound', true)}
                                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                          Select All (Year-round)
                                        </button>
                                      </div>
                                      
                                      {!regionConfig.seasonality.isYearRound && (
                                        <div className="grid grid-cols-6 gap-1">
                                          {months.map(month => (
                                            <button
                                              key={month.value}
                                              type="button"
                                              onClick={() => {
                                                const currentStart = regionConfig.seasonality.startMonth
                                                const currentEnd = regionConfig.seasonality.endMonth
                                                
                                                if (currentStart === 0) {
                                                  // First month selected
                                                  updateRegionSeasonality(regionConfig.regionId, 'startMonth', month.value)
                                                } else if (currentEnd === 0 && month.value > currentStart) {
                                                  // Second month selected
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', month.value)
                                                } else if (month.value === currentStart) {
                                                  // Deselect start month
                                                  updateRegionSeasonality(regionConfig.regionId, 'startMonth', 0)
                                                } else if (month.value === currentEnd) {
                                                  // Deselect end month
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', 0)
                                                } else if (month.value > currentStart && month.value < currentEnd) {
                                                  // Month in range, do nothing
                                                } else if (month.value < currentStart) {
                                                  // New start month
                                                  updateRegionSeasonality(regionConfig.regionId, 'startMonth', month.value)
                                                } else {
                                                  // New end month
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', month.value)
                                                }
                                              }}
                                              className={`px-2 py-1 text-xs rounded border transition-colors ${
                                                regionConfig.seasonality.startMonth === month.value || regionConfig.seasonality.endMonth === month.value
                                                  ? 'bg-green-100 border-blue-300 text-blue-800'
                                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                              }`}
                                            >
                                              {month.label.slice(0, 3)}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {regionConfig.seasonality.isYearRound && (
                                        <div className="text-xs text-blue-600 font-medium">
                                          ✓ Year-round growing
                                        </div>
                                      )}
                                      
                                      {!regionConfig.seasonality.isYearRound && regionConfig.seasonality.startMonth > 0 && regionConfig.seasonality.endMonth > 0 && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          {months[regionConfig.seasonality.startMonth - 1].label} - {months[regionConfig.seasonality.endMonth - 1].label}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>



                      {/* Additional Inputs Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowAdditionalInputs(!showAdditionalInputs)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showAdditionalInputs ? (
                          <>
                            <ChevronUpIcon className="h-4 w-4 mr-1" />
                            Hide Additional Inputs
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                            Show Additional Inputs
                          </>
                        )}
                      </button>

                      {/* Additional Inputs */}
                      {showAdditionalInputs && (
                        <div className="mt-4 space-y-6 border-t border-gray-200 pt-4">
                          {/* 1. Target Pricing Section */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900">Target Pricing</h5>
                              <p className="text-xs text-gray-600 mt-1">These prices will flow through to the price sheet generator as suggested values.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Min Price
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentVariation.targetPricing.minPrice === 0 ? '' : currentVariation.targetPricing.minPrice}
                                    onChange={(e) => setCurrentVariation(prev => ({
                                      ...prev,
                                      targetPricing: { ...prev.targetPricing, minPrice: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="pl-7 pr-3 py-2 mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Max Price
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                  </div>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentVariation.targetPricing.maxPrice === 0 ? '' : currentVariation.targetPricing.maxPrice}
                                    onChange={(e) => setCurrentVariation(prev => ({
                                      ...prev,
                                      targetPricing: { ...prev.targetPricing, maxPrice: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="pl-7 pr-3 py-2 mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Unit
                                </label>
                                <select
                                  value={currentVariation.targetPricing.unit}
                                  onChange={(e) => setCurrentVariation(prev => ({
                                    ...prev,
                                    targetPricing: { ...prev.targetPricing, unit: e.target.value }
                                  }))}
                                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="lb">lb</option>
                                  <option value="kg">kg</option>
                                  <option value="piece">piece</option>
                                  <option value="bunch">bunch</option>
                                  <option value="head">head</option>
                                  <option value="box">box</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* 2. Order Requirements Section */}
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900">Order Requirements</h5>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Min Order
                                </label>
                                <input
                                  type="number"
                                  value={currentVariation.minOrder === 0 ? '' : currentVariation.minOrder}
                                  onChange={(e) => setCurrentVariation(prev => ({ ...prev, minOrder: parseInt(e.target.value) || 0 }))}
                                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                  placeholder="e.g. 3, 500, 50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Order Unit
                                </label>
                                <select
                                  value={currentVariation.orderUnit || 'case'}
                                  onChange={(e) => setCurrentVariation(prev => ({ ...prev, orderUnit: e.target.value }))}
                                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="case">Cases</option>
                                  <option value="pallet">Pallets</option>
                                  <option value="box">Boxes</option>
                                  <option value="piece">Pieces</option>
                                  <option value="bunch">Bunches</option>
                                  <option value="head">Heads</option>
                                  <option value="bushel">Bushels</option>
                                  <option value="lb">Pounds</option>
                                  <option value="kg">Kilograms</option>
                                  <option value="ton">Tons</option>
                                  <option value="dollar">Dollars</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* 3. Additional Certifications Section */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900">
                                Optional {currentVariation.isOrganic ? 'Certifications' : 'Practices & Certifications'}
                              </h5>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {getAvailableCertifications().map(cert => (
                                <label key={cert} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={currentVariation.growingPractices.includes(cert)}
                                    onChange={() => toggleGrowingPractice(cert)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{cert}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* 4. Notes Section */}
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                              </label>
                              <textarea
                                rows={3}
                                value={currentVariation.notes}
                                onChange={(e) => setCurrentVariation(prev => ({ ...prev, notes: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder="Additional notes about this variation..."
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
                        </div>
                      )}

                      {/* Add Variation Button */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addVariation}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {formData.variations.length === 0 ? 'Add First Variation' : 'Add This Variation'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show Add Another Variation button when variations exist and form is hidden */}
                  {formData.commodity && formData.variations.length > 0 && !showAddVariationForm && !isEditMode && (
                          <div className="text-center py-6">
                            <button
                              type="button"
                              onClick={() => {
                                // Reset current variation form and show it
                                setCurrentVariation({
                                  variety: '',
                                  isOrganic: false,
                                  growingRegions: [],
                                  targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
                                  growingPractices: [],
                                  minOrder: 0,
                                  orderUnit: 'case',
                                  notes: ''
                                })
                                setShowAdditionalInputs(false)
                                // Show the form by setting a flag or state
                                setShowAddVariationForm(true)
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Add Another Variation
                            </button>
                          </div>
                  )}
                  {/* Form Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formData.variations.length === 0}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      {isEditMode ? 'Save Changes' : 'Save Variations'}
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
