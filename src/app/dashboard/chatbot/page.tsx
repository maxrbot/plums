"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { chatbotApi, usersApi } from '@/lib/api'

// Domain-specific knowledge gap examples
const getKnowledgeGapsByDomain = (emailDomain: string) => {
  if (emailDomain.includes('sumocitrus.com')) {
    return [
      { question: "When will Sumo Citrus be back in stores?", attempts: 12, status: 'unanswered' },
      { question: "Why is my Sumo Citrus more expensive than regular mandarins?", attempts: 8, status: 'partial' },
      { question: "Can I buy Sumo Citrus directly from you?", attempts: 6, status: 'unanswered' },
      { question: "What makes Sumo Citrus different from other citrus?", attempts: 5, status: 'unanswered' },
      { question: "Do you have Sumo Citrus in organic?", attempts: 4, status: 'partial' }
    ]
  } else if (emailDomain.includes('superfreshgrowers.com')) {
    return [
      { question: "What's your minimum order for mixed apple varieties?", attempts: 9, status: 'unanswered' },
      { question: "Do you offer farm tours during harvest season?", attempts: 7, status: 'partial' },
      { question: "Can you provide organic certification documents?", attempts: 6, status: 'unanswered' },
      { question: "What's the difference between Autumn Glory and Cosmic Crisp?", attempts: 5, status: 'unanswered' },
      { question: "Do you ship internationally?", attempts: 4, status: 'partial' }
    ]
  } else {
    // Generic/default knowledge gaps
    return [
      { question: "What's your minimum order for mixed boxes?", attempts: 8, status: 'unanswered' },
      { question: "Do you offer farm tours during harvest?", attempts: 5, status: 'unanswered' },
      { question: "What's your policy on damaged goods?", attempts: 4, status: 'partial' },
      { question: "Can you provide COA certificates?", attempts: 3, status: 'unanswered' }
    ]
  }
}

// Mock chatbot analytics data
const mockChatbot = {
  status: 'active',
  conversations: 47,
  avgResponseTime: '2.3s',
  satisfaction: 94,
  weeklyConversations: [12, 18, 15, 22, 19, 25, 31]
}

// Mock current chatbot configuration (would come from setup)
const mockChatConfig = {
  botName: "Farm Assistant",
  personality: "friendly",
  primaryGoal: "product_info",
  welcomeMessage: "Hi! How can I help you learn about our farm and products?",
  fallbackMessage: "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
  outOfSeasonMessage: "That product is currently out of season. It will be available again in spring.",
  widgetColor: "#10b981"
}

// Mock farm data for responses
const mockFarmData = {
  farmName: "AgriFarm Co.",
  crops: ["Strawberries", "Lettuce", "Tomatoes"],
  regions: ["Central Valley", "Salinas Valley"],
  certifications: ["USDA Organic", "GAP Certified"]
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: mockChatConfig.welcomeMessage,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [knowledgeGaps, setKnowledgeGaps] = useState(getKnowledgeGapsByDomain(''))

  // Load user profile to get email domain
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await usersApi.getProfile()
        const email = (profile as any)?.email || ''
        setUserEmail(email)
        
        // Extract domain and set appropriate knowledge gaps
        const domain = email.split('@')[1] || ''
        setKnowledgeGaps(getKnowledgeGapsByDomain(domain))
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Use default knowledge gaps if profile loading fails
        setKnowledgeGaps(getKnowledgeGapsByDomain(''))
      }
    }

    loadUserProfile()
  }, [])

  // Real bot response using backend API
  const generateBotResponse = async (userMessage: string) => {
    try {
      // Convert messages to the format expected by the API (excluding the user message we just added)
      const conversationHistory = messages.slice(0, -1).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      
      const response = await chatbotApi.chat(userMessage, conversationHistory)
      return response.message
    } catch (error) {
      console.error('Chat API error:', error)
      return mockChatConfig.fallbackMessage
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const currentInput = inputMessage
    setInputMessage('') // Clear input immediately

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    }

    // Add user message to state first
    setMessages(prev => [...prev, userMessage])

    // Generate bot response
    try {
      const botResponseContent = await generateBotResponse(currentInput)
      const botResponse = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: botResponseContent,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error generating bot response:', error)
      const errorResponse = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: mockChatConfig.fallbackMessage,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Chatbot</h1>
            <p className="mt-2 text-gray-600">Monitor performance and test your chatbot.</p>
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Setup
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

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Performance Analytics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Weekly Conversations Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Conversations</h4>
                <div className="flex items-end space-x-2 h-20">
                  {mockChatbot.weeklyConversations.map((count, index) => (
                    <div key={index} className="flex-1 bg-lime-200 rounded-t" style={{ height: `${(count / 35) * 100}%` }}>
                      <div className="text-xs text-center text-gray-600 mt-1">{count}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Knowledge Gaps</h4>
                  {userEmail && (
                    <span className="text-xs text-gray-500">
                      {userEmail.includes('@sumocitrus.com') ? 'Sumo Citrus' : 
                       userEmail.includes('@superfreshgrowers.com') ? 'Superfresh Growers' : 
                       'Generic'} Examples
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {knowledgeGaps.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 truncate">{item.question}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">{item.attempts}x</span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          item.status === 'unanswered' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Testing */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Test Your Chatbot</h3>
              <div className="text-xs text-gray-500">
                Live Preview • {mockChatConfig.personality === 'friendly' ? 'Friendly' : 'Professional'} Mode
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Live Chat Interface */}
            <div className="border border-gray-200 rounded-lg h-80 flex flex-col">
              <div className="px-4 py-2 border-b border-gray-200 rounded-t-lg" style={{ backgroundColor: mockChatConfig.widgetColor + '10' }}>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: mockChatConfig.widgetColor }}></div>
                  <span className="text-sm font-medium text-gray-900">{mockChatConfig.botName}</span>
                  <span className="text-xs text-gray-500">• {mockFarmData.farmName}</span>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'bot' && (
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: mockChatConfig.widgetColor }}
                      >
                        <span className="text-xs text-white font-medium">
                          {mockChatConfig.botName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className={`rounded-lg px-3 py-2 max-w-xs ${
                      message.type === 'bot' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-white'
                    }`} style={message.type === 'user' ? { backgroundColor: mockChatConfig.widgetColor } : {}}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.type === 'user' && (
                      <div className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-medium">U</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message to test..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: mockChatConfig.widgetColor }}
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Try asking: &quot;What crops do you grow?&quot;, &quot;Are you organic?&quot;, &quot;What are your prices?&quot;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}
