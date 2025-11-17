import { FarmKnowledgeCache, ChatMessage, ChatRequest, ChatResponse } from '../models/types'
import knowledgeCacheService from './knowledgeCache'

export class ConversationalAIService {
  private claudeApiKey: string
  private claudeApiUrl = 'https://api.anthropic.com/v1/messages'

  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY || ''
    if (!this.claudeApiKey) {
      console.warn('CLAUDE_API_KEY not found in environment variables')
    }
  }

  /**
   * Process a chat request and return AI response
   */
  async processChat(userId: string, chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      // Get fresh knowledge cache
      const knowledgeCache = await knowledgeCacheService.getFreshKnowledgeCache(userId)
      
      // Build system prompt with farm knowledge
      const systemPrompt = this.buildSystemPrompt(knowledgeCache)
      
      // Build conversation history
      const messages = this.buildConversationMessages(chatRequest, systemPrompt)
      
      // Call Claude API
      const response = await this.callClaudeAPI(messages)
      
      return {
        message: response,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error processing chat:', error)
      return {
        message: "I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date()
      }
    }
  }

  /**
   * Build comprehensive system prompt from farm knowledge
   */
  private buildSystemPrompt(knowledgeCache: FarmKnowledgeCache): string {
    const { farmProfile, products, businessInfo, botConfig } = knowledgeCache

    let prompt = `CRITICAL INSTRUCTION: You are having a conversation. Only answer the user's most recent question. Do not repeat or re-answer previous questions in the conversation.

You are ${botConfig.botName}, an AI assistant for ${farmProfile.name}. `
    
    // Personality
    if (botConfig.personality === 'friendly') {
      prompt += `You have a warm, friendly, and approachable personality. Use casual, conversational language and be enthusiastic about the farm. `
    } else {
      prompt += `You have a professional, business-focused personality. Use clear, direct language and focus on helping customers make informed decisions. `
    }

    // Primary goal
    if (botConfig.primaryGoal === 'lead_generation') {
      prompt += `Your primary goal is to collect visitor contact information so the sales team can follow up. `
    } else {
      prompt += `Your primary goal is to provide helpful information about the farm's products and operations. `
    }

    prompt += `Always be helpful and knowledgeable about the farm.\n\n`

    // Farm Profile
    prompt += `FARM INFORMATION:\n`
    prompt += `Farm Name: ${farmProfile.name}\n`
    prompt += `Contact: ${farmProfile.contact.email}`
    if (farmProfile.contact.phone) prompt += `, ${farmProfile.contact.phone}`
    if (farmProfile.contact.website) prompt += `, ${farmProfile.contact.website}`
    prompt += `\n`
    
    if (farmProfile.locations.length > 0) {
      prompt += `Growing Locations: ${farmProfile.locations.join(', ')}\n`
    }

    // Farm Story
    if (farmProfile.story) {
      prompt += `\nFARM STORY:\n`
      if (farmProfile.story.history) prompt += `History: ${farmProfile.story.history}\n`
      if (farmProfile.story.farmingPractices) prompt += `Farming Practices: ${farmProfile.story.farmingPractices}\n`
      if (farmProfile.story.sustainability) prompt += `Sustainability: ${farmProfile.story.sustainability}\n`
      if (farmProfile.story.familyStory) prompt += `Family Story: ${farmProfile.story.familyStory}\n`
    }

    // Products
    if (products.length > 0) {
      prompt += `\nPRODUCTS WE GROW:\n`
      products.forEach(product => {
        prompt += `${product.commodity}:\n`
        product.varieties.forEach(variety => {
          prompt += `  - ${variety.name}`
          if (variety.isOrganic) prompt += ` (Organic)`
          if (variety.regions.length > 0) prompt += ` - grown in ${variety.regions.join(', ')}`
          if (variety.seasonality) prompt += ` - available ${variety.seasonality}`
          if (variety.currentPrice) prompt += ` - currently ${variety.currentPrice}`
          prompt += `\n`
        })
      })
    }

    // Certifications
    if (businessInfo.certifications.length > 0) {
      prompt += `\nCERTIFICATIONS: ${businessInfo.certifications.join(', ')}\n`
    }

    // Services
    if (businessInfo.services) {
      prompt += `\nSERVICES:\n`
      if (businessInfo.services.farmersMarkets) prompt += `Farmers Markets: ${businessInfo.services.farmersMarkets}\n`
      if (businessInfo.services.farmTours) prompt += `Farm Tours: ${businessInfo.services.farmTours}\n`
      if (businessInfo.services.csaPrograms) prompt += `CSA Programs: ${businessInfo.services.csaPrograms}\n`
      if (businessInfo.services.pickYourOwn) prompt += `Pick-Your-Own: ${businessInfo.services.pickYourOwn}\n`
    }

    // Business Terms
    if (businessInfo.terms) {
      prompt += `\nBUSINESS TERMS:\n`
      if (businessInfo.terms.minimumOrders) prompt += `Minimum Orders: ${businessInfo.terms.minimumOrders}\n`
      if (businessInfo.terms.deliveryOptions) prompt += `Delivery: ${businessInfo.terms.deliveryOptions}\n`
      if (businessInfo.terms.paymentTerms) prompt += `Payment: ${businessInfo.terms.paymentTerms}\n`
      if (businessInfo.terms.pricingPolicy) prompt += `Pricing: ${businessInfo.terms.pricingPolicy}\n`
    }

    // Product Information
    if (businessInfo.productInfo) {
      prompt += `\nPRODUCT INFORMATION:\n`
      if (businessInfo.productInfo.seasonalAvailability) prompt += `Seasonal Availability: ${businessInfo.productInfo.seasonalAvailability}\n`
      if (businessInfo.productInfo.productSamples) prompt += `Product Samples: ${businessInfo.productInfo.productSamples}\n`
      if (businessInfo.productInfo.specialtyItems) prompt += `Specialty Items: ${businessInfo.productInfo.specialtyItems}\n`
      if (businessInfo.productInfo.storageHandling) prompt += `Storage & Handling: ${businessInfo.productInfo.storageHandling}\n`
    }

    // Marketing Information
    if ((businessInfo as any).marketingInfo) {
      prompt += `\nMARKETING INFORMATION:\n`
      if ((businessInfo as any).marketingInfo.retailDistribution) prompt += `Retail Distribution: ${(businessInfo as any).marketingInfo.retailDistribution}\n`
      if ((businessInfo as any).marketingInfo.marketAvailability) prompt += `Market Availability: ${(businessInfo as any).marketingInfo.marketAvailability}\n`
    }

    // Frequently Asked Questions (separate section for prominence)
    if ((businessInfo as any).marketingInfo?.frequentlyAskedQuestions) {
      prompt += `\nFREQUENTLY ASKED QUESTIONS:\n`
      prompt += `${(businessInfo as any).marketingInfo.frequentlyAskedQuestions}\n`
      prompt += `Use these FAQ answers when relevant to user questions.\n`
    }

    // Response Guidelines
    prompt += `\nRESPONSE GUIDELINES:\n`
    prompt += `- Always respond as ${botConfig.botName} representing ${farmProfile.name}\n`
    prompt += `- Use the farm information provided above to answer questions\n`
    prompt += `- If you don't know something specific, use this message: "${botConfig.fallbackMessage}"\n`
    prompt += `- For out-of-season products, use: "${botConfig.outOfSeasonMessage}"\n`
    
    if (botConfig.primaryGoal === 'lead_generation') {
      prompt += `- Always try to collect visitor contact information for follow-up\n`
      prompt += `- Offer to connect them with the sales team for detailed pricing and orders\n`
    } else {
      prompt += `- Focus on providing helpful information first\n`
      prompt += `- Offer to connect with the sales team when appropriate\n`
    }
    
    prompt += `- You are ${botConfig.botName} having a natural conversation\n`
    prompt += `- Answer ONLY the current question - nothing else\n`
    prompt += `- Be brief and conversational\n`
    prompt += `- Never repeat information from previous responses\n`

    return prompt
  }

  /**
   * Build conversation messages for Claude API
   */
  private buildConversationMessages(chatRequest: ChatRequest, systemPrompt: string) {
    const messages: any[] = []

    // Add conversation history if provided
    if (chatRequest.conversationHistory && chatRequest.conversationHistory.length > 0) {
      chatRequest.conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: chatRequest.message
    })

    return {
      system: systemPrompt,
      messages: messages
    }
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(payload: any): Promise<string> {
    if (!this.claudeApiKey) {
      throw new Error('Claude API key not configured')
    }

    console.log('🔑 Claude API key length:', this.claudeApiKey.length)
    console.log('🔑 Claude API key starts with:', this.claudeApiKey.substring(0, 20) + '...')

    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: payload.system,
      messages: payload.messages
    }

    console.log('📤 Sending request to Claude API...')
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(this.claudeApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Claude API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API error:', response.status, errorText)
      throw new Error(`Claude API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json() as any
    console.log('✅ Claude API response:', JSON.stringify(data, null, 2))
    return data.content[0].text
  }

  /**
   * Invalidate knowledge cache for a user (call when farm data changes)
   */
  async invalidateKnowledgeCache(userId: string): Promise<void> {
    await knowledgeCacheService.rebuildKnowledgeCache(userId)
  }
}

export default new ConversationalAIService()
