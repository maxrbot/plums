"use client"

import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { ShippingPoint } from '../../types'
import { createPlacesAutocomplete, PlaceResult } from '../../lib/googlePlaces'

interface AddShippingPointModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (shippingPoint: Omit<ShippingPoint, 'id'>) => void
  editingRegion?: ShippingPoint | null
}

export default function AddShippingPointModal({ isOpen, onClose, onSave, editingRegion }: AddShippingPointModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    facilityType: 'warehouse' as 'cooler' | 'warehouse' | 'packing_house' | 'distribution_center' | 'farm_direct',
    capacity: '',
    notes: '',
    status: 'active' as const,
    shipping: {
      zones: [] as string[],
      methods: ['Truck'] as string[],
      leadTime: 2
    }
  })
  
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const autocompleteElementRef = useRef<any>(null)

  // Populate form when editing
  useEffect(() => {
    if (editingRegion && isOpen) {
      setFormData({
        name: editingRegion.name || '',
        location: editingRegion.location?.formattedAddress || `${editingRegion.city}, ${editingRegion.state}`,
        facilityType: editingRegion.facilityType || 'warehouse',
        capacity: editingRegion.capacity || '',
        notes: editingRegion.notes || '',
        status: editingRegion.status || 'active',
        shipping: editingRegion.shipping || {
          zones: [],
          methods: ['Truck'],
          leadTime: 2
        }
      })
      setShowNotesInput(!!editingRegion.notes)
      if (editingRegion.location) {
        setSelectedPlace({
          placeId: editingRegion.location.placeId || '',
          formattedAddress: editingRegion.location.formattedAddress || '',
          city: editingRegion.location.city || editingRegion.city || '',
          state: editingRegion.location.state || editingRegion.state || '',
          country: editingRegion.location.country || 'US',
          coordinates: editingRegion.location.coordinates
        })
      }
      setHasChanges(false)
    }
  }, [editingRegion, isOpen])

  // Track changes to form data
  useEffect(() => {
    if (editingRegion && isOpen) {
      setHasChanges(true)
    }
  }, [formData])

  // Initialize Google Places autocomplete
  useEffect(() => {
    if (!isOpen) return

    const initAutocomplete = async () => {
      let attempts = 0
      const maxAttempts = 10
      
      while (!locationInputRef.current && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!locationInputRef.current) {
        console.error('Input ref not available for Google Places autocomplete')
        return
      }
      
      try {
        const element = await createPlacesAutocomplete(
          locationInputRef.current!,
          (place: PlaceResult) => {
            setSelectedPlace(place)
            // Auto-generate facility name based on location and facility type
            const facilityTypeLabel = formData.facilityType === 'cooler' ? 'Cooler' 
              : formData.facilityType === 'warehouse' ? 'Warehouse' 
              : formData.facilityType === 'packing_house' ? 'Packing House' 
              : formData.facilityType === 'distribution_center' ? 'Distribution Center' 
              : 'Facility'
            const autoName = place.city ? `${place.city} ${facilityTypeLabel}` : place.name
            
            setFormData(prev => ({
              ...prev,
              location: place.formattedAddress,
              name: autoName // Always set the auto-generated name
            }))
          }
        )
        // Store reference to the autocomplete element
        autocompleteElementRef.current = element
      } catch (error) {
        console.error('Failed to initialize Google Places:', error)
      }
    }

    setTimeout(initAutocomplete, 50)
  }, [isOpen])

  // Facility type options
  const facilityTypeOptions = [
    { value: 'warehouse', label: 'Warehouse', icon: '🏢' },
    { value: 'cooler', label: 'Cooler Facility', icon: '❄️' },
    { value: 'packing_house', label: 'Packing House', icon: '📦' },
    { value: 'distribution_center', label: 'Distribution Center', icon: '🚛' },
    { value: 'farm_direct', label: 'Farm Direct', icon: '🌾' }
  ]

  // Storage capacity options
  const capacityOptions = [
    { value: '< 50 trucks/day', description: '< 50 trucks/day', icon: '🚛' },
    { value: '50 - 200 trucks/day', description: '50 - 200 trucks/day', icon: '🚛' },
    { value: '200+ trucks/day', description: '200+ trucks/day', icon: '🚛' }
  ]

  // Shipping zone options
  const shippingZoneOptions = [
    'West Coast',
    'Southwest',
    'Mountain West',
    'Midwest',
    'Southeast',
    'Northeast',
    'Pacific Northwest',
    'Texas',
    'California',
    'International'
  ]

  // Shipping method options
  const shippingMethodOptions = [
    'Truck',
    'Rail',
    'Air',
    'Ocean',
    'Intermodal'
  ]


  const toggleShippingZone = (zone: string) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        zones: prev.shipping.zones.includes(zone)
          ? prev.shipping.zones.filter(z => z !== zone)
          : [...prev.shipping.zones, zone]
      }
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Try to get the place from the autocomplete element if selectedPlace is null
    if (!selectedPlace && autocompleteElementRef.current?.getSelectedPlace) {
      console.log('🔍 Attempting to get place from autocomplete element')
      await autocompleteElementRef.current.getSelectedPlace()
    }
    
    console.log('🔍 Debug - selectedPlace:', selectedPlace)
    console.log('🔍 Debug - formData.location:', formData.location)
    
    const shippingPointData = {
      name: formData.name,
      city: selectedPlace?.city || '',
      state: selectedPlace?.state || '',
      facilityType: formData.facilityType,
      capacity: formData.capacity,
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      shipping: formData.shipping,
      location: selectedPlace ? {
        placeId: selectedPlace.placeId,
        formattedAddress: selectedPlace.formattedAddress,
        city: selectedPlace.city,
        state: selectedPlace.state,
        country: selectedPlace.country,
        coordinates: selectedPlace.coordinates
      } : {
        city: '',
        state: '',
        country: 'US',
        formattedAddress: formData.location
      }
    }
    
    console.log('🔧 Modal submitting data:', shippingPointData)
    onSave(shippingPointData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      location: '',
      facilityType: 'warehouse',
      capacity: '',
      notes: '',
      status: 'active' as const,
      shipping: {
        zones: [],
        methods: ['Truck'],
        leadTime: 2
      }
    })
    setShowNotesInput(false)
    setSelectedPlace(null)
    setHasChanges(false)
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {editingRegion ? 'Edit Shipping Point' : 'Add Shipping Point'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {editingRegion 
                          ? 'Update the details of your shipping point.'
                          : 'Add a new facility, warehouse, or distribution center where you ship products from.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Facility Type and Location */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Facility Type *
                      </label>
                      <select
                        required
                        value={formData.facilityType}
                        onChange={(e) => setFormData(prev => ({ ...prev, facilityType: e.target.value as any }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {facilityTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Lead Time (Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={formData.shipping.leadTime}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          shipping: { ...prev.shipping, leadTime: parseInt(e.target.value) || 2 }
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  {/* Location and Facility Name */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          ref={locationInputRef}
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Start typing an address..."
                        />
                        <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Facility Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Fresno Distribution Center"
                      />
                    </div>
                  </div>

                  {/* Storage Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Storage Capacity
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {capacityOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, capacity: option.value }))}
                          className={`p-4 text-center border-2 rounded-lg transition-all ${
                            formData.capacity === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="text-sm font-medium">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Zones (Optional) */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Primary Shipping Zones (Optional)
                      </label>
                      <span className="text-xs text-gray-500">Select up to 3</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {shippingZoneOptions.slice(0, 6).map(zone => (
                        <label key={zone} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={formData.shipping.zones.includes(zone)}
                            onChange={() => toggleShippingZone(zone)}
                            disabled={!formData.shipping.zones.includes(zone) && formData.shipping.zones.length >= 3}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-gray-700">{zone}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowNotesInput(!showNotesInput)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {showNotesInput ? 'Hide Notes' : '+ Add Notes'}
                    </button>
                    {showNotesInput && (
                      <div className="mt-2">
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Additional notes about this shipping point..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editingRegion && !hasChanges}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {editingRegion ? 'Save Changes' : 'Add Shipping Point'}
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
