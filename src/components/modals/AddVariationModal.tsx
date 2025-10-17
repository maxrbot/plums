"use client"

import { Fragment, useState, useEffect, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CropManagement, CropVariation, GrowingRegion } from '../../types'
import { getNewCategoryNames, getNewCommodityNames, getNewVarietiesByCommodity, getNewSubtypesByCommodity, getNewVarietiesBySubtype, newCommodityHasSubtypes } from '../../config'

interface AddVariationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cropManagement: CropManagement) => void
  availableRegions: GrowingRegion[]
  existingCrops: CropManagement[] // All existing crops to check for duplicates
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
  existingCrops,
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
    subtype: '',
    variety: '',
    isOrganic: false,
    shippingPoints: [],
    targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
    growingPractices: [],
    minOrder: 0,
    orderUnit: 'case',
    notes: ''
  })

  // Get available options using new structure
  const categories = getNewCategoryNames()
  
  // Get all commodities (flattened from all categories) or filtered by category
  const allCommodities = getNewCommodityNames()
  const filteredCommodities = formData.category 
    ? allCommodities.filter(c => c.categoryId === formData.category)
    : allCommodities


  

  
  // Check if commodity has hierarchical structure
  const commodityHasSubtypes = formData.commodity ? newCommodityHasSubtypes(formData.commodity) : false
  
  // Get subtypes if commodity has them
  const subtypes = (formData.commodity && commodityHasSubtypes) ? 
    getNewSubtypesByCommodity(formData.commodity) : []
  
  // Get varieties - either from subtype or directly from commodity
  const varieties = formData.commodity ? 
    (commodityHasSubtypes && currentVariation.subtype ? 
      getNewVarietiesBySubtype(formData.commodity, currentVariation.subtype) :
      getNewVarietiesByCommodity(formData.commodity)
    ) : []

  // Simple commodity selection handler
  const handleCommodityChange = (commodityId: string) => {
    if (!commodityId) {
      // Clearing selection
      setFormData(prev => ({ ...prev, commodity: '' }))
      return
    }

    // Find the commodity info
    const selectedCommodity = allCommodities.find(c => c.id === commodityId)
    
    if (selectedCommodity) {
      // Always set both category and commodity
      setFormData(prev => ({
        ...prev,
        category: selectedCommodity.categoryId,
        commodity: commodityId
      }))
    }
  }

  // Helper function to find existing crop by category and commodity
  const findExistingCrop = useCallback((category: string, commodity: string): CropManagement | undefined => {
    return existingCrops.find(crop => crop.category === category && crop.commodity === commodity)
  }, [existingCrops])

  // Check if a commodity already has variations
  const commodityHasExistingVariations = useCallback((category: string, commodity: string): boolean => {
    const existing = findExistingCrop(category, commodity)
    return existing ? existing.variations.length > 0 : false
  }, [findExistingCrop])

  // Initialize form data if editing
  useEffect(() => {
    if (existingCrop && isEditMode) {
      setFormData({
        category: existingCrop.category,
        commodity: existingCrop.commodity,
        variations: existingCrop.variations.map(v => ({
          subtype: v.subtype || '',
          variety: v.variety || '',
          isOrganic: v.isOrganic,
          shippingPoints: v.shippingPoints || v.growingRegions || [],
          targetPricing: v.targetPricing,
          growingPractices: v.growingPractices,
          minOrder: v.minOrder,
          orderUnit: v.orderUnit,
          notes: v.notes
        }))
      })
    }
  }, [existingCrop, isEditMode])

  // Note: Removed useEffect that was resetting commodity when category changed
  // This was interfering with auto-population from commodity selection

  // Handle selection of commodity that already has existing variations
  useEffect(() => {
    if (formData.category && formData.commodity && !isEditMode) {
      const existingCrop = findExistingCrop(formData.category, formData.commodity)
      if (existingCrop && existingCrop.variations.length > 0) {
        // Auto-load existing variations when selecting a commodity that already exists
        setFormData(prev => ({
          ...prev,
          variations: existingCrop.variations.map(v => ({
            subtype: v.subtype || '',
            variety: v.variety || '',
            isOrganic: v.isOrganic,
            shippingPoints: v.shippingPoints || v.growingRegions || [],
            targetPricing: v.targetPricing,
            growingPractices: v.growingPractices,
            minOrder: v.minOrder,
            orderUnit: v.orderUnit,
            notes: v.notes
          }))
        }))
      }
    }
  }, [formData.category, formData.commodity, isEditMode, findExistingCrop])

  // Don't reset variations when commodity changes if variations already exist
  // This prevents losing work when user has already added variations

  // Reset form when modal closes or switches modes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        category: '',
        commodity: '',
        variations: []
      })
      setCurrentVariation({
        subtype: '',
        variety: '',
        isOrganic: false,
        shippingPoints: [],
        targetPricing: { minPrice: 0, maxPrice: 0, unit: 'lb', notes: '' },
        growingPractices: [],
        minOrder: 0,
        orderUnit: 'case',
        notes: ''
      })
      setShowAdditionalInputs(false)
      setShowAddVariationForm(false)
      setShowNotesInput(false)
    }
  }, [isOpen])

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
      shippingPoints: [],
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
    if (currentVariation.shippingPoints.length === 0) {
      alert('Please select at least one shipping point')
      return
    }

    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { ...currentVariation }]
    }))

    // Reset current variation
    setCurrentVariation({
      subtype: '',
      variety: '',
      isOrganic: false,
      shippingPoints: [],
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
    const regionId = region.id || region.name
    const regionConfig = {
      regionId: regionId.toString(),
      regionName: region.name,
      availability: { startMonth: 0, endMonth: 0, isYearRound: false }
    }

    setCurrentVariation(prev => ({
      ...prev,
      shippingPoints: prev.shippingPoints.some(r => r.regionId === regionId.toString())
        ? prev.shippingPoints.filter(r => r.regionId !== regionId.toString())
        : [...prev.shippingPoints, regionConfig]
    }))
  }

  const updateRegionSeasonality = (regionId: string, field: keyof typeof currentVariation.shippingPoints[0]['availability'], value: number | boolean) => {
    setCurrentVariation(prev => ({
      ...prev,
      shippingPoints: prev.shippingPoints.map(region => 
        region.regionId === regionId 
          ? { ...region, availability: { ...region.availability, [field]: value } }
          : region
      )
    }))
  }

  // Helper function to get all months in a range (handles cross-year ranges)
  const getMonthsInRange = (startMonth: number, endMonth: number): number[] => {
    if (startMonth === 0 || endMonth === 0) return []
    
    const months: number[] = []
    if (startMonth <= endMonth) {
      // Same year range (e.g., March to October)
      for (let i = startMonth; i <= endMonth; i++) {
        months.push(i)
      }
    } else {
      // Cross-year range (e.g., December to March)
      // Add months from start to end of year
      for (let i = startMonth; i <= 12; i++) {
        months.push(i)
      }
      // Add months from start of year to end
      for (let i = 1; i <= endMonth; i++) {
        months.push(i)
      }
    }
    return months
  }

  // Helper function to check if a month is in the selected range
  const isMonthInRange = (month: number, startMonth: number, endMonth: number): boolean => {
    if (startMonth === 0 || endMonth === 0) return false
    const monthsInRange = getMonthsInRange(startMonth, endMonth)
    return monthsInRange.includes(month)
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
                          Category
                          {formData.variations.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">(locked - variations added)</span>
                          )}
                        </label>
                        <select
                          id="category"
                          disabled={formData.variations.length > 0}
                          value={formData.category}
                          onChange={(e) => {
                            const newCategory = e.target.value
                            setFormData(prev => ({ 
                              ...prev, 
                              category: newCategory,
                              commodity: '' // Reset commodity when category changes manually
                            }))
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                          <option value="">All categories</option>
                          {categories.map((category, index) => (
                            <option key={`category-${category.id}-${index}`} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Leave blank to see all commodities
                        </p>
                      </div>

                      <div>
                        <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">
                          Commodity *
                          {formData.variations.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">(locked - variations added)</span>
                          )}
                        </label>
                        <select
                          id="commodity"
                          required
                          disabled={formData.variations.length > 0}
                          value={formData.commodity}
                          onChange={(e) => handleCommodityChange(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                          <option value="">Select commodity</option>
                          {filteredCommodities.map((commodity, index) => {
                            const hasExisting = commodityHasExistingVariations(commodity.categoryId, commodity.id)
                            const existingCount = hasExisting ? findExistingCrop(commodity.categoryId, commodity.id)?.variations.length || 0 : 0
                            
                            return (
                              <option key={`commodity-${commodity.id}-${index}`} value={commodity.id}>
                                {commodity.name}
                                {!formData.category && ` (${commodity.categoryName})`}
                                {hasExisting ? ` - ${existingCount} variation${existingCount !== 1 ? 's' : ''}` : ''}
                              </option>
                            )
                          })}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.category 
                            ? `Showing ${filteredCommodities.length} commodities in ${categories.find(c => c.id === formData.category)?.name}`
                            : `Showing all ${filteredCommodities.length} commodities`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Current Variations Summary */}
                  {formData.variations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Current Variations ({formData.variations.length})</h4>
                      <div className="space-y-2">
                        {formData.variations.map((variation, index) => (
                          <div key={`variation-${variation.variety}-${variation.isOrganic}-${index}`} className="flex items-center justify-between bg-white rounded-md p-3 border">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                {variation.variety} ({variation.isOrganic ? 'Organic' : 'Conventional'})
                              </span>
                              <span className="text-xs text-gray-500">
                                {variation.shippingPoints?.length || variation.growingRegions?.length || 0} shipping point(s)
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
                  {formData.commodity && (formData.variations.length === 0 || showAddVariationForm) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        {formData.variations.length === 0 ? 'Add First Variation' : 
                         isEditMode ? `Add New Variation to ${formData.commodity.replace('-', ' ')}` : 
                         'Add Another Variation'}
                      </h4>
                      
                      {/* Basic Variation Details */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
                        {/* Subtype dropdown (if commodity has subtypes) */}
                        {commodityHasSubtypes && (
                          <div>
                            <label htmlFor="subtype" className="block text-sm font-medium text-gray-700">
                              Type *
                            </label>
                            <select
                              id="subtype"
                              required
                              value={currentVariation.subtype || ''}
                              onChange={(e) => setCurrentVariation(prev => ({ 
                                ...prev, 
                                subtype: e.target.value,
                                variety: '' // Reset variety when subtype changes
                              }))}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Select type</option>
                              {subtypes.map((subtype, index) => (
                                <option key={`subtype-${subtype.id}-${formData.commodity}-${index}`} value={subtype.id}>{subtype.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Variety dropdown (optional) */}
                        {varieties.length > 0 && (
                          <div>
                            <label htmlFor="variety" className="block text-sm font-medium text-gray-700">
                              Variety {!commodityHasSubtypes ? '*' : '(optional)'}
                            </label>
                            <select
                              id="variety"
                              required={!commodityHasSubtypes}
                              value={currentVariation.variety || ''}
                              onChange={(e) => setCurrentVariation(prev => ({ ...prev, variety: e.target.value }))}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Select variety</option>
                              {varieties.map((variety, index) => (
                                <option key={`${variety}-${index}-${currentVariation.subtype || 'direct'}`} value={variety}>{variety}</option>
                              ))}
                            </select>
                          </div>
                        )}

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
                          Shipping Points *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableRegions.filter(region => region.id || region.name).map((region, index) => {
                            const regionId = region.id || region.name
                            const isSelected = currentVariation.shippingPoints.some(r => r.regionId === regionId.toString())
                            const regionConfig = currentVariation.shippingPoints.find(r => r.regionId === regionId.toString())
                            
                            return (
                              <div key={`region-${regionId}`} className="relative">
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
                                      
                                      {!regionConfig.availability.isYearRound && (
                                        <div className="grid grid-cols-6 gap-1">
                                          {months.map(month => (
                                            <button
                                              key={`month-${month.value}-${regionConfig.regionId}`}
                                              type="button"
                                              onClick={() => {
                                                const currentStart = regionConfig.availability.startMonth
                                                const currentEnd = regionConfig.availability.endMonth
                                                
                                                if (currentStart === 0) {
                                                  // First month selected - set as start
                                                  updateRegionSeasonality(regionConfig.regionId, 'startMonth', month.value)
                                                } else if (currentEnd === 0) {
                                                  // Second month selected - set as end (allow cross-year ranges)
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', month.value)
                                                } else if (currentStart === month.value) {
                                                  // Clicking start month again, reset both
                                                  updateRegionSeasonality(regionConfig.regionId, 'startMonth', 0)
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', 0)
                                                } else if (currentEnd === month.value) {
                                                  // Clicking end month again, reset to just start
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', 0)
                                                } else {
                                                  // Clicking a different month - set as new end
                                                  updateRegionSeasonality(regionConfig.regionId, 'endMonth', month.value)
                                                }
                                              }}
                                              className={`px-2 py-1 text-xs rounded border transition-colors ${
                                                regionConfig.availability.startMonth === month.value || regionConfig.availability.endMonth === month.value
                                                  ? 'bg-blue-500 border-blue-500 text-white font-semibold' // Start/End months
                                                  : isMonthInRange(month.value, regionConfig.availability.startMonth, regionConfig.availability.endMonth)
                                                  ? 'bg-blue-100 border-blue-300 text-blue-800' // Months in range
                                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' // Unselected months
                                              }`}
                                            >
                                              {month.label.slice(0, 3)}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {regionConfig.availability.isYearRound && (
                                        <div className="text-xs text-blue-600 font-medium">
                                          ✓ Year-round growing
                                        </div>
                                      )}
                                      
                                      {!regionConfig.availability.isYearRound && regionConfig.availability.startMonth > 0 && regionConfig.availability.endMonth > 0 && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          <div className="flex items-center justify-between">
                                            <span>
                                              {months[regionConfig.availability.startMonth - 1].label} - {months[regionConfig.availability.endMonth - 1].label}
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                              {getMonthsInRange(regionConfig.availability.startMonth, regionConfig.availability.endMonth).length} months
                                            </span>
                                          </div>
                                          {regionConfig.availability.startMonth > regionConfig.availability.endMonth && (
                                            <div className="text-xs text-orange-600 mt-1">
                                              ⚠️ Cross-year season (winter crop)
                                            </div>
                                          )}
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
                              {getAvailableCertifications().map((cert, index) => (
                                <label key={`cert-${cert}-${index}`} className="flex items-center">
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
                  {formData.commodity && formData.variations.length > 0 && !showAddVariationForm && (
                          <div className="text-center py-6">
                            <button
                              type="button"
                              onClick={() => {
                                // Reset current variation form and show it
                                setCurrentVariation({
                                  subtype: '',
                                  variety: '',
                                  isOrganic: false,
                                  shippingPoints: [],
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
