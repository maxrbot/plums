"use client"

import { useState } from 'react'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

// Theme definitions
const themes = {
  current: {
    name: "Current (Soft Blue & Green)",
    primary: "bg-blue-600 hover:bg-blue-700",
    primaryText: "text-blue-600",
    secondary: "bg-green-600 hover:bg-green-700", 
    secondaryText: "text-green-600",
    accent: "bg-purple-600 hover:bg-purple-700",
    accentText: "text-purple-600",
    sidebar: "bg-white",
    sidebarActive: "bg-green-100 text-blue-700",
    sidebarHover: "hover:bg-gray-100",
    card: "bg-white",
    border: "border-gray-200"
  },

  midnight: {
    name: "Midnight Blue & Electric",
    primary: "bg-slate-900 hover:bg-black",
    primaryText: "text-slate-900",
    secondary: "bg-blue-500 hover:bg-blue-600",
    secondaryText: "text-blue-500",
    accent: "bg-orange-500 hover:bg-orange-600", 
    accentText: "text-orange-500",
    sidebar: "bg-slate-900",
    sidebarActive: "bg-slate-800 text-blue-400",
    sidebarHover: "hover:bg-slate-800",
    card: "bg-white",
    border: "border-slate-200"
  },
  charcoal: {
    name: "Charcoal & Lime",
    primary: "bg-gray-900 hover:bg-black",
    primaryText: "text-gray-900",
    secondary: "bg-lime-500 hover:bg-lime-600",
    secondaryText: "text-lime-600",
    accent: "bg-pink-500 hover:bg-pink-600",
    accentText: "text-pink-500", 
    sidebar: "bg-gray-900",
    sidebarActive: "bg-gray-800 text-lime-400",
    sidebarHover: "hover:bg-gray-800",
    card: "bg-white",
    border: "border-gray-200"
  },

  hybrid1: {
    name: "Midnight Charcoal & Electric Lime",
    primary: "bg-slate-900 hover:bg-black",
    primaryText: "text-slate-900",
    secondary: "bg-lime-500 hover:bg-lime-600",
    secondaryText: "text-lime-600",
    accent: "bg-blue-500 hover:bg-blue-600",
    accentText: "text-blue-500",
    sidebar: "bg-gray-900",
    sidebarActive: "bg-gray-800 text-lime-400",
    sidebarHover: "hover:bg-gray-800",
    card: "bg-white",
    border: "border-gray-200"
  },
  hybrid2: {
    name: "Steel & Neon",
    primary: "bg-gray-900 hover:bg-black",
    primaryText: "text-gray-900",
    secondary: "bg-lime-500 hover:bg-lime-600",
    secondaryText: "text-lime-600",
    accent: "bg-cyan-500 hover:bg-cyan-600",
    accentText: "text-cyan-500",
    sidebar: "bg-slate-800",
    sidebarActive: "bg-slate-700 text-lime-400",
    sidebarHover: "hover:bg-slate-700",
    card: "bg-white",
    border: "border-slate-200"
  },
  hybrid3: {
    name: "Dark Matter & Lightning",
    primary: "bg-slate-900 hover:bg-slate-950",
    primaryText: "text-slate-900",
    secondary: "bg-lime-400 hover:bg-lime-500",
    secondaryText: "text-lime-500",
    accent: "bg-blue-400 hover:bg-blue-500",
    accentText: "text-blue-400",
    sidebar: "bg-black",
    sidebarActive: "bg-gray-900 text-lime-300",
    sidebarHover: "hover:bg-gray-900",
    card: "bg-white",
    border: "border-gray-200"
  }
}

const navigation = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'Price Sheets', icon: DocumentTextIcon },
  { name: 'Contacts', icon: UserGroupIcon },
  { name: 'Analytics', icon: ChartBarIcon },
  { name: 'AI Chatbot', icon: ChatBubbleLeftRightIcon },
]

export default function ThemePreview() {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('current')
  const theme = themes[selectedTheme]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Theme Preview</h1>
            <p className="mt-2 text-gray-600">Choose your bold color scheme</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Theme Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Theme to Preview:</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(themes).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key as keyof typeof themes)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTheme === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {themeData.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Display */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Current Preview: {theme.name}
          </h2>
          <p className="text-gray-600">
            See how this theme would look across different UI elements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Sidebar Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Sidebar & Navigation</h3>
            
            <div className={`w-64 h-96 ${theme.sidebar} shadow-lg rounded-lg overflow-hidden`}>
              {/* Logo */}
              <div className="h-16 flex items-center justify-center border-b border-opacity-20 border-white">
                <span className="text-2xl font-bold text-white">Plums.ag</span>
              </div>
              
              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  const isActive = index === 1 // Price Sheets active
                  
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? theme.sidebarActive
                          : `text-gray-300 ${theme.sidebarHover}`
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  )
                })}
              </nav>
              
              {/* User Section */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-opacity-20 border-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">JS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">John Smith</p>
                    <p className="text-xs text-gray-300 truncate">john@agrifarm.com</p>
                  </div>
                  <Cog6ToothIcon className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* UI Elements Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Buttons & Elements</h3>
            
            {/* Buttons */}
            <div className={`p-6 ${theme.card} rounded-lg shadow ${theme.border} border`}>
              <h4 className="text-md font-medium text-gray-900 mb-4">Button Styles</h4>
              <div className="space-y-4">
                
                {/* Primary Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${theme.primary}`}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Primary Action
                  </button>
                  
                  <button className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${theme.secondary}`}>
                    Generate Price Sheet
                  </button>
                  
                  <button className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${theme.accent}`}>
                    Send & Manage
                  </button>
                </div>

                {/* Secondary Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className={`inline-flex items-center px-4 py-2 border ${theme.border} text-sm font-medium rounded-md ${theme.primaryText} bg-white hover:bg-gray-50`}>
                    Secondary Action
                  </button>
                  
                  <button className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${theme.primary}`}>
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* Cards & Metrics */}
            <div className={`p-6 ${theme.card} rounded-lg shadow ${theme.border} border`}>
              <h4 className="text-md font-medium text-gray-900 mb-4">Cards & Metrics</h4>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className={`text-lg font-bold ${theme.primaryText}`}>15</div>
                  <div className="text-gray-600 text-sm">Products</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className={`text-lg font-bold ${theme.secondaryText}`}>3</div>
                  <div className="text-gray-600 text-sm">Regions</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className={`text-lg font-bold ${theme.accentText}`}>23</div>
                  <div className="text-gray-600 text-sm">Contacts</div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className={`h-5 w-5 ${theme.secondaryText}`} />
                    <span className="text-sm font-medium text-gray-900">Growing Regions</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme.secondaryText}`}>3 configured</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className={`h-5 w-5 ${theme.accentText}`} />
                    <span className="text-sm font-medium text-gray-900">Pending Setup</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme.accentText}`}>2 remaining</span>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className={`p-6 ${theme.card} rounded-lg shadow ${theme.border} border`}>
              <h4 className="text-md font-medium text-gray-900 mb-4">Alerts & Notifications</h4>
              
              <div className="space-y-3">
                <div className={`p-3 bg-green-50 border border-green-200 rounded-md`}>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-green-800">Success</h5>
                      <p className="text-sm text-green-700 mt-1">Price sheet generated successfully!</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 bg-blue-50 border border-blue-200 rounded-md`}>
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className={`h-5 w-5 ${theme.primaryText} mt-0.5`} />
                    <div>
                      <h5 className={`text-sm font-medium ${theme.primaryText}`}>Information</h5>
                      <p className={`text-sm ${theme.primaryText} opacity-80 mt-1`}>Your data is automatically synced.</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-md`}>
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className={`h-5 w-5 ${theme.accentText} mt-0.5`} />
                    <div>
                      <h5 className={`text-sm font-medium ${theme.accentText}`}>Warning</h5>
                      <p className={`text-sm ${theme.accentText} opacity-80 mt-1`}>Please complete your setup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div className={`p-6 ${theme.card} rounded-lg shadow ${theme.border} border`}>
              <h4 className="text-md font-medium text-gray-900 mb-4">Form Elements</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Input
                  </label>
                  <input
                    type="text"
                    className={`block w-full rounded-md border ${theme.border} bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                    placeholder="Enter some text..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Select
                  </label>
                  <select className={`block w-full rounded-md border ${theme.border} bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm`}>
                    <option>Choose an option...</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-800">Ready to Apply?</h5>
              <p className="text-sm text-blue-700 mt-1">
                Once you choose a theme, I can implement it across the entire application. 
                Each theme includes sidebar colors, button styles, accent colors, and hover states.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
