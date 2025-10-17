'use client'

import { useState } from 'react'
import { ChevronRightIcon, PlayIcon, CheckCircleIcon, ChartBarIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import WaitlistModal from '@/components/modals/WaitlistModal'

export default function IFPAPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)

  const openWaitlistModal = () => {
    setIsWaitlistModalOpen(true)
  }

  const demoSections = [
    {
      id: 'generate',
      title: 'From iceberg lettuce to dragon fruit - build professional price sheets in minutes, not hours. Powered by real-time market data.',
      subtitle: '',
      description: 'Create comprehensive price sheets with 300+ varieties, custom specifications, and professional templates.',
      stats: '15 hours → 15 minutes per week',
      mockupImage: '/api/placeholder/800/500', // We'll create this
      highlights: [
        '300+ varieties with custom spec flexibility',
        'Real-time USDA market pricing guidance',
        'Price Sheet template library to elevate your brand',
        'Seamless integration to your existing software systems'
      ]
    },
    {
      id: 'send',
      title: 'Reach every buyer with tailored pricing and messaging that converts 3x better than generic sheets.',
      subtitle: '',
      description: 'Send personalized price sheets with buyer-specific pricing, custom messages, and automated follow-ups.',
      stats: '3x higher response rates',
      mockupImage: '/api/placeholder/800/500',
      highlights: [
        'Buyer-specific pricing tiers',
        'Personalized emails or texts written by AI, but sounding like you',
        'Automated follow-up sequences'
      ]
    },
    {
      id: 'insights',
      title: 'Never guess at pricing again with comprehensive USDA and retail insights, plus AI-powered recommendations.',
      subtitle: '',
      description: 'Make confident pricing decisions with real-time market data, commodity trends, and seasonal availability insights.',
      stats: '25% margin improvement',
      mockupImage: '/api/placeholder/800/500',
      highlights: [
        'USDA market data integration',
        'Commodity price trends',
        'Seasonal availability insights'
      ]
    },
    {
      id: 'analytics',
      title: 'Track every interaction and optimize your pricing strategy with detailed performance insights.',
      subtitle: '',
      description: 'Know who\'s buying, what\'s selling, and optimize your margins with comprehensive buyer engagement analytics.',
      stats: '',
      mockupImage: '/api/placeholder/800/500',
      highlights: [
        'Open & response rate tracking',
        'Buyer engagement analytics',
        'Product performance insights'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  src="/acrelist-logo.png" 
                  alt="AcreList" 
                  width={160} 
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Conference Demo</p>
              <p className="text-xs text-gray-400">Mobile Optimized</p>
            </div>
          </div>
        </div>
      </div>


      {/* Tab Navigation - 4x1 Grid */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 mb-6 mt-8 sm:mt-12">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {demoSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveDemo(index)}
              className={`${
                activeDemo === index
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              } p-2 sm:p-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-center text-center">
                <div className="leading-tight">
                  {section.id === 'generate' && (
                    <span>Create<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Sheet</span>
                  )}
                  {section.id === 'send' && (
                    <span>Dynamic<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Outreach</span>
                  )}
                  {section.id === 'insights' && (
                    <span>Market<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Insights</span>
                  )}
                  {section.id === 'analytics' && (
                    <span>Sheet<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Analytics</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Demo Content */}
          <div className="p-3 sm:p-4 lg:p-6">
            {demoSections.map((section, index) => (
              <div
                key={section.id}
                className={`${activeDemo === index ? 'block' : 'hidden'}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
                  {/* Content */}
                  <div>
                    <div className="mb-4">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6">
                        {section.title}
                      </h2>
                      
                      {/* Stats Badge */}
                      {section.stats && (
                        <div className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-xs sm:text-sm mb-4 sm:mb-6">
                          <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {section.stats}
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    <div>
                      <ul className="space-y-2">
                        {section.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="text-gray-700 text-sm sm:text-base">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Interactive SaaS Tool */}
                  <div className="relative">
                    <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
                      {/* Tool Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {section.id === 'generate' && 'Generate New Price Sheet'}
                            {section.id === 'send' && 'Send Price Sheet'}
                            {section.id === 'insights' && 'AI Pricing Recommendations'}
                            {section.id === 'analytics' && 'Price Sheet Analytics'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      </div>
                      
                      {/* Tool Content */}
                      <div className={`bg-white p-1 sm:p-2 ${section.id === 'generate' ? 'min-h-[36rem]' : 'min-h-96'}`}>
                        {section.id === 'generate' && (
                          <div className="h-full">
                            {/* Enhanced Selected Products Panel - Clean Demo Focus */}
                            <div className="h-full flex flex-col">
                              <div className="border-2 border-blue-200 rounded-lg overflow-hidden flex-1 bg-white shadow-sm">
                                {/* Header with gradient */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-white">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm sm:text-base flex items-center">
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                      Selected Products
                                    </h4>
                                    <div className="bg-white/20 px-2 py-1 rounded-full">
                                      <span className="text-xs sm:text-sm font-medium">3 items</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Products List */}
                                <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50">
                                  {/* Romaine Lettuce */}
                                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-green-600 font-semibold text-sm">🥬</span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-sm sm:text-base text-gray-900">Romaine Lettuce</div>
                                          <div className="text-xs text-gray-700 font-medium">Fresh • Premium Grade</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                          </svg>
                                        </div>
                                        <span className="text-green-600 font-medium text-xs">+12%</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Cut</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Whole Head</option>
                                          <option>Chopped</option>
                                          <option>Shredded</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Package</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Carton</option>
                                          <option>Bag</option>
                                          <option>Clamshell</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Size</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>24ct</option>
                                          <option>18ct</option>
                                          <option>30ct</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Price</label>
                                        <input className="w-full border-2 border-green-300 rounded px-2 py-1 text-xs font-bold text-green-700 bg-green-50" value="$61.92" readOnly />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Navel Orange */}
                                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-orange-600 font-semibold text-sm">🍊</span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-sm sm:text-base text-gray-900">Navel Orange</div>
                                          <div className="text-xs text-gray-700 font-medium">California • Extra Large</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                          </svg>
                                        </div>
                                        <span className="text-blue-600 font-medium text-xs">Stable</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Cut</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Whole</option>
                                          <option>Juiced</option>
                                          <option>Sectioned</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Package</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Carton</option>
                                          <option>Mesh Bag</option>
                                          <option>Tray Pack</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Size</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>40lb</option>
                                          <option>25lb</option>
                                          <option>50lb</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Price</label>
                                        <input className="w-full border-2 border-green-300 rounded px-2 py-1 text-xs font-bold text-green-700 bg-green-50" value="$78.00" readOnly />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Organic Carrots */}
                                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-orange-600 font-semibold text-sm">🥕</span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-sm sm:text-base text-gray-900">Organic Carrots</div>
                                          <div className="text-xs text-gray-700 font-medium flex items-center">
                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs mr-2">Organic</span>
                                            Premium Grade
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                          </svg>
                                        </div>
                                        <span className="text-green-600 font-medium text-xs">+8%</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Cut</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Whole</option>
                                          <option>Baby Cut</option>
                                          <option>Diced</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Package</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>Bag</option>
                                          <option>Carton</option>
                                          <option>Bulk Bin</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Size</label>
                                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium">
                                          <option>25lb</option>
                                          <option>50lb</option>
                                          <option>10lb</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <label className="text-xs text-gray-800 font-medium block mb-1">Price</label>
                                        <input className="w-full border-2 border-green-300 rounded px-2 py-1 text-xs font-bold text-green-700 bg-green-50" value="$42.50" readOnly />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              </div>

                              {/* Enhanced Preview Button */}
                              <div className="mt-3 sm:mt-4 flex justify-end">
                                <button 
                                  onClick={() => setShowPreview(true)}
                                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                  </svg>
                                  Preview Price Sheet (3)
                                </button>
                              </div>
                          </div>
                        )}

                        {section.id === 'send' && (
                          <div className="min-h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <h3 className="text-base sm:text-lg font-semibold">Send Price Sheet</h3>
                              <span className="text-xs sm:text-sm text-gray-800 font-medium">Draft saved 2 min ago</span>
                            </div>

                            {/* Buyer Selection */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                              <div className="border rounded-lg p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-sm sm:text-base text-gray-900">Premium Buyers</h4>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">-5% pricing</span>
                                </div>
                                <div className="space-y-2">
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" defaultChecked readOnly />
                                    Restaurant Group A
                                  </label>
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" defaultChecked readOnly />
                                    Grocery Chain B
                                  </label>
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" readOnly />
                                    Hotel Chain C
                                  </label>
                                </div>
                              </div>
                              <div className="border rounded-lg p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-sm sm:text-base text-gray-900">Standard Buyers</h4>
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">List pricing</span>
                                </div>
                                <div className="space-y-2">
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" defaultChecked readOnly />
                                    Local Market D
                                  </label>
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" readOnly />
                                    Distributor E
                                  </label>
                                  <label className="flex items-center text-sm text-gray-800 font-medium">
                                    <input type="checkbox" className="mr-3" readOnly />
                                    Cafe Chain F
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Message Customization */}
                            <div className="border rounded-lg p-3 sm:p-4 mb-4">
                              <h4 className="font-semibold text-sm sm:text-base mb-3 text-gray-900">Personalized Message</h4>
                              <textarea 
                                className="w-full border rounded p-3 text-sm h-20 resize-none text-gray-900 font-medium"
                                placeholder="Hi [Name], fresh harvest available this week..."
                                defaultValue="Hi [Name], fresh harvest available this week. Special pricing on [YourSKUs] including premium romaine and sweet navels. Limited quantities - order by Friday!"
                                readOnly
                              />
                              <div className="flex items-center justify-between mt-3 text-xs text-gray-800 font-medium">
                                <span>Variables: [Name], [Company], [LastOrder], [YourSKUs]</span>
                                <span>Characters: 151/500</span>
                              </div>
                            </div>

                            {/* Send Options */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
                                <label className="flex items-center">
                                  <input type="checkbox" className="mr-2" defaultChecked readOnly />
                                  <span className="text-gray-900 font-medium">Schedule for 8 AM</span>
                                </label>
                                <label className="flex items-center">
                                  <input type="checkbox" className="mr-2" readOnly />
                                  <span className="text-gray-900 font-medium">Follow-up reminder</span>
                                </label>
                              </div>
                              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                                Send to 5 Buyers
                              </button>
                            </div>
                          </div>
                        )}

                        {section.id === 'insights' && (
                          <div className="min-h-full">
                            {/* AI Pricing Recommendations - Single Column */}
                            <div>
                              <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-green-600 font-semibold text-sm">🥬</span>
                                      </div>
                                      <span className="font-semibold text-sm sm:text-base text-gray-900">Romaine (24ct)</span>
                                    </div>
                                    <span className="text-green-700 font-bold text-lg">$61.92</span>
                                  </div>
                                  <div className="text-sm text-green-700 mb-2 font-medium">↗ Increase recommended (+12%)</div>
                                  <div className="text-sm text-gray-800 mb-3 font-medium">Based on USDA data + demand surge. High demand, limited supply.</div>
                                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Apply Price
                                  </button>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-orange-600 font-semibold text-sm">🍊</span>
                                      </div>
                                      <span className="font-semibold text-sm sm:text-base text-gray-900">Navel (40lb)</span>
                                    </div>
                                    <span className="text-blue-700 font-bold text-lg">$78.00</span>
                                  </div>
                                  <div className="text-sm text-blue-700 mb-2 font-medium">→ Maintain current (Stable)</div>
                                  <div className="text-sm text-gray-800 mb-3 font-medium">Optimal pricing for season. Peak availability with steady demand.</div>
                                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Keep Price
                                  </button>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-red-600 font-semibold text-sm">🍅</span>
                                      </div>
                                      <span className="font-semibold text-sm sm:text-base text-gray-900">Tomatoes (25lb)</span>
                                    </div>
                                    <span className="text-yellow-700 font-bold text-lg">$67.50</span>
                                  </div>
                                  <div className="text-sm text-yellow-700 mb-2 font-medium">⚠ Consider decrease (-8%)</div>
                                  <div className="text-sm text-gray-800 mb-3 font-medium">Market oversupply detected. Seasonal peak production.</div>
                                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Review Price
                                  </button>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-orange-600 font-semibold text-sm">🥕</span>
                                      </div>
                                      <span className="font-semibold text-sm sm:text-base text-gray-900">Organic Carrots (25lb)</span>
                                    </div>
                                    <span className="text-purple-700 font-bold text-lg">$42.50</span>
                                  </div>
                                  <div className="text-sm text-purple-700 mb-2 font-medium">↗ Slight increase (+3%)</div>
                                  <div className="text-sm text-gray-800 mb-3 font-medium">Organic premium justified. Strong consumer demand trend.</div>
                                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Apply Price
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === 'analytics' && (
                          <div className="min-h-full">
                            {/* Header */}
                            <div className="mb-4">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Price Sheet Sent 10/14/25</h3>
                              <p className="text-sm text-gray-800 mt-1 font-medium">Weekly Fresh Produce List - 85 contacts</p>
                            </div>

                            {/* Engagement Performance - Single Column */}
                            <div>
                              <h4 className="font-semibold mb-4 text-sm sm:text-base flex items-center text-gray-900">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Engagement Performance
                              </h4>
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <span className="text-sm sm:text-base font-semibold text-green-800">Opened</span>
                                        <div className="text-xs text-green-600">68 of 85 contacts</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-3xl sm:text-4xl font-bold text-green-700">80%</div>
                                      <span className="text-xs text-green-600 font-medium">3 days ago</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-green-200 rounded-full h-3">
                                    <div className="bg-green-600 h-3 rounded-full transition-all duration-500" style={{width: '80%'}}></div>
                                  </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <span className="text-sm sm:text-base font-semibold text-blue-800">Forwarded</span>
                                        <div className="text-xs text-blue-600">shared with others</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-3xl sm:text-4xl font-bold text-blue-700">10</div>
                                      <span className="text-xs text-blue-600 font-medium">price sheets</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-blue-200 rounded-full h-3">
                                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{width: '12%'}}></div>
                                  </div>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <span className="text-sm sm:text-base font-semibold text-purple-800">Responses</span>
                                        <div className="text-xs text-purple-600">buyers who replied</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-3xl sm:text-4xl font-bold text-purple-700">23</div>
                                      <span className="text-xs text-purple-600 font-medium">inquiries</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-purple-200 rounded-full h-3">
                                    <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{width: '27%'}}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-white sm:text-3xl">
                   Ready to Send Some Price Sheets?
                 </h2>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={openWaitlistModal}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-lime-500">AcreList</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 AcreList. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Price Sheet Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Acrelist Price Sheet - October 17, 2025</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Fresh Produce Price List</h4>
                <div className="space-y-3">
                  {/* Romaine Lettuce */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🥬</span>
                      <div>
                                        <div className="font-semibold text-sm text-gray-900">Romaine Lettuce</div>
                        <div className="text-xs text-gray-600">Whole Head • Carton • 24ct</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">$61.92</div>
                      <div className="text-xs text-gray-500">per carton</div>
                    </div>
                  </div>

                  {/* Navel Orange */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🍊</span>
                      <div>
                                        <div className="font-semibold text-sm text-gray-900">Navel Orange</div>
                        <div className="text-xs text-gray-600">Whole • Carton • 40lb</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">$78.00</div>
                      <div className="text-xs text-gray-500">per carton</div>
                    </div>
                  </div>

                  {/* Organic Carrots */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🥕</span>
                      <div>
                                        <div className="font-semibold text-sm text-gray-900">Organic Carrots</div>
                        <div className="text-xs text-gray-600">Whole • Bag • 25lb</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">$42.50</div>
                      <div className="text-xs text-gray-500">per bag</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Contact us for bulk pricing and custom orders</div>
                  <div>Valid through October 24, 2025</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Send Price Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </div>
  )
}
