import { NextRequest, NextResponse } from 'next/server'
import { addToWaitlist, checkEmailExists } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'landing' } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email.toLowerCase())
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered for waitlist' },
        { status: 409 }
      )
    }

    // Get additional metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIp || undefined

    // Get UTM parameters from request
    const url = new URL(request.url)
    const utm_source = url.searchParams.get('utm_source') || undefined
    const utm_campaign = url.searchParams.get('utm_campaign') || undefined
    const utm_medium = url.searchParams.get('utm_medium') || undefined

    // Add to waitlist
    const result = await addToWaitlist({
      email: email.toLowerCase(),
      source,
      utm_source,
      utm_campaign,
      utm_medium,
      referrer,
      user_agent: userAgent,
      ip_address: ip
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        id: result.id,
        email: result.email,
        created_at: result.created_at
      }
    })

  } catch (error) {
    console.error('Waitlist signup error:', error)
    
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Waitlist API is working',
    timestamp: new Date().toISOString()
  })
}
