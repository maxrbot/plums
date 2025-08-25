"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function AcceleratedSetup() {
  const [companyUrl, setCompanyUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    companyName: string
    farmingMethods: string[]
    regions: string[]
    commodities: string[]
    brands?: {
      name: string
      category: string
      varieties: string[]
    }[]
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
    
    // Mock analysis - simulate API call with comprehensive data extraction
    setTimeout(() => {
      let mockResults
      
      if (companyUrl.includes('producehunt.com')) {
        // Comprehensive Produce Hunt analysis based on actual website data
        mockResults = {
          companyName: 'Produce Hunt',
          farmingMethods: ['Regenerative Agriculture', 'Responsible Farming', 'Vertically Integrated Production'],
          regions: ['California', 'Oregon'],
          commodities: [
            // Citrus varieties from CitrusRanch brand
            'Citrus - Blood Oranges (CitrusRanch)',
            'Citrus - Cara Cara Oranges (CitrusRanch)', 
            'Citrus - Navel Oranges (CitrusRanch)',
            'Citrus - Valencia Oranges (CitrusRanch)',
            'Citrus - Summer Navels (CitrusRanch)',
            'Citrus - Gold Nugget Mandarins (CitrusRanch)',
            'Citrus - Sumo Citrus Mandarins (CitrusRanch)',
            'Citrus - Minneolas (CitrusRanch)',
            'Citrus - Lemons (CitrusRanch)',
            'Citrus - Limes (CitrusRanch)',
            'Citrus - Oro Blancos (CitrusRanch)',
            'Citrus - Pummelos (CitrusRanch)',
            'Citrus - Melo Golds (CitrusRanch)',
            // Blueberries from BlueFresh brand
            'Blueberries - Organic (BlueFresh)'
          ],
          brands: [
            {
              name: 'CitrusRanch',
              category: 'Citrus',
              varieties: [
                'Blood Oranges (Jan-Mar)',
                'Cara Cara Oranges (Dec-Apr)', 
                'Navel Oranges (Oct-Apr)',
                'Valencia Oranges (Apr-Oct)',
                'Summer Navels (Apr-Jun)',
                'Gold Nugget Mandarins (Mar-May)',
                'Sumo Citrus Mandarins (Jan-Apr)',
                'Minneolas (Jan-Mar)',
                'Lemons (Year-round)',
                'Limes (Sep-Oct)',
                'Oro Blancos (Dec-Feb)',
                'Pummelos (Dec-Feb)',
                'Melo Golds (Nov-Jan)'
              ]
            },
            {
              name: 'BlueFresh',
              category: 'Berries',
              varieties: [
                'Organic Blueberries (Apr-Sep)',
                'Packed in clamshell pints',
                'Grown in CA and OR'
              ]
            }
          ],
          contact: 'info@producehunt.com',
          confidence: {
            companyName: 'high',
            farmingMethods: 'high',
            regions: 'high',
            commodities: 'high',
            contact: 'high'
          }
        }
      } else {
        // Generic analysis for other websites
        mockResults = {
          companyName: 'Your Company',
          farmingMethods: ['Organic Farming'],
          regions: ['Detected Region'],
          commodities: [],
          brands: [],
          contact: 'contact@yourcompany.com',
          confidence: {
            companyName: 'medium',
            farmingMethods: 'medium',
            regions: 'low',
            commodities: 'none',
            contact: 'medium'
          }
        }
      }
      
      setAnalysisResults(mockResults)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/dashboard/settings"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center">
            <RocketLaunchIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accelerated Setup</h1>
            <p className="mt-2 text-gray-600">Import your company data automatically and jumpstart your profile in minutes.</p>
          </div>
        </div>
      </div>

      {/* Main Setup Card */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-8">
        <div className="max-w-2xl">
          <div className="text-center mb-8">
            <SparklesIcon className="h-16 w-16 text-lime-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Data Import</h2>
            <p className="text-gray-600">
              Our advanced AI will analyze your website and automatically extract your company information, 
              farming methods, regions, and more to populate your MarketHunt profile.
            </p>
          </div>

          <div className="space-y-6">
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
                                            placeholder="https://producehunt.com"
                    className="block w-full pl-10 pr-3 py-3 border-2 border-lime-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors text-lg"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your farm&apos;s website URL to begin the automated analysis
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleAnalyzeWebsite}
                disabled={!companyUrl || isAnalyzing}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Website...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    Launch AI Analysis
                  </>
                )}
              </button>
            </div>
            
            {/* Analysis Results */}
            {analysisResults && (
              <div className="mt-8 p-6 bg-gradient-to-r from-lime-50 to-cyan-50 rounded-lg border border-lime-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                  Analysis Complete - {companyUrl}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Company Name</span>
                        <p className="text-sm text-gray-600">{analysisResults.companyName}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Farming Methods</span>
                        <p className="text-sm text-gray-600">{analysisResults.farmingMethods.join(', ')}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Growing Regions</span>
                        <p className="text-sm text-gray-600">
                          {analysisResults.regions.length > 0 ? analysisResults.regions.join(', ') + ' (detected)' : 'None detected - you can add these manually'}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Add</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      {analysisResults.commodities.length > 0 ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-900">Commodities</span>
                        <p className="text-sm text-gray-600">
                          {analysisResults.commodities.length > 0 ? 
                            `${analysisResults.commodities.length} commodities detected` : 
                            'None detected - you can add your crops manually'
                          }
                        </p>
                        {analysisResults.commodities.length > 0 && (
                          <div className="mt-2 max-h-20 overflow-y-auto">
                            <div className="text-xs text-gray-500 space-y-1">
                              {analysisResults.commodities.slice(0, 5).map((commodity, idx) => (
                                <div key={idx}>• {commodity}</div>
                              ))}
                              {analysisResults.commodities.length > 5 && (
                                <div className="text-blue-600">+ {analysisResults.commodities.length - 5} more...</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {analysisResults.commodities.length > 0 ? 'Review' : 'Add'}
                    </button>
                  </div>

                  {/* Brands Section */}
                  {analysisResults.brands && analysisResults.brands.length > 0 && (
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Brands Detected</span>
                            <p className="text-sm text-gray-600">{analysisResults.brands.length} brand{analysisResults.brands.length > 1 ? 's' : ''} found</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Review</button>
                      </div>
                      <div className="space-y-3">
                        {analysisResults.brands.map((brand, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-lime-50 to-cyan-50 p-3 rounded-lg border border-lime-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900">{brand.name}</h4>
                              <span className="text-xs bg-lime-100 text-lime-800 px-2 py-1 rounded-full">{brand.category}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              {brand.varieties.slice(0, 3).map((variety, vIdx) => (
                                <div key={vIdx}>• {variety}</div>
                              ))}
                              {brand.varieties.length > 3 && (
                                <div className="text-blue-600">+ {brand.varieties.length - 3} more varieties...</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Contact Information</span>
                        <p className="text-sm text-gray-600">{analysisResults.contact}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <button 
                    onClick={() => setAnalysisResults(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Start Over
                  </button>
                  <div className="flex space-x-3">
                    <Link
                      href="/dashboard/price-sheets/regions"
                      className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Manual Setup Instead
                    </Link>
                    <button className="px-6 py-2 bg-gradient-to-r from-lime-600 to-cyan-600 text-white text-sm font-medium rounded-md hover:from-lime-700 hover:to-cyan-700 shadow-lg">
                      Import All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Feature Benefits */}
            {!analysisResults && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-3">
                    <SparklesIcon className="h-6 w-6 text-lime-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-xs text-gray-600">Advanced algorithms extract your data automatically</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                    <RocketLaunchIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-xs text-gray-600">Complete setup in minutes, not hours</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Accurate</h3>
                  <p className="text-xs text-gray-600">Review and edit all imported data before saving</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
