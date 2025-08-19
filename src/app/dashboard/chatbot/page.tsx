import Link from 'next/link'
import { 
  ChatBubbleLeftRightIcon, 
  CodeBracketIcon, 
  GlobeAltIcon, 
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

// Mock chatbot data
const mockChatbot = {
  status: 'active',
  conversations: 47,
  avgResponseTime: '2.3s',
  satisfaction: 94,
  websiteUrl: 'https://agrifarm.com',
  lastDeployed: '2024-03-15'
}

export default function Chatbot() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Chatbot</h1>
            <p className="mt-2 text-gray-600">Deploy intelligent customer support on your website.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              {mockChatbot.status === 'active' ? (
                <>
                  <PauseIcon className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </button>
            <Link
              href="/dashboard/chatbot/setup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Setup Knowledge Base
            </Link>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockChatbot.conversations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Response Time</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockChatbot.avgResponseTime}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Satisfaction</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockChatbot.satisfaction}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CodeBracketIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      mockChatbot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mockChatbot.status.charAt(0).toUpperCase() + mockChatbot.status.slice(1)}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Setup - Primary Focus */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Knowledge Base Setup</h3>
            <Link
              href="/dashboard/chatbot/setup"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Configure →
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg mx-auto w-fit mb-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Farm Knowledge</h4>
              <p className="text-xs text-gray-500 mb-2">Auto-populated from your setup</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-green-600 mt-1 font-medium">85% Complete</p>
            </div>
            
            <div className="text-center">
              <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg mx-auto w-fit mb-3">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Chat Configuration</h4>
              <p className="text-xs text-gray-500 mb-2">Bot personality & integration</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Not started</p>
            </div>
            
            <div className="text-center">
              <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg mx-auto w-fit mb-3">
                <GlobeAltIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Deploy & Test</h4>
              <p className="text-xs text-gray-500 mb-2">Go live on your website</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Not started</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link
              href="/dashboard/chatbot/setup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Setup
            </Link>
          </div>
        </div>
      </div>

      {/* Website Integration & Recent Conversations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Website Integration */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Website Integration</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Website URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={mockChatbot.websiteUrl}
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://yourwebsite.com"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Update
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Integration Code</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                  {`<script src="https://chat.markethunt.com/widget.js" 
  data-account="your-account-id">
</script>`}
                </div>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-500">
                  Copy to clipboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Conversations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">&ldquo;What&apos;s your organic strawberry pricing?&rdquo;</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Resolved
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">&ldquo;Do you deliver to downtown?&rdquo;</p>
                  <p className="text-sm text-gray-500">4 hours ago</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Resolved
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">&ldquo;Minimum order requirements?&rdquo;</p>
                  <p className="text-sm text-gray-500">6 hours ago</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/chatbot/conversations"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all conversations →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
