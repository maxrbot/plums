"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  PlusIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useUserName } from '@/contexts/UserContext'

export default function Dashboard() {
  const userName = useUserName()
  const [companyUrl, setCompanyUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    companyName: string
    farmingMethods: string[]
    regions: string[]
    commodities: string[]
    contact: string
    confidence: {
      companyName: string
      farmingMethods: string
      regions: string
      commodities: string
      contact: string
    }
  } | null>(null)

  const handleAnalyzeWebsite = async () => {
    if (!companyUrl) return
    
    setIsAnalyzing(true)
    
    // Mock analysis - simulate API call
    setTimeout(() => {
      // Mock results based on AC Foods example
      const mockResults = {
        companyName: companyUrl.includes('ac-foods') ? 'AC Foods' : 'Your Company',
        farmingMethods: companyUrl.includes('ac-foods') ? ['Regenerative Agriculture', 'Sustainable Farming'] : ['Organic Farming'],
        regions: companyUrl.includes('ac-foods') ? ['California'] : ['Detected Region'],
        commodities: [], // Usually empty for most sites
        contact: companyUrl.includes('ac-foods') ? 'info@ac-foods.com' : 'contact@yourcompany.com',
        confidence: {
          companyName: 'high',
          farmingMethods: 'high',
          regions: 'medium',
          commodities: 'none',
          contact: 'high'
        }
      }
      
      setAnalysisResults(mockResults)
      setIsAnalyzing(false)
    }, 2000)
  }
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="mt-2 text-gray-600">Here&apos;s what&apos;s happening with your agricultural business today.</p>
      </div>

      {/* Website Scraper Onboarding Card */}
      <div className="mb-8">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Setup</h2>
              <p className="mt-1 text-sm text-gray-600">
                Import your company information automatically from your website to jumpstart your profile.
              </p>
            </div>
            <SparklesIcon className="h-6 w-6 text-lime-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="company-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="company-url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://your-farm.com"
                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-lime-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleAnalyzeWebsite}
                  disabled={!companyUrl || isAnalyzing}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Analyze & Import
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Analysis Results */}
            {analysisResults && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Analysis Results from {companyUrl}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">Company: {analysisResults.companyName}</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Farming Methods: {analysisResults.farmingMethods.join(', ')}
                      </span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Regions: {analysisResults.regions.length > 0 ? analysisResults.regions.join(', ') + ' (detected)' : 'None detected'}
                      </span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Commodities: {analysisResults.commodities.length > 0 ? analysisResults.commodities.join(', ') : 'None detected'}
                      </span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Add</button>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button 
                    onClick={() => setAnalysisResults(null)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Start Over
                  </button>
                  <button className="px-4 py-1.5 bg-lime-600 text-white text-sm rounded-md hover:bg-lime-700">
                    Import All Data
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-1.5"></span>
                  Company Info
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-1.5"></span>
                  Growing Regions
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-1.5"></span>
                  Commodities
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-1.5"></span>
                  Farming Methods
                </span>
              </div>
              
              <button className="text-xs text-gray-500 hover:text-gray-700 underline">
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Price Sheets</dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">1,247</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">89</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">AI Conversations</dt>
                  <dd className="text-lg font-medium text-gray-900">47</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Price Sheet Generator */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Price Sheet Generator</h3>
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-4">
              Create, send, and track engagement with your price sheets. AI-powered insights help optimize your pricing strategy.
            </p>
            <div className="flex space-x-3">
              <Link
                href="/dashboard/price-sheets/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New
              </Link>
              <Link
                href="/dashboard/price-sheets"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* AI Chatbot */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Chatbot</h3>
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4">
              AI handles customer inquiries using all your supplier data. Deploy on your website for instant, intelligent customer support.
            </p>
            <div className="flex space-x-3">
              <Link
                href="/dashboard/chatbot"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Setup Chatbot
              </Link>
              <Link
                href="/dashboard/chatbot/conversations"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New price sheet created</p>
                <p className="text-sm text-gray-500">Organic Strawberries - Spring 2024</p>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">AI conversation completed</p>
                <p className="text-sm text-gray-500">Website visitor asked about organic strawberry pricing</p>
              </div>
              <div className="text-sm text-gray-500">4 hours ago</div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ChartBarIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Price sheet viewed</p>
                <p className="text-sm text-gray-500">Spring Vegetables price sheet opened by 3 new contacts</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
