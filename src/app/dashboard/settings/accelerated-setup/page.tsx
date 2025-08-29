"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { regionsApi, cropsApi, chatbotConfigApi, usersApi } from '@/lib/api'

export default function AcceleratedSetup() {
  const router = useRouter()
  const [companyUrl, setCompanyUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [userEmailDomain, setUserEmailDomain] = useState('yourcompany.com')
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

  // Load user profile to get email domain for placeholder
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await usersApi.getProfile()
        const email = (profile as any)?.email || ''
        
        if (email) {
          // Extract domain from email (e.g., "dave@greengarden.com" -> "greengarden.com")
          const domain = email.split('@')[1] || 'yourcompany.com'
          setUserEmailDomain(domain)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Keep default placeholder if profile loading fails
      }
    }

    loadUserProfile()
  }, [])

  // Helper function to parse commodity strings
  const parseCommodity = (commodityString: string) => {
    // "Apples - Cosmic Crisp®" → { category: "pome-fruits", commodity: "apple", variety: "Cosmic Crisp®" }
    // "Blueberries - Organic" → { category: "berries", commodity: "blueberry", variety: "Standard", isOrganic: true }
    
    if (!commodityString || typeof commodityString !== 'string') {
      return {
        category: 'other',
        commodity: 'unknown',
        variety: 'Standard',
        isOrganic: false
      }
    }
    
    const [categoryRaw, variety] = commodityString.split(' - ')
    const isOrganic = commodityString.toLowerCase().includes('organic')
    
    // Handle pluralization properly and remove "organic" prefix
    let commodity = (categoryRaw || 'unknown').toLowerCase()
    
    // Remove "organic" prefix if present
    if (commodity.startsWith('organic ')) {
      commodity = commodity.replace('organic ', '')
    }
    
    // Handle specific plural forms
    const pluralMap: Record<string, string> = {
      'cherries': 'cherry',
      'blueberries': 'blueberry',
      'strawberries': 'strawberry',
      'blackberries': 'blackberry',
      'raspberries': 'raspberry',
      'cranberries': 'cranberry',
      'kiwi berries': 'kiwi',
      'apples': 'apple',
      'pears': 'pear',
      'oranges': 'orange',
      'lemons': 'lemon',
      'limes': 'lime',
      'grapes': 'grape',
      'peaches': 'peach',
      'apricots': 'apricot',
      'plums': 'plum',
      'tomatoes': 'tomato',
      'potatoes': 'potato',
      'onions': 'onion',
      'carrots': 'carrot',
      'peppers': 'pepper',
      'cucumbers': 'cucumber',
      'squashes': 'squash',
      'melons': 'melon',
      'avocados': 'avocado',
      'citrus': 'citrus', // Already singular
      'stone fruits': 'stone-fruit',
      'grapes': 'grape'
    }
    
    commodity = pluralMap[commodity] || commodity.replace(/s$/, '')
    
    // Map commodities to their categories
    const categoryMap: Record<string, string> = {
      'apple': 'pome-fruits',
      'pear': 'pome-fruits',
      'cherry': 'stone-fruits',
      'apricot': 'stone-fruits',
      'peach': 'stone-fruits',
      'plum': 'stone-fruits',
      'blueberry': 'berries',
      'strawberry': 'berries',
      'raspberry': 'berries',
      'blackberry': 'berries',
      'orange': 'citrus-fruits',
      'lemon': 'citrus-fruits',
      'lime': 'citrus-fruits',
      'grapefruit': 'citrus-fruits',
      'mandarin': 'citrus-fruits',
      'citrus': 'citrus-fruits',
      'table-grape': 'grapes',
      'stone-fruit': 'stone-fruits',
      'kiwi': 'tropical-fruits',
      'avocado': 'tropical-fruits',
      'mango': 'tropical-fruits'
    }
    
    const category = categoryMap[commodity] || 'other'
    
    // For more specific commodity mapping based on variety
    let finalCommodity = commodity
    
    // Map stone fruit varieties to specific commodities
    if (commodity === 'stone-fruit' && variety) {
      const varietyLower = variety.toLowerCase()
      if (varietyLower.includes('peach') || varietyLower.includes('donut')) {
        finalCommodity = 'peach'
      } else if (varietyLower.includes('nectarine')) {
        finalCommodity = 'nectarine'
      } else if (varietyLower.includes('plum') || varietyLower.includes('pluot')) {
        finalCommodity = 'plum'
      } else if (varietyLower.includes('apricot')) {
        finalCommodity = 'apricot'
      }
    }
    
    // Map citrus varieties to specific commodities
    if (commodity === 'citrus' && variety) {
      const varietyLower = variety.toLowerCase()
      if (varietyLower.includes('orange')) {
        finalCommodity = 'orange'
      } else if (varietyLower.includes('mandarin')) {
        finalCommodity = 'mandarin'
      } else if (varietyLower.includes('lemon')) {
        finalCommodity = 'lemon'
      } else if (varietyLower.includes('grapefruit')) {
        finalCommodity = 'grapefruit'
      } else if (varietyLower.includes('lime')) {
        finalCommodity = 'lime'
      }
    }
    
    // Map grape to table-grape (since Blossom Fruit grows table grapes)
    if (commodity === 'grape') {
      finalCommodity = 'table-grape'
    }

    return {
      category,
      commodity: finalCommodity,
      variety: variety || 'Standard',
      isOrganic
    }
  }

  // Helper function to get seasonality based on commodity
  const getSeasonality = (commodity: string, variety: string, isOrganic: boolean) => {
    // Superfresh Growers specific apple seasonality
    if (commodity === 'apple') {
      const appleSeasons: Record<string, { conventional?: { start: number; end: number }; organic?: { start: number; end: number } }> = {
        'ambrosia': { 
          conventional: { start: 10, end: 5 } // Oct-May
        },
        'braeburn': { 
          conventional: { start: 10, end: 6 }, // Oct-Jun
          organic: { start: 10, end: 3 } // Oct-Mar
        },
        'cosmic crisp®': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 11, end: 2 } // Nov-Feb
        },
        'evercrisp®': { 
          conventional: { start: 10, end: 2 } // Oct-Feb
        },
        'fuji': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 10, end: 6 } // Oct-Jun
        },
        'gala': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 1, end: 12 } // Year-round
        },
        'golden delicious': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 9, end: 5 } // Sep-May
        },
        'granny smith': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 9, end: 5 } // Sep-May
        },
        'honeycrisp': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 1, end: 12 } // Year-round
        },
        'jonagold': { 
          conventional: { start: 9, end: 6 } // Sep-Jun
        },
        'pink lady®': { 
          conventional: { start: 11, end: 7 }, // Nov-Jul
          organic: { start: 11, end: 5 } // Nov-May
        },
        'red delicious': { 
          conventional: { start: 1, end: 12 }, // Year-round
          organic: { start: 9, end: 6 } // Sep-Jun
        }
      }
      
      const varietyKey = variety.toLowerCase()
      const varietySeasons = appleSeasons[varietyKey]
      
      if (varietySeasons) {
        const seasonData = isOrganic ? varietySeasons.organic : varietySeasons.conventional
        if (seasonData) {
          return seasonData
        }
        // Fallback to conventional if organic not available
        return varietySeasons.conventional || { start: 9, end: 11 }
      }
    }
    
    // Superfresh Growers specific cherry seasonality
    if (commodity === 'cherry') {
      const cherrySeasons: Record<string, { conventional?: { start: number; end: number }; organic?: { start: number; end: number } }> = {
        'dark sweet': { 
          conventional: { start: 6, end: 8 }, // Jun-Aug
          organic: { start: 6, end: 8 } // Jun-Aug
        },
        'rainier': { 
          conventional: { start: 6, end: 7 } // Jun-Jul
        }
      }
      
      const varietyKey = variety.toLowerCase()
      const varietySeasons = cherrySeasons[varietyKey]
      
      if (varietySeasons) {
        const seasonData = isOrganic ? varietySeasons.organic : varietySeasons.conventional
        if (seasonData) {
          return seasonData
        }
        // Fallback to conventional if organic not available
        return varietySeasons.conventional || { start: 6, end: 8 }
      }
    }

    // Suntreat specific citrus seasonality
    if (analysisResults?.companyName === 'Suntreat') {
      // Mandarin seasonality
      if (commodity === 'mandarin') {
        const mandarinSeasons: Record<string, { start: number; end: number }> = {
          'sumo citrus': { start: 1, end: 4 }, // Jan-Apr
          'gold nugget': { start: 3, end: 5 }, // Mar-May
          'clementine': { start: 11, end: 12 }, // Nov-Dec
          'lee nova': { start: 12, end: 1 }, // Dec-Jan (crosses year)
          'murcott/tango': { start: 1, end: 5 }, // Jan-May
        }
        
        const varietyKey = variety.toLowerCase()
        const seasonData = mandarinSeasons[varietyKey]
        if (seasonData) {
          return seasonData
        }
      }

      // Orange seasonality
      if (commodity === 'orange') {
        const orangeSeasons: Record<string, { start: number; end: number }> = {
          'i\'m pink™ cara cara': { start: 12, end: 4 }, // Dec-Apr (crosses year)
          'blood orange': { start: 1, end: 3 }, // Jan-Mar
          'navel': { start: 10, end: 4 }, // Oct-Apr (crosses year)
          'reserve heirloom navels': { start: 1, end: 5 }, // Jan-May
          'import (chile) valencias': { start: 7, end: 9 }, // Jul-Sep
          'rosy red valencia': { start: 5, end: 7 }, // May-Jul
          'summer navels': { start: 4, end: 6 }, // Apr-Jun
          'valencia': { start: 4, end: 10 }, // Apr-Oct
        }
        
        const varietyKey = variety.toLowerCase()
        const seasonData = orangeSeasons[varietyKey]
        if (seasonData) {
          return seasonData
        }
      }

      // Grapefruit seasonality
      if (commodity === 'grapefruit') {
        const grapefruitSeasons: Record<string, { start: number; end: number }> = {
          'melo gold': { start: 11, end: 1 }, // Nov-Jan (crosses year)
          'oro blancos': { start: 12, end: 2 }, // Dec-Feb (crosses year)
          'pummelos': { start: 12, end: 2 }, // Dec-Feb (crosses year)
          'star ruby': { start: 3, end: 5 }, // Mar-May
          'marsh ruby': { start: 6, end: 10 }, // Jun-Oct
        }
        
        const varietyKey = variety.toLowerCase()
        const seasonData = grapefruitSeasons[varietyKey]
        if (seasonData) {
          return seasonData
        }
      }

      // Lemon seasonality (different grades have different seasons)
      if (commodity === 'lemon') {
        const lemonSeasons: Record<string, { start: number; end: number }> = {
          'lemons (d1)': { start: 10, end: 4 }, // Oct-Apr (crosses year)
          'lemons (d2)': { start: 1, end: 12 }, // Year Round
          'lemons (d3)': { start: 10, end: 2 }, // Oct-Feb (crosses year)
          'lemons (chile)': { start: 6, end: 9 }, // Jun-Sep
        }
        
        const varietyKey = variety.toLowerCase()
        const seasonData = lemonSeasons[varietyKey]
        if (seasonData) {
          return seasonData
        }
      }

      // Other citrus seasonality
      if (commodity === 'minneola') {
        return { start: 1, end: 3 } // Jan-Mar
      }
      
      if (commodity === 'lime') {
        return { start: 9, end: 10 } // Sep-Oct
      }
    }

    // Blossom Fruit International specific seasonality
    if (analysisResults?.companyName === 'Blossom Fruit International') {
      // Stone Fruits seasonality
      if (commodity === 'peach') {
        if (variety.toLowerCase().includes('donut')) {
          return { start: 6, end: 8 } // Jun-Aug (shorter season for specialty)
        }
        return { start: 5, end: 9 } // May-Sep (standard peaches)
      }
      
      if (commodity === 'nectarine') {
        return { start: 5, end: 9 } // May-Sep
      }
      
      if (commodity === 'plum') {
        return { start: 6, end: 10 } // Jun-Oct
      }
      
      if (commodity === 'apricot') {
        return { start: 5, end: 8 } // May-Aug
      }

      // Citrus seasonality
      if (commodity === 'orange') {
        if (variety.toLowerCase().includes('valencia')) {
          return { start: 3, end: 10 } // Mar-Oct
        }
        // Navel, Late Navel, Cara Cara, Blood
        return { start: 11, end: 5 } // Nov-May (crosses year)
      }
      
      if (commodity === 'mandarin') {
        if (variety.toLowerCase().includes('stem') && variety.toLowerCase().includes('leaf')) {
          return { start: 1, end: 3 } // Jan-Mar (shorter season)
        }
        return { start: 11, end: 4 } // Nov-Apr (standard mandarins)
      }
      
      if (commodity === 'lemon') {
        return { start: 1, end: 12 } // Year-round
      }
      
      if (commodity === 'grapefruit') {
        return { start: 10, end: 6 } // Oct-Jun (crosses year)
      }
      
      if (commodity === 'lime') {
        return { start: 1, end: 12 } // Year-round
      }

      // Grapes seasonality
      if (commodity === 'table-grape') {
        if (variety.toLowerCase().includes('specialty') || variety.toLowerCase().includes('candy')) {
          return { start: 7, end: 10 } // Jul-Oct (specialty varieties)
        }
        if (variety.toLowerCase().includes('black')) {
          return { start: 8, end: 12 } // Aug-Dec (black varieties)
        }
        if (variety.toLowerCase().includes('red')) {
          return { start: 7, end: 11 } // Jul-Nov (red varieties)
        }
        // Green varieties
        return { start: 6, end: 12 } // Jun-Dec (green varieties)
      }
    }
    
    // Default seasonality for other commodities
    const seasonMap: Record<string, { start: number; end: number }> = {
      'apple': { start: 9, end: 11 }, // Sep-Nov (fallback)
      'pear': { start: 8, end: 10 },  // Aug-Oct
      'cherry': { start: 6, end: 8 }, // Jun-Aug (fallback)
      'apricot': { start: 6, end: 8 }, // Jun-Aug
      'blueberry': { start: 4, end: 9 }, // Apr-Sep
      'kiwi': { start: 10, end: 12 }, // Oct-Dec
      'kiwi-berry': { start: 9, end: 9 }, // September only
      'mandarin': { start: 1, end: 4 }, // Jan-Apr (Sumo Citrus peak season)
    }
    
    return seasonMap[commodity] || { start: 1, end: 12 } // Default year-round
  }

  // Import all detected data to create real crop management entries
  const importAnalysisData = async () => {
    if (!analysisResults) return

    try {
      setIsImporting(true)

      // 1. Create a growing region for the first detected region
      const regionName = analysisResults.regions[0] || `${analysisResults.companyName} - Main Farm`
      
      // Determine city and state based on region name
      const getLocationInfo = (name: string) => {
        const lowerName = name.toLowerCase()
        
        if (lowerName.includes('exeter')) {
          return {
            city: 'Exeter',
            state: 'California'
          }
        } else if (lowerName.includes('eastern washington')) {
          return {
            city: 'Wenatchee', // Major agricultural city in Eastern Washington
            state: 'Washington'
          }
        } else if (lowerName.includes('strathmore')) {
          return {
            city: 'Strathmore',
            state: 'California'
          }
        } else if (lowerName.includes('porterville')) {
          return {
            city: 'Porterville',
            state: 'California'
          }
        } else if (lowerName.includes('lindsay')) {
          return {
            city: 'Lindsay',
            state: 'California'
          }
        } else if (lowerName.includes('leeton')) {
          return {
            city: 'Leeton',
            state: 'NSW' // New South Wales, Australia
          }
        } else if (lowerName.includes('flathead lake')) {
          return {
            city: 'Polson',
            state: 'Montana'
          }
        } else {
          // Default fallback
          return {
            city: '',
            state: ''
          }
        }
      }
      
      const locationInfo = getLocationInfo(regionName)
      
      const demoRegion = await regionsApi.create({
        name: regionName,
        location: {
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.state === 'NSW' ? 'AU' : 'US',
          formattedAddress: locationInfo.city && locationInfo.state 
            ? `${locationInfo.city}, ${locationInfo.state}${locationInfo.state === 'NSW' ? ', Australia' : ', USA'}`
            : regionName
        },
        farmingTypes: ['Tree Fruits'], // Default for most fruit operations
        acreage: '50-200', // Demo acreage range
        notes: `Imported from ${analysisResults.companyName} website analysis`
      })

      // 2. Group commodities by commodity type and create crop management entries
      const commodityGroups: Record<string, {
        category: string
        commodity: string
        varieties: Array<{ variety: string; isOrganic: boolean }>
      }> = {}

      // Group all varieties by commodity
      analysisResults.commodities.forEach(commodityString => {
        const { category, commodity, variety, isOrganic } = parseCommodity(commodityString)
        
        if (!commodityGroups[commodity]) {
          commodityGroups[commodity] = {
            category,
            commodity,
            varieties: []
          }
        }
        
        commodityGroups[commodity].varieties.push({ variety, isOrganic })
      })

      // Create one crop entry per commodity with all its variations
      const cropPromises = Object.values(commodityGroups).map(async (group) => {
        // Generate unique timestamp for this commodity group
        const timestamp = Date.now() + Math.random() * 1000 // Add randomness to avoid collisions
        
        const variations = group.varieties.map((varietyInfo, index) => {
          const seasonality = getSeasonality(group.commodity, varietyInfo.variety, varietyInfo.isOrganic)
          
          return {
            id: `variation_${Math.floor(timestamp)}_${index}`, // Generate unique variation ID matching existing pattern
            variety: varietyInfo.variety,
            isOrganic: varietyInfo.isOrganic,
            growingRegions: [{
              regionId: demoRegion.region.id, // Use the transformed ID
              regionName: demoRegion.region.name, // Add the region name
              seasonality: {
                isYearRound: seasonality.start === 1 && seasonality.end === 12,
                startMonth: seasonality.start,
                endMonth: seasonality.end
              }
            }],
            targetPricing: {
              minPrice: 0,
              maxPrice: 0,
              unit: 'lb',
              notes: ''
            },
            growingPractices: [],
            minOrder: 0,
            orderUnit: 'case',
            notes: ''
          }
        })
        
        try {
          const createdCrop = await cropsApi.create({
            category: group.category,
            commodity: group.commodity,
            variations: variations
          })
          
          return createdCrop
        } catch (error) {
          console.error(`Failed to create crop ${group.commodity}:`, error)
          throw error
        }
      })

      await Promise.all(cropPromises)
      
      // 3. Update chatbot configuration with imported marketing data
      if (analysisResults.story || analysisResults.availability || analysisResults.retailAvailability || analysisResults.faqs) {
        try {
          // Get existing chatbot config or create new one
          let chatbotConfig
          try {
            chatbotConfig = await chatbotConfigApi.get()
          } catch (error) {
            // If no config exists, we'll create a new one with defaults
            chatbotConfig = {
              botName: 'Farm Assistant',
              personality: 'friendly' as const,
              primaryGoal: 'product_info' as const,
              responseStrategy: 'hybrid' as const,
              welcomeMessage: 'Hi! How can I help you learn about our farm and products?',
              fallbackMessage: "I don't have that specific information, but I can connect you with someone who does if you'd like to share your contact details.",
              outOfSeasonMessage: 'That product is currently out of season. It will be available again soon.',
              integrationStyle: 'chat_bubble' as const,
              widgetColor: '#10b981',
              extendedKnowledge: {
                businessOperations: { farmersMarkets: '', farmTours: '', csaPrograms: '', pickYourOwn: '' },
                productInfo: { seasonalAvailability: '', productSamples: '', specialtyItems: '', storageHandling: '' },
                businessTerms: { paymentTerms: '', minimumOrders: '', deliveryOptions: '', pricingPolicy: '' },
                farmStory: { history: '', farmingPractices: '', sustainability: '', familyCompanyStory: '' },
                marketingInfo: { marketAvailability: '', retailDistribution: '', frequentlyAskedQuestions: '' }
              },
              enabledSections: {
                businessOperations: { farmersMarkets: false, farmTours: false, csaPrograms: false, pickYourOwn: false },
                productInfo: { seasonalAvailability: false, productSamples: false, specialtyItems: false, storageHandling: false },
                businessTerms: { paymentTerms: false, minimumOrders: false, deliveryOptions: false, pricingPolicy: false },
                farmStory: { history: false, farmingPractices: false, sustainability: false, familyCompanyStory: false },
                marketingInfo: { marketAvailability: false, retailDistribution: false, frequentlyAskedQuestions: false }
              }
            }
          }

          // Update with imported data
          const updatedConfig = { ...chatbotConfig }

          // Ensure all required sections exist in extendedKnowledge
          if (!updatedConfig.extendedKnowledge) {
            updatedConfig.extendedKnowledge = {}
          }
          if (!updatedConfig.extendedKnowledge.farmStory) {
            updatedConfig.extendedKnowledge.farmStory = {
              history: '',
              farmingPractices: '',
              sustainability: '',
              familyCompanyStory: ''
            }
          }
          if (!updatedConfig.extendedKnowledge.marketingInfo) {
            updatedConfig.extendedKnowledge.marketingInfo = {
              marketAvailability: '',
              retailDistribution: '',
              frequentlyAskedQuestions: ''
            }
          }

          // Ensure all required sections exist in enabledSections
          if (!updatedConfig.enabledSections) {
            updatedConfig.enabledSections = {}
          }
          if (!updatedConfig.enabledSections.farmStory) {
            updatedConfig.enabledSections.farmStory = {
              history: false,
              farmingPractices: false,
              sustainability: false,
              familyCompanyStory: false
            }
          }
          if (!updatedConfig.enabledSections.marketingInfo) {
            updatedConfig.enabledSections.marketingInfo = {
              marketAvailability: false,
              retailDistribution: false,
              frequentlyAskedQuestions: false
            }
          }

          // Handle legacy familyStory field name
          if (updatedConfig.extendedKnowledge.farmStory.familyStory !== undefined) {
            updatedConfig.extendedKnowledge.farmStory.familyCompanyStory = updatedConfig.extendedKnowledge.farmStory.familyStory
            delete updatedConfig.extendedKnowledge.farmStory.familyStory
          }
          if (updatedConfig.enabledSections.farmStory.familyStory !== undefined) {
            updatedConfig.enabledSections.farmStory.familyCompanyStory = updatedConfig.enabledSections.farmStory.familyStory
            delete updatedConfig.enabledSections.farmStory.familyStory
          }

          // Populate marketing info from analysis results
          if (analysisResults.story) {
            updatedConfig.extendedKnowledge.farmStory.familyCompanyStory = analysisResults.story
            updatedConfig.enabledSections.farmStory.familyCompanyStory = true
          }

          if (analysisResults.availability) {
            updatedConfig.extendedKnowledge.marketingInfo.marketAvailability = analysisResults.availability
            updatedConfig.enabledSections.marketingInfo.marketAvailability = true
          }

          if (analysisResults.retailAvailability) {
            updatedConfig.extendedKnowledge.marketingInfo.retailDistribution = analysisResults.retailAvailability
            updatedConfig.enabledSections.marketingInfo.retailDistribution = true
          }

          if (analysisResults.faqs && analysisResults.faqs.length > 0) {
            // Convert FAQs array to formatted string
            const faqsText = analysisResults.faqs.map(faq => 
              `Q: ${faq.question}\nA: ${faq.answer}`
            ).join('\n\n')
            
            updatedConfig.extendedKnowledge.marketingInfo.frequentlyAskedQuestions = faqsText
            updatedConfig.enabledSections.marketingInfo.frequentlyAskedQuestions = true
          }

          // Save updated chatbot configuration
          await chatbotConfigApi.update(updatedConfig)
          
        } catch (chatbotError) {
          console.error('Failed to update chatbot configuration:', chatbotError)
          // Don't fail the entire import if chatbot update fails
        }
      }
      
      // 4. Redirect to crop management page to see results
      router.push('/dashboard/price-sheets/crops')
      
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please try again or set up your farm manually.')
    } finally {
      setIsImporting(false)
    }
  }

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
      } else if (companyUrl.includes('sumocitrus.com')) {
        // Sumo Citrus - Premium mandarin brand analysis
        mockResults = {
          companyName: 'Sumo Citrus',
          farmingMethods: ['Premium Quality Standards', 'Sweetness Testing', 'Nearly 30 Years Experience', 'Non-GMO Certified'],
          regions: ['Exeter, California', 'Strathmore, California', 'Porterville, California', 'Lindsay, California', 'Leeton, NSW, Australia'],
          commodities: [
            'Mandarin - Sumo®'
          ],
          brands: [
            {
              name: 'Sumo Citrus',
              category: 'Premium Citrus',
              varieties: [
                'Sumo® Mandarin (Jan-Apr)',
                'The Ultimate Citrus Experience',
                'Naturally Seedless & Easy-to-Peel',
                'Incredibly Sweet & Enormous Size'
              ]
            }
          ],
          story: 'Sumo Citrus is a hybrid mandarin that has been perfected over nearly 30 years since being brought from Japan to California. Known as "the most pampered fruit in the world," each Sumo Citrus is tested for optimal sweetness and must meet ambitious size standards. Available January through April, Sumo Citrus is naturally seedless, easy-to-peel, and delivers 163% of daily vitamin C. The brand has cultivated an obsessed community of fans and celebrity endorsements, with national retail distribution.',
          availability: 'Peak season January through April. Available at major retailers nationwide including premium grocery chains. Look for the official purple Sumo Citrus sticker, distinct purple bins and bags, and signature Top Knot® bump. Store at cooler temperatures with good air circulation - keeps for a few days on counter or up to 4 weeks in fridge.',
          faqs: [
            {
              question: 'What is Sumo Citrus?',
              answer: 'Sumo Citrus is a hybrid fruit combining mandarin, satsuma, and orange varieties. It is renowned for its sweet, juicy, seedless nature and easy-to-peel skin.'
            },
            {
              question: 'When is Sumo Citrus in season?',
              answer: 'Sumo Citrus is available from January through April each year.'
            },
            {
              question: 'Where is Sumo Citrus grown?',
              answer: 'Originally cultivated in Japan, Sumo Citrus is now grown in California\'s Central Valley and select international locations including Australia.'
            },
            {
              question: 'How should I store Sumo Citrus?',
              answer: 'Store Sumo Citrus at cooler temperatures with good air circulation. They\'ll keep for a few days on the counter or up to four weeks in the fridge.'
            },
            {
              question: 'Why doesn\'t every Sumo Citrus look exactly the same?',
              answer: 'Each Sumo Citrus is unique in shape and size, but all share the same delicious taste. Embrace all shapes and sizes - while every Sumo Citrus is enormously delicious in taste, each fruit is unique.'
            },
            {
              question: 'Do different sized Sumo Citrus taste the same?',
              answer: 'Yes, all Sumo Citrus fruits are tested to ensure optimal sweetness, regardless of size. Every fruit must meet our ambitious standards.'
            },
            {
              question: 'Can I purchase a Sumo Citrus tree?',
              answer: 'Currently, Sumo Citrus trees are not available for purchase to maintain quality control and exclusivity.'
            },
            {
              question: 'Is Sumo Citrus non-GMO certified?',
              answer: 'Yes, Sumo Citrus is non-GMO certified and naturally seedless.'
            },
            {
              question: 'What if I found a seed?',
              answer: 'While Sumo Citrus is naturally seedless, occasionally a seed may be found. This is a rare occurrence and doesn\'t affect the fruit\'s quality.'
            },
            {
              question: 'Why is Sumo Citrus more expensive than other citrus varieties?',
              answer: 'Sumo Citrus is one of the most challenging varieties to grow, requiring meticulous care and hand-harvesting. It\'s called "the most pampered fruit in the world" for a reason, which contributes to its premium price point.'
            },
            {
              question: 'What is the nutritional information for Sumo Citrus?',
              answer: 'Each Sumo Citrus contains 163% of the daily value for vitamin C and 10% for potassium. It\'s the most indulgent immune boost you\'ll enjoy all season.'
            },
            {
              question: 'How do I identify real Sumo Citrus in the store?',
              answer: 'Look for the official purple Sumo Citrus sticker on the fruit, distinct purple bins and bags with iconic fan art reflecting our Japanese heritage, and the signature Top Knot® bump on top of the fruit.'
            },
            {
              question: 'Is it normal for Sumo Citrus to feel squishy?',
              answer: 'Yes! Sumo Citrus may feel a little squishy but this doesn\'t mean the fruit is over or under-ripe. It\'s what makes Sumo Citrus so easy to peel.'
            },
            {
              question: 'Why does Sumo Citrus look bumpy?',
              answer: 'Sumo Citrus might look a little weird with its bumpy skin, but don\'t judge a fruit by its peel. This perfectly imperfect exterior protects the incredibly sweet fruit within.'
            },
            {
              question: 'Where can I buy Sumo Citrus?',
              answer: 'Sumo Citrus is available at 15 major retail chains nationwide: Whole Foods, Albertsons, Target, Wegmans, Trader Joe\'s, Kroger, Publix, Meijer, Sam\'s Club, The Fresh Market, Stop & Shop, Sprouts, BJ\'s, Walmart, and Costco. Use our store finder at sumocitrus.com to find specific locations near you.'
            }
          ],
          retailAvailability: 'Available at 15 major retail chains nationwide during season (January-April): Whole Foods, Albertsons, Target, Wegmans, Trader Joe\'s, Kroger, Publix, Meijer, Sam\'s Club, The Fresh Market, Stop & Shop, Sprouts, BJ\'s, Walmart, and Costco. Use the store finder on sumocitrus.com to locate specific store locations near you. Currently out of season - will return to stores January through April.',
          contact: 'info@sumocitrus.com',
          confidence: {
            companyName: 'high',
            farmingMethods: 'high',
            regions: 'high',
            commodities: 'high',
            story: 'high',
            availability: 'high',
            contact: 'medium'
          }
        }
      } else if (companyUrl.includes('suntreat.com')) {
        // Suntreat - California citrus company analysis
        mockResults = {
          companyName: 'Suntreat',
          farmingMethods: ['Premium Quality Standards', '60+ Years Experience', 'Innovation & Reliability', 'Grower Partnerships'],
          regions: ['Kern County, California', 'Fresno County, California', 'Central Valley, California'],
          commodities: [
            // Mandarin varieties
            'Mandarins - Sumo Citrus',
            'Mandarins - Gold Nugget',
            'Mandarins - Clementine',
            'Mandarins - Lee Nova',
            'Mandarins - Murcott/Tango',
            // Orange varieties
            'Oranges - I\'m Pink™ Cara Cara',
            'Oranges - Blood Orange',
            'Oranges - Navel',
            'Oranges - Reserve Heirloom Navels',
            'Oranges - Import (Chile) Valencias',
            'Oranges - Rosy Red Valencia',
            'Oranges - Summer Navels',
            'Oranges - Valencia',
            // Grapefruit varieties
            'Grapefruit - Melo Gold',
            'Grapefruit - Oro Blancos',
            'Grapefruit - Pummelos',
            'Grapefruit - Star Ruby',
            'Grapefruit - Marsh Ruby',
            // Lemon varieties
            'Lemons - Lemons (D1)',
            'Lemons - Lemons (D2)',
            'Lemons - Lemons (D3)',
            'Lemons - Lemons (Chile)',
            // Simple commodities
            'Minneolas',
            'Limes'
          ],
          brands: [
            {
              name: 'Suntreat',
              category: 'Premium Citrus',
              varieties: [
                'Sumo Citrus® Mandarins (Premium)',
                'I\'M PINK® Cara Cara Oranges (Signature)',
                '5 Mandarin Varieties',
                '8 Orange Varieties', 
                '5 Grapefruit Varieties',
                '4 Lemon Grades (including Chile)',
                'Minneolas & Limes'
              ]
            }
          ],
          story: 'Established in 1958, Suntreat has over 60 years of experience partnering with California\'s finest citrus growers. Located in the heart of California\'s Central Valley, we\'ve built our business on innovation, reliability, and consistently great products. Our deep relationships with growers between southern Kern County and Fresno County ensure year-round availability of top-quality citrus.',
          availability: 'Year-round citrus availability through strategic partnerships with premium California growers. Our groves span from southern Kern County to Fresno County, ensuring consistent supply of fresh, high-quality citrus throughout all seasons.',
          retailAvailability: 'Available through major retail chains and food service distributors across the United States. Our premium citrus products, including signature Sumo Citrus® and I\'M PINK® Cara Cara oranges, are distributed nationwide through established retail partnerships.',
          faqs: [
            {
              question: 'What makes Suntreat citrus different?',
              answer: 'Our 60+ years of experience and deep partnerships with California\'s best growers ensure consistently high quality. We focus on innovation and reliability to deliver premium citrus year-round.'
            },
            {
              question: 'Where are your groves located?',
              answer: 'Our partner groves are strategically located between southern Kern County and Fresno County in California\'s Central Valley, the heart of premium citrus production.'
            },
            {
              question: 'Do you grow Sumo Citrus?',
              answer: 'Yes, we are proud partners in growing and distributing premium Sumo Citrus® mandarins, known for their exceptional sweetness and easy-peel characteristics.'
            },
            {
              question: 'What is I\'M PINK® Cara Cara?',
              answer: 'I\'M PINK® Cara Cara is our signature pink-fleshed navel orange variety, known for its sweet flavor and beautiful pink interior color.'
            },
            {
              question: 'Do you offer organic options?',
              answer: 'We work with select growers who maintain organic certifications and can provide organic citrus options based on seasonal availability and customer requirements.'
            },
            {
              question: 'What grades of lemons do you offer?',
              answer: 'We offer multiple lemon grades including D1, D2, and D3 classifications, as well as imported Chilean lemons to ensure year-round availability.'
            }
          ],
          contact: 'info@suntreat.com',
          confidence: {
            companyName: 'high',
            farmingMethods: 'high',
            regions: 'high',
            commodities: 'high',
            story: 'high',
            availability: 'high',
            contact: 'medium'
          }
        }
      } else if (companyUrl.includes('superfreshgrowers.com')) {
        // Comprehensive Superfresh Growers analysis based on actual website data
        mockResults = {
          companyName: 'Superfresh Growers',
          farmingMethods: ['American Family Farming', 'Sustainable Growing', '125+ Years Experience', 'Integrated Pest Management (IPM)'],
          regions: ['Eastern Washington', 'Central Washington', 'Southern Oregon (Umpqua Valley)', 'Flathead Lake, Montana'],
          commodities: [
            // Premium Apple varieties - Conventional
            'Apples - Ambrosia',
            'Apples - Braeburn', 
            'Apples - Cosmic Crisp®',
            'Apples - EverCrisp®',
            'Apples - Fuji',
            'Apples - Gala',
            'Apples - Golden Delicious',
            'Apples - Granny Smith',
            'Apples - Honeycrisp',
            'Apples - Jonagold',
            'Apples - Pink Lady®',
            'Apples - Red Delicious',
            // Premium Apple varieties - Organic
            'Organic Apples - Braeburn',
            'Organic Apples - Cosmic Crisp®',
            'Organic Apples - Fuji',
            'Organic Apples - Gala',
            'Organic Apples - Golden Delicious',
            'Organic Apples - Granny Smith',
            'Organic Apples - Honeycrisp',
            'Organic Apples - Pink Lady®',
            'Organic Apples - Red Delicious',
            // Premium Pear varieties
            'Pears - Anjou',
            'Pears - Asian',
            'Pears - Bartlett',
            'Pears - Bosc',
            'Pears - Comice',
            'Pears - Concorde',
            'Pears - Conference',
            'Pears - Forelle',
            'Pears - Red Anjou',
            'Pears - Red Bartlett',
            'Pears - Seckel',
            'Pears - Starkrimson',
            // Cherry varieties
            'Cherries - Dark Sweet',
            'Organic Cherries - Dark Sweet',
            'Cherries - Rainier',
            // Specialty fruits
            'Kiwi Berry - Hardy Kiwi',
            'Apricots - Central Washington',
            'Blueberries - Conventional (Norris Farms Partnership)',
            'Organic Blueberries - Norris Farms Partnership'
          ],
          brands: [
            {
              name: 'Superfresh Growers',
              category: 'Tree Fruits',
              varieties: [
                '12 Apple Varieties (Premium)',
                '11 Pear Varieties (Specialty)',
                '2 Cherry Types (Sweet & Rainier)',
                'Kiwi Berries (Unique)',
                'Apricots (Jun-Aug)',
                'Blueberries via Norris Farms Partnership'
              ]
            }
          ],
          story: 'Superfresh Growers is a family-owned fruit company with over 125 years of experience growing premium apples, pears, cherries, and kiwi berries in Washington State, Oregon, and Montana. We practice sustainable farming and Integrated Pest Management (IPM) to produce high-quality fruit while being conscious of environmental and food safety concerns. We continuously convert orchards to organic production and are committed to American family farming traditions.',
          availability: 'Our fruit is available nearly every grocery store in the United States and many major international retailers. We do not sell directly to the public. Seasonal availability varies by fruit type - apples and pears available most of the year, cherries in summer, kiwi berries in fall.',
          retailAvailability: 'Available at nearly every grocery store in the United States and many major international retailers. We distribute through major supermarket chains, specialty stores, and international markets. Contact your local grocery store to inquire about specific varieties like Autumn Glory™ apples.',
          faqs: [
            {
              question: 'Where can I find Autumn Glory™ Apple?',
              answer: 'Since Autumn Glory™ is so unique, not every store has it. Inquire at your local grocery store for availability.'
            },
            {
              question: 'Do you grow GMO (Genetically Modified Organism) fruit?',
              answer: 'No, we do not. We believe Mother Nature has already perfected the fruit we are privileged to grow. Instead, we create new varieties using centuries-old cross-pollination methods, the same way farmers have done it for thousands of years.'
            },
            {
              question: 'Why does my bag of apples say "Coated with food grade wax"?',
              answer: 'Apples naturally produce wax to protect their water content. After harvest washing removes this natural wax, so we re-apply food-grade wax to maintain freshness and prevent moisture loss. The same waxes are used to make chocolates and are FDA-certified safe to eat.'
            },
            {
              question: 'Can I buy your foods directly from you?',
              answer: 'We do not sell to the public, but our delicious apples, pears, cherries, and kiwi berries can be found at nearly every grocery store in the United States and many major international retailers.'
            },
            {
              question: 'What food safety procedures do you have?',
              answer: 'Food Safety is our number one concern throughout the entire journey of our fruit, from the dirt to your table. We have many programs in place that are held to the highest standards.'
            },
            {
              question: 'Where is your fruit grown?',
              answer: 'All of our fruit is grown in Washington State, on the eastern edge of the Cascade Mountain range, with the exception of several cherry orchards in northern Oregon and Flathead Lake, Montana.'
            },
            {
              question: 'What nutrients are in an apple?',
              answer: 'Apples are very high in fiber and vitamin C while having a low-calorie count (100 for a medium-sized) and only a trace of sodium. Plus, no fat or cholesterol! Apples also help reduce the risk of cancer, cardiovascular disease, and diabetes.'
            },
            {
              question: 'What is the white substance on my apples and pears?',
              answer: 'We use kaolin clay, primarily in organic production, to protect the fruit from certain insects and sun damage. The clay is natural, approved for organics use, and not considered an allergen.'
            },
            {
              question: 'How do you protect trees from pests?',
              answer: 'We practice Integrated Pest Management (IPM) which combines biological, cultural, chemical, and mechanical pest control methods. Pesticides are used as sparingly as possible, and we continuously search for natural alternatives to synthetic chemicals.'
            },
            {
              question: 'Do you grow organically?',
              answer: 'Yes! We are continuously converting orchards to organic production. It takes three years of growing using organically-approved practices before certification. Our organic fruit is marked "Superfresh Growers Organics®."'
            },
            {
              question: 'Why do you put stickers on fruit?',
              answer: 'Fruit stickers help consumers identify varieties and ensure correct pricing. They bear PLU codes that help clerks and track popular items. Some stickers now have bar codes for faster checkout and easier self-checkout.'
            },
            {
              question: 'Can I grow apple trees from apple seeds?',
              answer: 'Commercial apple trees are not grown from seed because seeds do not produce "true to variety." We use centuries-old grafting methods where a scion from the parent tree is grafted onto rootstock to ensure consistent variety characteristics.'
            }
          ],
          contact: 'info@superfreshgrowers.com',
          confidence: {
            companyName: 'high',
            farmingMethods: 'high',
            regions: 'high',
            commodities: 'high',
            story: 'high',
            availability: 'high',
            contact: 'high'
          }
        }
      } else if (companyUrl.includes('blossomfruitintl.com')) {
        // Blossom Fruit International - Premium fruit distributor analysis
        mockResults = {
          companyName: 'Blossom Fruit International',
          farmingMethods: ['Premium Quality Standards', 'Food Safety Certified', 'Global Supply Chain', 'Year-Round Programs'],
          regions: ['Visalia, California', 'Central Valley, California', 'International Partners'],
          commodities: [
            // Stone Fruits
            'Stone Fruits - White Flesh Peaches',
            'Stone Fruits - Yellow Flesh Peaches',
            'Stone Fruits - Donut Peaches',
            'Stone Fruits - White Flesh Nectarines',
            'Stone Fruits - Yellow Flesh Nectarines',
            'Stone Fruits - Red Plums',
            'Stone Fruits - Black Plums',
            'Stone Fruits - Green Plums',
            'Stone Fruits - Pluots',
            'Stone Fruits - Apricots',
            // Citrus
            'Citrus - Navel Oranges',
            'Citrus - Late Navel Oranges',
            'Citrus - Cara Cara Oranges',
            'Citrus - Blood Oranges',
            'Citrus - Valencia Oranges',
            'Citrus - Murcott Mandarins',
            'Citrus - Tango Mandarins',
            'Citrus - Clemenules Mandarins',
            'Citrus - Stem & Leaf Mandarins',
            'Citrus - Eureka Lemons',
            'Citrus - Lisbon Lemons',
            'Citrus - Ruby Red Grapefruit',
            'Citrus - Limes',
            // Grapes
            'Grapes - Sweet Globe (Green)',
            'Grapes - Ivory (Green)',
            'Grapes - Timpson (Green)',
            'Grapes - Autumn King (Green)',
            'Grapes - Sweet Celebration (Red)',
            'Grapes - Allison (Red)',
            'Grapes - Timco (Red)',
            'Grapes - Passion Fire (Red)',
            'Grapes - Sweet Sapphire (Black)',
            'Grapes - Summer Royal (Black)',
            'Grapes - Autumn Royal (Black)',
            'Grapes - Cotton Candy (Specialty)',
            'Grapes - Candy Heart (Specialty)',
            'Grapes - Candy Snaps (Specialty)',
            'Grapes - Candy Dreams (Specialty)',

          ],
          brands: [
            {
              name: 'Blossom Stone Fruits',
              category: 'Stone Fruits',
              varieties: [
                'White & Yellow Flesh Peaches (May-Sep)',
                'Donut Peaches (Jun-Aug)',
                'White & Yellow Flesh Nectarines (May-Sep)',
                'Red, Black & Green Plums (Jun-Oct)',
                'Premium Pluots (Jul-Sep)',
                'Golden Apricots (May-Aug)'
              ]
            },
            {
              name: 'Blossom Citrus',
              category: 'Citrus',
              varieties: [
                'Navel & Late Navel Oranges (Nov-May)',
                'Cara Cara & Blood Oranges (Dec-Apr)',
                'Valencia Oranges (Mar-Oct)',
                'Murcott, Tango & Clemenules Mandarins (Nov-Apr)',
                'Stem & Leaf Mandarins (Jan-Mar)',
                'Eureka & Lisbon Lemons (Year-round)',
                'Ruby Red Grapefruit (Oct-Jun)',
                'Persian Limes (Year-round)'
              ]
            },
            {
              name: 'Blossom Grapes',
              category: 'Grapes',
              varieties: [
                'Green Varieties: Sweet Globe, Ivory, Timpson, Autumn King (Jun-Dec)',
                'Red Varieties: Sweet Celebration, Allison, Timco, Passion Fire (Jul-Nov)',
                'Black Varieties: Sweet Sapphire, Summer Royal, Autumn Royal (Aug-Dec)',
                'Specialty: Cotton Candy, Candy Heart, Candy Snaps, Candy Dreams (Jul-Oct)'
              ]
            }
          ],
          story: 'At Blossom Fruit International, every box we ship carries the story of a grower, a region, and a season. We celebrate nature\'s cycles and the work behind every harvest — bringing premium fruit from farm to table, year-round.',
          availability: 'We supply premium-quality fresh fruit to the nation\'s leading retailers and wholesalers. In addition to our domestic programs, we export to a select group of international markets, always upholding the highest standards of freshness and food safety.',
          retailAvailability: 'Available through leading retailers and wholesalers nationwide. Export programs available for select international markets.',
          faqs: [
            {
              question: 'What makes Blossom Fruit International different?',
              answer: 'We focus on premium quality and maintain the highest standards of freshness and food safety across all our programs.'
            },
            {
              question: 'Do you offer year-round programs?',
              answer: 'Yes, we provide year-round fruit programs through our domestic and international partnerships.'
            },
            {
              question: 'What regions do you serve?',
              answer: 'We supply to leading retailers and wholesalers nationwide, plus select international markets.'
            }
          ],
          contact: 'info@blossomfruitintl.com',
          confidence: {
            companyName: 'high',
            farmingMethods: 'high',
            regions: 'high',
            commodities: 'high',
            story: 'high',
            availability: 'high',
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
                                            placeholder={`https://${userEmailDomain}`}
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
                      {analysisResults.regions.length > 0 ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-900">Growing Regions</span>
                        <p className="text-sm text-gray-600">
                          {analysisResults.regions.length > 0 ? analysisResults.regions.join(', ') + ' (detected)' : 'None detected - you can add these manually'}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {analysisResults.regions.length > 0 ? 'Review' : 'Add'}
                    </button>
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
                    <button 
                      onClick={() => setShowImportPreview(true)}
                      className="px-6 py-2 bg-gradient-to-r from-lime-600 to-cyan-600 text-white text-sm font-medium rounded-md hover:from-lime-700 hover:to-cyan-700 shadow-lg"
                    >
                      Preview & Import Data
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

      {/* Import Preview Modal */}
      {showImportPreview && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Import Preview</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review all data that will be imported to your farm profile
                  </p>
                </div>
                <button
                  onClick={() => setShowImportPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Company Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Company Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Company Name:</span>
                      <p className="text-gray-900">{analysisResults.companyName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact:</span>
                      <p className="text-gray-900">{analysisResults.contact}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Farming Methods:</span>
                      <p className="text-gray-900">{analysisResults.farmingMethods.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Regions:</span>
                      <p className="text-gray-900">{analysisResults.regions.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growing Region to be Created */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Growing Region (1 will be created)</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {analysisResults.regions[0] || `${analysisResults.companyName} - Main Farm`}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Acreage: 50-200 acres • Farming Type: Tree Fruits • All crops will be assigned to this region
                  </p>
                </div>
              </div>

              {/* Grouped Commodities Preview */}
              <div className="mb-6">
                {(() => {
                  // Group commodities for preview
                  const commodityGroups: Record<string, {
                    category: string
                    commodity: string
                    varieties: Array<{ variety: string; isOrganic: boolean }>
                  }> = {}

                  analysisResults.commodities.forEach(commodityString => {
                    const { category, commodity, variety, isOrganic } = parseCommodity(commodityString)
                    
                    if (!commodityGroups[commodity]) {
                      commodityGroups[commodity] = {
                        category,
                        commodity,
                        varieties: []
                      }
                    }
                    
                    commodityGroups[commodity].varieties.push({ variety, isOrganic })
                  })

                  const groupCount = Object.keys(commodityGroups).length
                  const varietyCount = analysisResults.commodities.length

                  return (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Crops to Import ({groupCount} commodities, {varietyCount} varieties)
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="space-y-4">
                          {Object.values(commodityGroups).map((group, index) => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            
                            return (
                              <div key={index} className="bg-white rounded-md p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium text-gray-900 capitalize">
                                      {group.commodity}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {group.category.replace('-', ' ')} • {group.varieties.length} varieties
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {group.varieties.map((varietyInfo, vIdx) => {
                                    const seasonality = getSeasonality(group.commodity, varietyInfo.variety, varietyInfo.isOrganic)
                                    const seasonText = seasonality.start === 1 && seasonality.end === 12 
                                      ? 'Year-round' 
                                      : `${months[seasonality.start - 1]}-${months[seasonality.end - 1]}`
                                    
                                    return (
                                      <div key={vIdx} className="flex items-center justify-between py-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-700">{varietyInfo.variety}</span>
                                          {varietyInfo.isOrganic && (
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                              Organic
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">{seasonText}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Company Story Section */}
              {analysisResults.story && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Company Story</h3>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      {analysisResults.story}
                    </p>
                  </div>
                </div>
              )}

              {/* Availability Section */}
              {analysisResults.availability && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Market Availability</h3>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      {analysisResults.availability}
                    </p>
                  </div>
                </div>
              )}

              {/* Retail Availability Section */}
              {analysisResults.retailAvailability && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Retail Distribution</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800 leading-relaxed">
                      {analysisResults.retailAvailability}
                    </p>
                  </div>
                </div>
              )}

              {/* FAQs Section */}
              {analysisResults.faqs && analysisResults.faqs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Frequently Asked Questions ({analysisResults.faqs.length} total)</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {analysisResults.faqs.slice(0, 5).map((faq, index) => (
                        <div key={index} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                          <h4 className="font-medium text-slate-900 mb-2">{faq.question}</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                      {analysisResults.faqs.length > 5 && (
                        <div className="text-sm text-slate-600 font-medium pt-2 border-t border-slate-200">
                          + {analysisResults.faqs.length - 5} more FAQs will be imported for chatbot knowledge
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Brands Section */}
              {analysisResults.brands && analysisResults.brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Brand Details</h3>
                  <div className="space-y-3">
                    {analysisResults.brands.map((brand, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-lime-50 to-cyan-50 p-4 rounded-lg border border-lime-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{brand.name}</h4>
                          <span className="text-xs bg-lime-100 text-lime-800 px-2 py-1 rounded-full">{brand.category}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {brand.varieties.map((variety, vIdx) => (
                            <div key={vIdx}>• {variety}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                This will create 1 growing region and {analysisResults.commodities.length} crop varieties
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowImportPreview(false)
                    importAnalysisData()
                  }}
                  disabled={isImporting}
                  className="px-6 py-2 bg-gradient-to-r from-lime-600 to-cyan-600 text-white text-sm font-medium rounded-md hover:from-lime-700 hover:to-cyan-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import All Data'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
