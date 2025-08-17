import Link from 'next/link'
import { 
  CheckCircleIcon, 
  MapPinIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

// Mock setup data - in real app this would come from API
const mockSetupData = {
  currentStep: 2, // 0-indexed - now all steps complete
  steps: [
    {
      id: 'regions',
      name: 'Growing Regions',
      description: 'Define where you grow your crops and your delivery zones',
      status: 'complete',
      href: '/dashboard/price-sheets/setup/regions',
      icon: MapPinIcon,
      completedAt: '2024-03-10',
      regionsCount: 3
    },
    {
      id: 'crops',
      name: 'Crop Management',
      description: 'Set up your crop catalog, varieties, and growing seasons',
      status: 'complete',
      href: '/dashboard/price-sheets/setup/crops',
      icon: SparklesIcon,
      completedAt: '2024-03-15',
      cropsCount: 8
    },
    {
      id: 'capabilities',
      name: 'Capabilities & Certifications',
      description: 'Configure your processing capabilities, certifications, and quality metrics',
      status: 'complete',
      href: '/dashboard/price-sheets/setup/capabilities',
      icon: ShieldCheckIcon,
      completedAt: '2024-03-18',
      capabilitiesCount: 4
    }
  ]
}

export default function Setup() {
  const progressPercentage = ((mockSetupData.currentStep + 1) / mockSetupData.steps.length) * 100

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Setup Your Data', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Your Data</h1>
          <p className="mt-2 text-gray-600">Complete these steps to start generating professional price sheets.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Setup Progress</h3>
          <span className="text-sm text-gray-500">
            {mockSetupData.currentStep + 1} of {mockSetupData.steps.length} steps completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600">
          {progressPercentage === 100 
            ? "🎉 All setup complete! You're ready to create price sheets."
            : `Complete the remaining steps to unlock price sheet generation.`
          }
        </p>
      </div>

      {/* Setup Steps */}
      <div className="space-y-6">
        {mockSetupData.steps.map((step, index) => {
          const Icon = step.icon
          const isCurrent = step.status === 'in_progress'
          const isCompleted = step.status === 'complete'
          const isPending = step.status === 'pending'
          
          return (
            <div 
              key={step.id}
              className={`bg-white shadow rounded-lg border-2 transition-all duration-200 ${
                isCurrent ? 'border-purple-200 ring-2 ring-purple-100' :
                isCompleted ? 'border-green-200' :
                'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-lg ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-medium ${
                        isCompleted ? 'text-green-900' :
                        isCurrent ? 'text-purple-900' :
                        'text-gray-900'
                      }`}>
                        {step.name}
                      </h3>
                      
                      {isCompleted && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Current Step
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    
                    {/* Status Info */}
                    {isCompleted && step.completedAt && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Completed {new Date(step.completedAt).toLocaleDateString()}</span>
                        {step.regionsCount && <span>{step.regionsCount} regions added</span>}
                        {step.cropsCount && <span>{step.cropsCount} crops configured</span>}
                        {step.capabilitiesCount && <span>{step.capabilitiesCount} capabilities set</span>}
                      </div>
                    )}
                    
                    {isCurrent && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Ready to configure</span>
                        {step.cropsCount && step.cropsCount > 0 && <span>{step.cropsCount} crops already added</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <Link
                        href={step.href}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    ) : isCurrent ? (
                      <Link
                        href={step.href}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Get Started
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-400 bg-gray-100 cursor-not-allowed">
                        Complete Previous Steps First
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Next Steps */}
      {progressPercentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <div className="text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Setup Complete! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              You&apos;re all set to create professional price sheets with accurate pricing and capabilities.
            </p>
            <Link
              href="/dashboard/price-sheets/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Create Your First Price Sheet
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
