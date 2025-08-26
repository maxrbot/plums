"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { chatbotConfigApi, chatbotApi, usersApi, regionsApi, cropsApi, certificationsApi, packagingApi } from '@/lib/api'
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

// Real farm data state
interface FarmData {
  farmName: string
  contactEmail: string
  contactPhone: string
  website: string
  regions: { name: string; acreage: string }[]
  crops: { commodity: string; varieties: string[]; organic: boolean }[]
  certifications: string[]
  packaging: string[]
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
    familyCompanyStory: ""
  },
  marketingInfo: {
    marketAvailability: "",
    retailDistribution: "",
    frequentlyAskedQuestions: ""
  }
}

const mockChatConfig = {
  botName: "Farm Assistant",
  personality: "friendly" as 'friendly' | 'professional',
  primaryGoal: "product_info" as 'product_info' | 'lead_generation',
  responseStrategy: "hybrid" as 'hybrid',
  welcomeMessage: "Hi! How can I help you learn about our farm and products?",
  fallbackMessage: "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
  outOfSeasonMessage: "That product is currently out of season. It will be available again in [season].",
  integrationStyle: "chat_bubble" as 'chat_bubble' | 'coming_soon',
  widgetColor: "#10b981"
}

export default function ChatbotSetup() {
  const [currentPhase, setCurrentPhase] = useState<'knowledge' | 'extended' | 'config' | 'deploy'>('knowledge')
  const [farmData, setFarmData] = useState<FarmData>({
    farmName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    regions: [],
    crops: [],
    certifications: [],
    packaging: []
  })
  const [extendedKnowledge, setExtendedKnowledge] = useState(mockExtendedKnowledge)
  const [chatConfig, setChatConfig] = useState(mockChatConfig)
  const [enabledSections, setEnabledSections] = useState({
    businessOperations: {
      farmersMarkets: false,
      farmTours: false,
      csaPrograms: false,
      pickYourOwn: false
    },
    productInfo: {
      seasonalAvailability: false,
      productSamples: false,
      specialtyItems: false,
      storageHandling: false
    },
    businessTerms: {
      paymentTerms: false,
      minimumOrders: false,
      deliveryOptions: false,
      pricingPolicy: false
    },
    farmStory: {
      history: false,
      farmingPractices: false,
      sustainability: false,
      familyCompanyStory: false
    },
    marketingInfo: {
      marketAvailability: false,
      retailDistribution: false,
      frequentlyAskedQuestions: false
    }
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Calculate completion percentages based on real data
  const farmDataCompletion = (() => {
    const totalFields = 8 // farmName, email, phone, website, regions, crops, certifications, packaging
    let filledFields = 0
    
    if (farmData.farmName) filledFields++
    if (farmData.contactEmail) filledFields++
    if (farmData.contactPhone) filledFields++
    if (farmData.website) filledFields++
    if (farmData.regions.length > 0) filledFields++
    if (farmData.crops.length > 0) filledFields++
    if (farmData.certifications.length > 0) filledFields++
    if (farmData.packaging.length > 0) filledFields++
    
    return Math.round((filledFields / totalFields) * 100)
  })()
  const extendedKnowledgeCompletion = Object.values(extendedKnowledge).reduce((acc, section) => {
    const filledFields = Object.values(section).filter(value => value.trim() !== '').length
    const totalFields = Object.values(section).length
    return acc + (filledFields / totalFields)
  }, 0) / 5 * 100

  const chatConfigCompletion = (() => {
    const requiredFields = [chatConfig.botName, chatConfig.welcomeMessage, chatConfig.fallbackMessage, chatConfig.outOfSeasonMessage]
    const filledFields = requiredFields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / requiredFields.length) * 100)
  })()

  const knowledgePhaseCompletion = Math.round((farmDataCompletion * 0.7) + (extendedKnowledgeCompletion * 0.3))

  const phases = [
    {
      id: 'knowledge',
      name: 'Farm Knowledge',
      description: 'Auto-populated farm data from your setup',
      icon: SparklesIcon,
      completion: farmDataCompletion,
      status: farmDataCompletion >= 80 ? 'complete' : farmDataCompletion > 0 ? 'in-progress' : 'pending'
    },
    {
      id: 'extended',
      name: 'Extended Knowledge',
      description: 'Additional business information',
      icon: InformationCircleIcon,
      completion: Math.round(extendedKnowledgeCompletion),
      status: extendedKnowledgeCompletion >= 80 ? 'complete' : extendedKnowledgeCompletion > 0 ? 'in-progress' : 'pending'
    },
    {
      id: 'config',
      name: 'Chat Configuration',
      description: 'Bot personality and integration settings',
      icon: Cog6ToothIcon,
      completion: chatConfigCompletion,
      status: chatConfigCompletion >= 80 ? 'complete' : chatConfigCompletion > 0 ? 'in-progress' : 'pending'
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

  const handleSectionToggle = (section: string, field: string, enabled: boolean) => {
    setEnabledSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleChatConfigChange = (field: string, value: string) => {
    setChatConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadFarmData = async () => {
    try {
      // Load all farm data in parallel
      const [userProfile, regions, crops, certifications, packaging] = await Promise.all([
        usersApi.getProfile(),
        regionsApi.getAll(),
        cropsApi.getAll(),
        certificationsApi.getAll(),
        packagingApi.getAll()
      ])

      // Process crops to extract commodity and varieties
      const processedCrops = crops.crops?.map((crop: any) => ({
        commodity: crop.commodity,
        varieties: crop.variations?.map((v: any) => v.variety) || [],
        organic: crop.variations?.some((v: any) => v.isOrganic) || false
      })) || []

      // Process regions to include acreage
      const processedRegions = regions.regions?.map((region: any) => ({
        name: region.name,
        acreage: region.acreage ? `${region.acreage} acres` : 'Not specified'
      })) || []

      setFarmData({
        farmName: (userProfile as any)?.profile?.companyName || '',
        contactEmail: (userProfile as any)?.email || '',
        contactPhone: (userProfile as any)?.profile?.phone || '',
        website: (userProfile as any)?.profile?.website || '',
        regions: processedRegions,
        crops: processedCrops,
        certifications: certifications.certifications?.map((cert: any) => cert.name) || [],
        packaging: packaging.packaging?.map((pkg: any) => pkg.name) || []
      })
    } catch (error) {
      console.error('Failed to load farm data:', error)
    }
  }

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      
      // Load farm data and chatbot config in parallel
      await Promise.all([
        loadFarmData(),
        loadChatbotConfig()
      ])
    } catch (error) {
      console.error('Failed to load configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatbotConfig = async () => {
    try {
      const config = await chatbotConfigApi.get()
      
      // Update chat config
      setChatConfig({
        botName: config.botName || 'Farm Assistant',
        personality: config.personality || 'friendly',
        primaryGoal: config.primaryGoal || 'product_info',
        responseStrategy: config.responseStrategy || 'hybrid',
        welcomeMessage: config.welcomeMessage || 'Hi! How can I help you learn about our farm and products?',
        fallbackMessage: config.fallbackMessage || "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
        outOfSeasonMessage: config.outOfSeasonMessage || 'That product is currently out of season. It will be available again soon.',
        integrationStyle: config.integrationStyle || 'chat_bubble',
        widgetColor: config.widgetColor || '#10b981'
      })

      // Update extended knowledge
      if (config.extendedKnowledge) {
        setExtendedKnowledge(config.extendedKnowledge)
      }

      // Update enabled sections
      if (config.enabledSections) {
        setEnabledSections(config.enabledSections)
      }

      setHasChanges(false)
    } catch (error) {
      console.error('Failed to load chatbot config:', error)
    }
  }

  const saveConfiguration = async () => {
    try {
      setSaving(true)
      
      const configToSave = {
        ...chatConfig,
        extendedKnowledge,
        enabledSections,
        isActive: true // Set as active when saved
      }

      await chatbotConfigApi.update(configToSave)
      setHasChanges(false)
      
      // Show success message (you could add a toast notification here)
      console.log('Configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      // Show error message (you could add a toast notification here)
    } finally {
      setSaving(false)
    }
  }

  const syncChatbotKnowledge = async () => {
    try {
      setSyncing(true)
      await chatbotApi.rebuildCache()
      setLastSyncTime(new Date())
      console.log('Chatbot knowledge synced successfully!')
    } catch (error) {
      console.error('Failed to sync chatbot knowledge:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
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
            <button 
              onClick={saveConfiguration}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

             {/* Progress Overview */}
       <div className="bg-white shadow rounded-lg mb-8">
         <div className="px-6 py-4 border-b border-gray-200">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-medium text-gray-900">Setup Progress</h3>
             <button
               onClick={syncChatbotKnowledge}
               disabled={syncing}
               className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {syncing ? 'Syncing...' : 'Sync All Data'}
             </button>
           </div>
           {lastSyncTime && (
             <p className="text-xs text-gray-500 mt-2">
               Last synced: {lastSyncTime.toLocaleString()}
             </p>
           )}
         </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {phases.map((phase) => {
              const Icon = phase.icon
              return (
                <div
                  key={phase.id}
                                     onClick={() => setCurrentPhase(phase.id as 'knowledge' | 'extended' | 'config' | 'deploy')}
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
                      <span className="font-medium">{farmData.farmName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Email:</span>
                      <span className="font-medium">{farmData.contactEmail || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{farmData.contactPhone || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Website:</span>
                      <span className="font-medium">{farmData.website || 'Not set'}</span>
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
                    {farmData.regions.length > 0 ? (
                      farmData.regions.map((region, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">{region.name}</span>
                          <span className="text-gray-500">{region.acreage}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No regions configured</div>
                    )}
                  </div>
                </div>

                {/* Crops & Varieties */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <SparklesIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">Crops & Varieties</h4>
                  </div>
                  <div className="space-y-2">
                    {farmData.crops.length > 0 ? (
                      farmData.crops.map((crop, index) => (
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
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No crops configured</div>
                    )}
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
                        {farmData.certifications.length > 0 ? (
                          farmData.certifications.map((cert, index) => (
                            <span key={index} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {cert}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No certifications</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Packaging Options</p>
                      <div className="text-sm text-gray-700 mt-1">
                        {farmData.packaging.length > 0 ? farmData.packaging.join(', ') : 'No custom packaging'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                             <div className="mt-6 pt-6 border-t border-gray-200">
                                 <Link
                  href="/dashboard/price-sheets"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Update farm data in Price Sheet Setup →
                </Link>
               </div>
             </div>
           </div>
      )}

      {currentPhase === 'extended' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Extended Knowledge</h3>
              <span className="text-sm text-gray-500">{Math.round(extendedKnowledgeCompletion)}% Complete</span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Choose what additional information you want your chatbot to know about. Toggle on the sections you want to include and fill in the details.
            </p>

            <div className="space-y-8">
              {/* Business Operations */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Operations</h4>
                <div className="space-y-6">
                  {/* Farmers Markets */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Farmers Markets
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('businessOperations', 'farmersMarkets', !enabledSections.businessOperations.farmersMarkets)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.businessOperations.farmersMarkets ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.businessOperations.farmersMarkets ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.businessOperations.farmersMarkets && (
                      <textarea
                        value={extendedKnowledge.businessOperations.farmersMarkets}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'farmersMarkets', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Which farmers markets do you attend? Days, times, locations..."
                      />
                    )}
                  </div>

                  {/* Farm Tours */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Farm Tours
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('businessOperations', 'farmTours', !enabledSections.businessOperations.farmTours)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.businessOperations.farmTours ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.businessOperations.farmTours ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.businessOperations.farmTours && (
                      <textarea
                        value={extendedKnowledge.businessOperations.farmTours}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'farmTours', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Do you offer farm tours? Scheduling, group sizes, what's included..."
                      />
                    )}
                  </div>

                  {/* CSA Programs */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        CSA Programs
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('businessOperations', 'csaPrograms', !enabledSections.businessOperations.csaPrograms)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.businessOperations.csaPrograms ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.businessOperations.csaPrograms ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.businessOperations.csaPrograms && (
                      <textarea
                        value={extendedKnowledge.businessOperations.csaPrograms}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'csaPrograms', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Community Supported Agriculture details, seasons, pickup locations..."
                      />
                    )}
                  </div>

                  {/* Pick-Your-Own */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Pick-Your-Own
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('businessOperations', 'pickYourOwn', !enabledSections.businessOperations.pickYourOwn)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.businessOperations.pickYourOwn ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.businessOperations.pickYourOwn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.businessOperations.pickYourOwn && (
                      <textarea
                        value={extendedKnowledge.businessOperations.pickYourOwn}
                        onChange={(e) => handleExtendedKnowledgeChange('businessOperations', 'pickYourOwn', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="U-pick operations, seasons, hours, pricing..."
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Farm Story */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Farm Story</h4>
                <div className="space-y-6">
                  {/* Farm History */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Farm History
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('farmStory', 'history', !enabledSections.farmStory.history)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.farmStory.history ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.farmStory.history ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.farmStory.history && (
                      <textarea
                        value={extendedKnowledge.farmStory.history}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'history', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="When was the farm established? Key milestones, generations..."
                      />
                    )}
                  </div>

                  {/* Family Story */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Family/Company Story
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('farmStory', 'familyCompanyStory', !enabledSections.farmStory.familyCompanyStory)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.farmStory.familyCompanyStory ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.farmStory.familyCompanyStory ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.farmStory.familyCompanyStory && (
                      <textarea
                        value={extendedKnowledge.farmStory.familyCompanyStory}
                        onChange={(e) => handleExtendedKnowledgeChange('farmStory', 'familyCompanyStory', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Family involvement, personal story, passion for farming..."
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Marketing Info */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Marketing & Customer Info</h4>
                <div className="space-y-6">
                  {/* Market Availability */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Market Availability
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('marketingInfo', 'marketAvailability', !enabledSections.marketingInfo?.marketAvailability)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.marketingInfo?.marketAvailability ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.marketingInfo?.marketAvailability ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.marketingInfo?.marketAvailability && (
                      <textarea
                        value={extendedKnowledge.marketingInfo?.marketAvailability || ''}
                        onChange={(e) => handleExtendedKnowledgeChange('marketingInfo', 'marketAvailability', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Seasonal availability, peak seasons, storage instructions, product identification tips..."
                      />
                    )}
                  </div>

                  {/* Retail Distribution */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Retail Distribution
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('marketingInfo', 'retailDistribution', !enabledSections.marketingInfo?.retailDistribution)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.marketingInfo?.retailDistribution ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.marketingInfo?.retailDistribution ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.marketingInfo?.retailDistribution && (
                      <textarea
                        value={extendedKnowledge.marketingInfo?.retailDistribution || ''}
                        onChange={(e) => handleExtendedKnowledgeChange('marketingInfo', 'retailDistribution', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Where customers can buy your products: store names, locations, online availability..."
                      />
                    )}
                  </div>

                  {/* Frequently Asked Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Frequently Asked Questions
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSectionToggle('marketingInfo', 'frequentlyAskedQuestions', !enabledSections.marketingInfo?.frequentlyAskedQuestions)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          enabledSections.marketingInfo?.frequentlyAskedQuestions ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            enabledSections.marketingInfo?.frequentlyAskedQuestions ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {enabledSections.marketingInfo?.frequentlyAskedQuestions && (
                      <textarea
                        value={extendedKnowledge.marketingInfo?.frequentlyAskedQuestions || ''}
                        onChange={(e) => handleExtendedKnowledgeChange('marketingInfo', 'frequentlyAskedQuestions', e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="Common customer questions and answers about your products, quality, storage, availability, etc..."
                      />
                    )}
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Chat Configuration</h3>
              <span className="text-sm text-gray-500">{chatConfigCompletion}% Complete</span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Configure how your chatbot will interact with visitors to your website.
            </p>

            <div className="space-y-8">
              {/* Bot Identity */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Bot Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Name
                    </label>
                    <input
                      type="text"
                      value={chatConfig.botName}
                      onChange={(e) => handleChatConfigChange('botName', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., Farm Assistant, Sarah from Sunny Acres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personality
                    </label>
                    <select
                      value={chatConfig.personality}
                      onChange={(e) => handleChatConfigChange('personality', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="friendly">Friendly & Casual</option>
                      <option value="professional">Professional & Sales-Oriented</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {chatConfig.personality === 'friendly' 
                        ? 'Warm, approachable, uses casual language'
                        : 'Business-focused, professional tone, sales-driven'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Bot Strategy */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Bot Strategy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Goal
                    </label>
                    <select
                      value={chatConfig.primaryGoal}
                      onChange={(e) => handleChatConfigChange('primaryGoal', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="product_info">Product Information</option>
                      <option value="lead_generation">Lead Generation</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {chatConfig.primaryGoal === 'product_info' 
                        ? 'Focus on answering questions about your crops and farm'
                        : 'Prioritize collecting visitor contact information'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Strategy
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value="Hybrid Approach"
                        disabled
                        className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm sm:text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Provide information first, then offer to connect with sales team
                    </p>
                  </div>
                </div>
              </div>

              {/* Bot Messages */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Bot Messages</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      value={chatConfig.welcomeMessage}
                      onChange={(e) => handleChatConfigChange('welcomeMessage', e.target.value)}
                      rows={2}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="First message visitors see when they open the chat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fallback Message
                    </label>
                    <textarea
                      value={chatConfig.fallbackMessage}
                      onChange={(e) => handleChatConfigChange('fallbackMessage', e.target.value)}
                      rows={2}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="When the bot doesn't know the answer to a question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Out of Season Message
                    </label>
                    <textarea
                      value={chatConfig.outOfSeasonMessage}
                      onChange={(e) => handleChatConfigChange('outOfSeasonMessage', e.target.value)}
                      rows={2}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="When visitors ask about products that aren't currently available"
                    />
                  </div>
                </div>
              </div>

              {/* Integration Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Integration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Widget Style
                    </label>
                    <select
                      value={chatConfig.integrationStyle}
                      onChange={(e) => handleChatConfigChange('integrationStyle', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="chat_bubble">Chat Bubble (Bottom Right)</option>
                      <option value="coming_soon" disabled>Embedded Widget (Coming Soon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Widget Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={chatConfig.widgetColor}
                        onChange={(e) => handleChatConfigChange('widgetColor', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={chatConfig.widgetColor}
                        onChange={(e) => handleChatConfigChange('widgetColor', e.target.value)}
                        className="block flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                const phases = ['knowledge', 'extended', 'config', 'deploy']
                const currentIndex = phases.indexOf(currentPhase)
                if (currentIndex > 0) {
                  setCurrentPhase(phases[currentIndex - 1] as 'knowledge' | 'extended' | 'config' | 'deploy')
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
                const phases = ['knowledge', 'extended', 'config', 'deploy']
                const currentIndex = phases.indexOf(currentPhase)
                if (currentIndex < phases.length - 1) {
                  setCurrentPhase(phases[currentIndex + 1] as 'knowledge' | 'extended' | 'config' | 'deploy')
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
