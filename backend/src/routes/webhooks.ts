import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import database from '../config/database'

/**
 * SendGrid Webhook Events
 * https://docs.sendgrid.com/for-developers/tracking-events/event
 */

interface SendGridEvent {
  email: string
  timestamp: number
  event: 'processed' | 'delivered' | 'open' | 'click' | 'bounce' | 'dropped' | 'spamreport' | 'unsubscribe' | 'group_unsubscribe' | 'group_resubscribe'
  sg_event_id: string
  sg_message_id: string
  useragent?: string
  ip?: string
  url?: string
  // Custom args we send with emails
  priceSheetId?: string
  recipientEmail?: string
  contactId?: string
}

export default async function webhooksRoutes(fastify: FastifyInstance) {
  // SendGrid Event Webhook (no auth - SendGrid calls this)
  fastify.post('/sendgrid', async (request, reply) => {
    try {
      const events = request.body as SendGridEvent[]
      
      if (!Array.isArray(events)) {
        return reply.status(400).send({ error: 'Invalid payload' })
      }
      
      console.log(`📬 Received ${events.length} SendGrid events`)
      
      const db = database.getDb()
      const emailEvents = []
      
      for (const event of events) {
        console.log(`📧 Event: ${event.event} for ${event.email}`)
        
        // Only track opens, clicks, and forwards (group_resubscribe is sometimes used for forwards)
        if (!['open', 'click'].includes(event.event)) {
          continue
        }
        
        // Extract custom args from the event
        const priceSheetId = event.priceSheetId || (event as any).price_sheet_id
        const recipientEmail = event.recipientEmail || event.email
        const contactId = event.contactId || (event as any).contact_id
        
        // Create email event record
        const emailEvent = {
          eventType: event.event,
          email: recipientEmail,
          timestamp: new Date(event.timestamp * 1000),
          sgEventId: event.sg_event_id,
          sgMessageId: event.sg_message_id,
          userAgent: event.useragent,
          ip: event.ip,
          url: event.url,
          priceSheetId: priceSheetId ? new ObjectId(priceSheetId) : null,
          contactId: contactId ? new ObjectId(contactId) : null,
          createdAt: new Date()
        }
        
        emailEvents.push(emailEvent)
        
        // Update the sentEmails record to mark as opened
        if (event.event === 'open' && priceSheetId && contactId) {
          await db.collection('sentEmails').updateOne(
            {
              priceSheetId: new ObjectId(priceSheetId),
              contactId: new ObjectId(contactId)
            },
            {
              $set: {
                emailOpened: true,
                emailOpenedAt: new Date(event.timestamp * 1000)
              }
            }
          )
        }
      }
      
      // Bulk insert email events
      if (emailEvents.length > 0) {
        await db.collection('emailEvents').insertMany(emailEvents)
        console.log(`✅ Stored ${emailEvents.length} email events`)
      }
      
      return reply.status(200).send({ received: events.length, stored: emailEvents.length })
      
    } catch (error) {
      console.error('SendGrid webhook error:', error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
  
  // Test endpoint to manually trigger an email open event (for testing)
  fastify.post('/test-email-open', async (request, reply) => {
    const { priceSheetId, contactId, email } = request.body as {
      priceSheetId: string
      contactId: string
      email: string
    }
    
    if (!priceSheetId || !contactId || !email) {
      return reply.status(400).send({ error: 'Missing required fields' })
    }
    
    try {
      const db = database.getDb()
      
      // Create a test email event
      await db.collection('emailEvents').insertOne({
        eventType: 'open',
        email,
        timestamp: new Date(),
        sgEventId: `test-${Date.now()}`,
        sgMessageId: `test-msg-${Date.now()}`,
        priceSheetId: new ObjectId(priceSheetId),
        contactId: new ObjectId(contactId),
        createdAt: new Date()
      })
      
      // Update sentEmails
      await db.collection('sentEmails').updateOne(
        {
          priceSheetId: new ObjectId(priceSheetId),
          contactId: new ObjectId(contactId)
        },
        {
          $set: {
            emailOpened: true,
            emailOpenedAt: new Date()
          }
        }
      )
      
      return reply.status(200).send({ success: true, message: 'Test email open event created' })
      
    } catch (error) {
      console.error('Test email open error:', error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}


