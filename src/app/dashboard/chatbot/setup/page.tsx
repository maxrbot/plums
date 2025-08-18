"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  MapPinIcon,
  TagIcon,
  InformationCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

// Mock data - this would come from existing setup data
const mockFarmData = {
  // From Settings
  farmName: "AgriFarm Co.",
  contactEmail: "sales@agrifarm.com",
  contactPhone: "(555) 123-4567",
  website: "https://agrifarm.com",
  
  // From Setup - Growing Regions
  regions: [
    { name: "Central Valley - Fresno", acreage: "150 acres" },
    { name: "Salinas Valley - Salinas", acreage: "75 acres" }
  ],
  
  // From Setup - Crops
  crops: [
    { commodity: "Strawberries", varieties: ["Albion", "San Andreas"], organic: true },
    { commodity: "Lettuce", varieties: ["Romaine", "Butter"], organic: false },
    { commodity: "Tomatoes", varieties: ["Roma", "Cherry"], organic: true }
  ],
  
  // From Setup - Capabilities
  certifications: ["USDA Organic", "Good Agricultural Practices (GAP)"],
  packaging: ["1 lb Clamshells", "5 lb Cartons", "25 lb Cases"]
}

const mockExtendedKnowledge = {
  businessOperations: {
    farmersMarkets: "",
    farmTours: "",
    csaPrograms: "",
    pickYourOwn: ""
  },
  productInfo: {
    seasonalAvailability: "",
    productSamples: "",
    specialtyItems: "",
    storageHandling: ""
  },
  businessTerms: {
    paymentTerms: "",
    minimumOrders: "",
    deliveryOptions: "",
    pricingPolicy: ""
  },
  farmStory: {
    history: "",
    farmingPractices: "",
    sustainability: "",
    familyStory: ""
  }
}

const mockChatConfig = {
  botName: "FarmBot",
  personality: "friendly" as 'professional' | 'friendly' | 'educational',
  integrationStyle: "popup" as 'embed' | 'popup' | 'dedicated',
  responseStrategy: "hybrid" as 'pricing' | 'connect' | 'info' | 'hybrid',
  customGreeting: "",
  businessHours: {
    enabled: false,
    timezone: "America/Los_Angeles",
    hours: "9:00 AM - 5:00 PM"
  }
}

export default function ChatbotSetup() {
  const [currentPhase, setCurrentPhase] = useState<'knowledge' | 'config' | 'deploy'>('knowledge')
  const [extendedKnowledge, setExtendedKnowledge] = useState(mockExtendedKnowledge)

  const [hasChanges, setHasChanges] = useState(false)

  // Calculate completion percentages
  const farmDataCompletion = 85 // Most data from existing setup
  const extendedKnowledgeCompletion = Object.values(extendedKnowledge).reduce((acc, section) => {
    const filledFields = Object.values(section).filter(value => value.trim() !== '').length
    const totalFields = Object.values(section).length
    return acc + (filledFields / totalFields)
  }, 0) / 4 * 100

  const knowledgePhaseCompletion = Math.round((farmDataCompletion * 0.7) + (extendedKnowledgeCompletion * 0.3))

  const phases = [
    {
      id: 'knowledge',
      name: 'Farm Knowledge',
      description: 'Your farm information and extended knowledge',
      icon: SparklesIcon,
      completion: knowledgePhaseCompletion,
      status: knowledgePhaseCompletion >= 80 ? 'complete' : knowledgePhaseCompletion > 0 ? 'in-progress' : 'pending'
    },
    {
      id: 'config',
      name: 'Chat Configuration',
      description: 'Bot personality and integration settings',
      icon: Cog6ToothIcon,
      completion: 0,
      status: 'pending'
    },
    {
      id: 'deploy',
      name: 'Deploy & Test',
      description: 'Test your bot and go live',
      icon: RocketLaunchIcon,
      completion: 0,
      status: 'pending'
    }
  ]

  const handleExtendedKnowledgeChange = (section: string, field: string, value: string) => {
    setExtendedKnowledge(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'AI Chatbot', href: '/dashboard/chatbot' },
            { label: 'Setup Knowledge Base', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Knowledge Base Setup</h1>
            <p className="mt-2 text-gray-600">Configure your AI chatbot with farm knowledge and chat settings.</p>
          </div>
          
          {hasChanges && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Setup Progress</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {phases.map((phase) => {
              const Icon = phase.icon
              return (
                <div
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id as 'knowledge' | 'config' | 'deploy')}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                    currentPhase === phase.id
                      ? 'border-blue-600 bg-blue-50'
                      : phase.status === 'complete'
                      ? 'border-green-300 bg-green-50 hover:border-green-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                          phase.status === 'complete' ? 'bg-green-100' :
                          phase.status === 'in-progress' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            phase.status === 'complete' ? 'text-green-600' :
                            phase.status === 'in-progress' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{phase.name}</h4>
                          <p className="text-xs text-gray-500">{phase.description}</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            phase.status === 'complete' ? 'bg-green-500' :
                            phase.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${phase.completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{phase.completion}% complete</p>
                    </div>
                    
                    {phase.status === 'complete' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                    {phase.status === 'in-progress' && (
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Phase Content */}
      {currentPhase === 'knowledge' && (
        <div className="space-y-8">
          {/* Auto-populated Farm Data */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Farm Knowledge (Auto-populated)</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{farmDataCompletion}% Complete</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Great news!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Most of your farm knowledge is already configured from your price sheet setup. 
                      Your chatbot will automatically know about your farm, crops, and capabilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Farm & Contact Info */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">Farm & Contact Info</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Farm Name:</span>
                      <span className="font-medium">{mockFarmData.farmName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Email:</span>
                      <span className="font-medium">{mockFarmData.contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{mockFarmData.contactPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Website:</span>
                      <span className="font-medium">{mockFarmData.website}</span>
                    </div>
                  </div>
                </div>

                {/* Growing Regions */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPinIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">Growing Regions</h4>
                  </div>
                  <div className="space-y-2">
                    {mockFarmData.regions.map((region, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{region.name}</span>
                        <span className="text-gray-500">{region.acreage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crops & Varieties */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <SparklesIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">Crops & Varieties</h4>
                  </div>
                  <div className="space-y-2">
                    {mockFarmData.crops.map((crop, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{crop.commodity}</span>
                          {crop.organic && (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Organic
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 ml-0">{crop.varieties.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications & Packaging */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <TagIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">Certifications & Packaging</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mockFarmData.certifications.map((cert, index) => (
                          <span key={index} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Packaging Options</p>
                      <div className="text-sm text-gray-700 mt-1">
                        {mockFarmData.packaging.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard/price-sheets/setup"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Update farm data in Price Sheet Setup →
                </Link>
              </div>
            </div>
          </div>

          {/* Extended Knowledge */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Extended Knowledge</h3>
                <span className="text-sm text-gray-500">{Math.round(extendedKnowledgeCompletion)}% Complete</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Add additional information to help your chatbot provide more comprehensive answers about your farm operations.
              </p>

              <div className="space-y-8">
                {/* Business Operations */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Business Operations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farmers Markets
                      </label>
                      <textarea
                        value={extendedKnowledge.businessOperations.farmersMarkets}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'farmersMarkets', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Which farmers markets do you attend? Days, times, locations..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm Tours
                      </label>
                      <textarea
                        value={extendedKnowledge.businessOperations.farmTours}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'farmTours', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Do you offer farm tours? Scheduling, group sizes, what's included..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CSA Programs
                      </label>
                      <textarea
                        value={extendedKnowledge.businessOperations.csaPrograms}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'csaPrograms', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Community Supported Agriculture details, seasons, pickup locations..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pick-Your-Own
                      </label>
                      <textarea
                        value={extendedKnowledge.businessOperations.pickYourOwn}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'pickYourOwn', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="U-pick operations, seasons, hours, pricing..."
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Product Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seasonal Availability
                      </label>
                      <textarea
                        value={extendedKnowledge.productInfo.seasonalAvailability}
                        onChange={(e) => handleExtendedKnowledgeChange('productInfo', 'seasonalAvailability', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="When are different crops available? Peak seasons, harvest schedules..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Samples
                      </label>
                      <textarea
                        value={extendedKnowledge.productInfo.productSamples}
                        onChange={(e) => handleExtendedKnowledgeChange('productInfo', 'productSamples', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Do you offer samples? How to request, minimum quantities..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialty Items
                      </label>
                      <textarea
                        value={extendedKnowledge.productInfo.specialtyItems}
                        onChange={(e) => handleExtendedKnowledgeChange('productInfo', 'specialtyItems', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Unique varieties, heirloom crops, specialty processing..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Storage & Handling
                      </label>
                      <textarea
                        value={extendedKnowledge.productInfo.storageHandling}
                        onChange={(e) => handleExtendedKnowledgeChange('productInfo', 'storageHandling', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Storage recommendations, shelf life, handling instructions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Business Terms */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Business Terms</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms
                      </label>
                      <textarea
                        value={extendedKnowledge.businessTerms.paymentTerms}
                        onChange={(e) => handleExtendedKnowledgeChange('businessTerms', 'paymentTerms', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Payment methods accepted, terms (Net 30, etc.), credit requirements..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Orders
                      </label>
                      <textarea
                        value={extendedKnowledge.businessTerms.minimumOrders}
                        onChange={(e) => handleExtendedKnowledgeChange('businessTerms', 'minimumOrders', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Minimum order quantities, dollar amounts, exceptions..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Options
                      </label>
                      <textarea
                        value={extendedKnowledge.businessTerms.deliveryOptions}
                        onChange={(e) => handleExtendedKnowledgeChange('businessTerms', 'deliveryOptions', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Delivery areas, schedules, fees, pickup options..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pricing Policy
                      </label>
                      <textarea
                        value={extendedKnowledge.businessTerms.pricingPolicy}
                        onChange={(e) => handleExtendedKnowledgeChange('businessTerms', 'pricingPolicy', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="How pricing works, volume discounts, price guarantees..."
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Story */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Farm Story</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm History
                      </label>
                      <textarea
                        value={extendedKnowledge.farmStory.history}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'history', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="When was the farm established? Key milestones, generations..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farming Practices
                      </label>
                      <textarea
                        value={extendedKnowledge.farmStory.farmingPractices}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'farmingPractices', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Farming methods, philosophy, what makes you different..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sustainability
                      </label>
                      <textarea
                        value={extendedKnowledge.farmStory.sustainability}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'sustainability', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Environmental practices, conservation efforts, certifications..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Family Story
                      </label>
                      <textarea
                        value={extendedKnowledge.farmStory.familyStory}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'familyStory', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Family involvement, personal story, passion for farming..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPhase === 'config' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Chat Configuration</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chat configuration coming soon</p>
              <p className="text-sm text-gray-400">Configure bot personality, integration style, and response strategy</p>
            </div>
          </div>
        </div>
      )}

      {currentPhase === 'deploy' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Deploy & Test</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <RocketLaunchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Deploy and testing coming soon</p>
              <p className="text-sm text-gray-400">Test your chatbot and deploy to your website</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <div>
          {currentPhase !== 'knowledge' && (
            <button
              onClick={() => {
                const phases = ['knowledge', 'config', 'deploy']
                const currentIndex = phases.indexOf(currentPhase)
                if (currentIndex > 0) {
                  setCurrentPhase(phases[currentIndex - 1] as 'knowledge' | 'config' | 'deploy')
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Previous
            </button>
          )}
        </div>
        
        <div>
          {currentPhase !== 'deploy' && (
            <button
              onClick={() => {
                const phases = ['knowledge', 'config', 'deploy']
                const currentIndex = phases.indexOf(currentPhase)
                if (currentIndex < phases.length - 1) {
                  setCurrentPhase(phases[currentIndex + 1] as 'knowledge' | 'config' | 'deploy')
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  )
}
