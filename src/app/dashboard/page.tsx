"use client"

import Link from 'next/link'
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useUserName } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import { regionsApi, cropsApi, chatbotConfigApi } from '@/lib/api'

export default function Dashboard() {
  const userName = useUserName()
  
  // Real setup progress based on actual user data
  const [setupProgress, setSetupProgress] = useState({
    farmSetup: false,
    priceSheets: false, 
    chatbot: false
  })
  const [loading, setLoading] = useState(true)

  // Load actual setup progress from APIs
  useEffect(() => {
    const loadSetupProgress = async () => {
      try {
        setLoading(true)
        
        // Check if user has any growing regions and crops
        const [regionsResponse, cropsResponse] = await Promise.all([
          regionsApi.getAll(),
          cropsApi.getAll()
        ])
        
        const hasRegions = regionsResponse.regions && regionsResponse.regions.length > 0
        const hasCrops = cropsResponse.crops && cropsResponse.crops.length > 0
        const farmSetupComplete = hasRegions && hasCrops
        
        // Check if user has chatbot configured
        let chatbotConfigured = false
        try {
          const chatbotConfig = await chatbotConfigApi.get()
          chatbotConfigured = chatbotConfig && chatbotConfig.isActive
        } catch (error) {
          // No chatbot config exists yet
          chatbotConfigured = false
        }
        
        setSetupProgress({
          farmSetup: farmSetupComplete,
          priceSheets: farmSetupComplete, // Price sheets are available once farm is set up
          chatbot: chatbotConfigured
        })
        
      } catch (error) {
        console.error('Failed to load setup progress:', error)
        // Keep default false values on error
      } finally {
        setLoading(false)
      }
    }

    loadSetupProgress()
  }, [])

  const completedSteps = Object.values(setupProgress).filter(Boolean).length
  const totalSteps = Object.keys(setupProgress).length
  const progressPercentage = loading ? 0 : Math.round((completedSteps / totalSteps) * 100)

  return (
    <>
      {/* Welcome & Progress Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        <p className="mt-2 text-gray-600">Here&apos;s what&apos;s next to get your farm online.</p>
      </div>

      {/* Progress Hero Section */}
      <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Setup Progress - {loading ? 'Loading...' : `${progressPercentage}% Complete`}
            </h2>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Step 1: Farm Setup */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.farmSetup ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.farmSetup ? 'bg-green-500' : 'bg-gray-300'}`}>
                {setupProgress.farmSetup ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Setup Farm</h3>
                <p className="text-sm text-gray-600">Crops, regions, certifications</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.farmSetup ? (
              <div className="text-sm text-green-700 font-medium">✅ Ready to use</div>
            ) : (
              <Link href="/dashboard/price-sheets" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Get Started →
              </Link>
            )}
          </div>

          {/* Step 2: Price Sheets */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.priceSheets ? 'border-green-300 bg-green-50' : setupProgress.farmSetup ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.priceSheets ? 'bg-green-500' : setupProgress.farmSetup ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.priceSheets ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">2</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Price Sheets</h3>
                <p className="text-sm text-gray-600">Professional pricing</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.priceSheets ? (
              <div className="text-sm text-green-700 font-medium">✅ Ready to create</div>
            ) : setupProgress.farmSetup ? (
              <Link href="/dashboard/price-sheets/new" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Create First Sheet →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Setup farm data first</div>
            )}
          </div>

          {/* Step 3: AI Chatbot */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.chatbot ? 'border-green-300 bg-green-50' : setupProgress.priceSheets ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.chatbot ? 'bg-green-500' : setupProgress.priceSheets ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.chatbot ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">3</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">AI Chatbot</h3>
                <p className="text-sm text-gray-600">24/7 sales assistant</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.chatbot ? (
              <div className="text-sm text-green-700 font-medium">✅ Active</div>
            ) : setupProgress.priceSheets ? (
              <Link href="/dashboard/chatbot/setup" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Setup Chatbot →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Setup tools above first</div>
            )}
          </div>
        </div>

        {/* Next Action */}
        {!setupProgress.chatbot && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Configure your AI chatbot</h3>
                <p className="text-sm text-gray-600 mt-1">Turn your farm data into a 24/7 sales assistant</p>
              </div>
              <Link 
                href="/dashboard/chatbot/setup"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Continue Setup
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Your Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Price Sheets Tool */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Smart Price Sheets</h3>
                  <p className="text-sm text-gray-600">Professional pricing that wins contracts</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Create branded price sheets with USDA market data, your farm story, and professional formatting.
            </p>
            <div className="space-y-2">
              <Link
                href="/dashboard/price-sheets/new"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Sheet
              </Link>
              <Link
                href="/dashboard/price-sheets"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Manage Sheets
              </Link>
            </div>
          </div>
        </div>

        {/* AI Assistant Tool */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI Sales Assistant</h3>
                  <p className="text-sm text-gray-600">24/7 customer support</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              AI chatbot that knows your crops, pricing, and availability. Handles inquiries while you focus on farming.
            </p>
            <div className="space-y-2">
              <Link
                href="/dashboard/chatbot/setup"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configure Bot
              </Link>
              <Link
                href="/dashboard/chatbot"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Test & Preview
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Common tasks</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/price-sheets/crops" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PlusIcon className="h-4 w-4 text-gray-600" />
                <span>Add crop variety</span>
              </Link>
              <Link href="/dashboard/price-sheets/insights" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                <span>Update pricing</span>
              </Link>
              <Link href="/dashboard/price-sheets/send" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PaperAirplaneIcon className="h-4 w-4 text-gray-600" />
                <span>Send price sheet</span>
              </Link>
              <Link href="/dashboard/price-sheets/contacts" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PhoneIcon className="h-4 w-4 text-gray-600" />
                <span>View contacts</span>
              </Link>
              <Link href="/dashboard/chatbot/setup" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                <span>Sync chatbot data</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LightBulbIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">💡 This Week&apos;s Tip</h3>
            <p className="text-gray-700 mb-4">
              Organic produce is trending 15% above conventional prices this season. Consider highlighting your organic varieties and certifications in your price sheets to capture premium pricing.
            </p>
            <div className="flex space-x-3">
              <Link
                href="/dashboard/price-sheets/insights"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                View Market Data
              </Link>
              <Link
                href="/dashboard/price-sheets/new"
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Update My Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}