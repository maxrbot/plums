import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set. Email sending will not work.')
}

export interface EmailRecipient {
  email: string
  name: string
}

export interface SendPriceSheetEmailParams {
  to: EmailRecipient
  from: EmailRecipient
  subject: string
  priceSheetTitle: string
  priceSheetId: string
  priceSheetUrl: string
  customMessage?: string
  productsCount: number
  customContent?: string // Raw custom email content (overrides template)
  bcc?: string // BCC email address
  contactId?: string // Contact ID for tracking
  deliveryMethod?: 'link' | 'inline' // How to deliver the price sheet
  products?: Array<{ // Products for inline delivery
    name: string
    packageType: string
    grade?: string
    price?: number
    overrideComment?: string
  }>
  orderUrl?: string // Direct link to order page for inline delivery
  attachments?: Array<{ // File attachments
    content: string // Base64 encoded file content
    filename: string
    type: string // MIME type
    disposition: string // 'attachment' or 'inline'
  }>
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Generate inline product list HTML for email
 */
function generateInlineProductList(products: Array<any>, showAll: boolean = false): string {
  const displayProducts = showAll ? products : products.slice(0, 8)
  const hasMore = products.length > 8
  
  return displayProducts.map(product => {
    // Build product display: [Commodity] - [Variety] - Package - Size - Grade - [availability tag if not "Available"] - Price
    let display = product.name // Commodity - Variety
    
    // Add package type
    if (product.packageType) {
      display += ` - ${product.packageType}`
    }
    
    // Add size
    if (product.size) {
      display += ` - ${product.size}`
    }
    
    // Add grade
    if (product.grade) {
      display += ` - ${product.grade}`
    }
    
    // Add availability tag if not "Available"
    if (product.availability && product.availability !== 'Available') {
      display += ` - ${product.availability}`
    }
    
    // Add price or override comment
    const priceDisplay = product.overrideComment 
      ? product.overrideComment // Just show the comment as-is
      : product.price 
        ? `$${product.price.toFixed(2)}`
        : 'Contact for pricing'
    
    display += ` - ${priceDisplay}`
    
    return display
  }).join('\n') + (hasMore && !showAll ? `\n\n+ ${products.length - 8} more items` : '')
}

/**
 * Generate HTML email template for price sheet
 */
function generatePriceSheetEmailHTML(params: SendPriceSheetEmailParams): string {
  const { to, from, priceSheetTitle, priceSheetUrl, customMessage, productsCount, customContent, deliveryMethod, products, orderUrl } = params
  const firstName = to.name.split(' ')[0] || 'there'
  
  // If custom content is provided, use a simpler template
  if (customContent) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${priceSheetTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="padding: 40px;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #374151;">${customContent}</pre>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">
                ${from.name}
              </p>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">
                ${from.email}
              </p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                  Powered by <strong>Acrelist</strong> • Fresh Produce Price Management
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }
  
  // If inline delivery method is selected and products are provided
  if (deliveryMethod === 'inline' && products && products.length > 0) {
    const productList = generateInlineProductList(products, false)
    const hasMore = products.length > 8
    const viewFullSheetText = hasMore ? `<p style="margin: 10px 0; color: #374151; font-size: 14px; line-height: 1.6;">View entire price sheet with all ${productsCount} items: <a href="${priceSheetUrl}" style="color: #2563eb; text-decoration: underline;">View Full Price Sheet</a></p>` : ''
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${priceSheetTitle}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px;">
    <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
      Hi ${firstName},
    </p>
    
    ${customMessage ? `<p style="margin: 0 0 15px 0; color: #1f2937; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>` : `<p style="margin: 0 0 15px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">Here's our latest pricing and availability:</p>`}
    
    <pre style="margin: 15px 0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1f2937;">${productList}</pre>
    
    ${viewFullSheetText}
    
    <p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
      Ready to order? <a href="${orderUrl || priceSheetUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Build Order</a>
    </p>
    
    <p style="margin: 25px 0 5px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
      <a href="${priceSheetUrl}" style="color: #6b7280; text-decoration: underline;">View online price sheet</a>
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 3px 0; color: #1f2937; font-size: 14px;">
        ${from.name}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        ${from.email}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
  
  // Otherwise use the standard template (link delivery)
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${priceSheetTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ${priceSheetTitle}
              </h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px;">
                ${productsCount} products available
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${firstName},
              </p>
              
              ${customMessage ? `<p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>` : `<p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">Here's our latest pricing and availability:</p>`}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${priceSheetUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      View Price Sheet
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or would like to place an order, please don't hesitate to reach out.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">
                ${from.name}
              </p>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">
                ${from.email}
              </p>
              
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                This pricing is intended for ${params.to.name}.<br>
                Questions? Simply reply to this email.
              </p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                  Powered by <strong>Acrelist</strong> • Fresh Produce Price Management
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of email
 */
function generatePriceSheetEmailText(params: SendPriceSheetEmailParams): string {
  const { to, from, priceSheetTitle, priceSheetUrl, customMessage, productsCount, customContent, deliveryMethod, products, orderUrl } = params
  const firstName = to.name.split(' ')[0] || 'there'
  
  // If custom content is provided, use it directly
  if (customContent) {
    return `
${customContent}

---
${from.name}
${from.email}

Powered by Acrelist • Fresh Produce Price Management
    `.trim()
  }
  
  // If inline delivery method
  if (deliveryMethod === 'inline' && products && products.length > 0) {
    const productList = generateInlineProductList(products, false)
    const hasMore = products.length > 8
    const viewFullSheetText = hasMore ? `\n\nView entire price sheet with all ${productsCount} items:\n${priceSheetUrl}\n` : ''
    
    return `
Hi ${firstName},

${customMessage || "Here's our latest pricing and availability:"}

${productList}
${viewFullSheetText}
Ready to order? ${orderUrl || priceSheetUrl}

View online price sheet: ${priceSheetUrl}

---
${from.name}
${from.email}

Powered by Acrelist
    `.trim()
  }
  
  // Otherwise use the standard template (link delivery)
  return `
${priceSheetTitle}
${productsCount} products available

Hi ${firstName},

${customMessage || "Here's our latest pricing and availability:"}

View the full price sheet here:
${priceSheetUrl}

If you have any questions or would like to place an order, please don't hesitate to reach out.

Best regards,
${from.name}
${from.email}

This pricing is intended for ${params.to.name}.
Questions? Simply reply to this email.

---
Powered by Acrelist • Fresh Produce Price Management
  `.trim()
}

/**
 * Send price sheet email via SendGrid
 */
export async function sendPriceSheetEmail(params: SendPriceSheetEmailParams): Promise<EmailSendResult> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ Cannot send email: SENDGRID_API_KEY not configured')
    return {
      success: false,
      error: 'Email service not configured'
    }
  }

  try {
    // Use a verified sending email (noreply@yourdomain.com)
    // But show the user's name, and set Reply-To to user's actual email
    const verifiedSendingEmail = process.env.SENDGRID_VERIFIED_EMAIL || 'noreply@acrelist.ag'
    
    console.log('📧 Sending email TO:', params.to.email, `(${params.to.name})`)
    console.log('📧 Sending email FROM:', verifiedSendingEmail, '(verified)')
    console.log('📧 Reply-To will be:', params.from.email, '(user email)')
    console.log('📧 Price Sheet URL:', params.priceSheetUrl)
    
    const msg: any = {
      to: {
        email: params.to.email,
        name: params.to.name
      },
      from: {
        email: verifiedSendingEmail, // Your verified email
        name: params.from.name // User's name: "Max Wilson - Function Ranch"
      },
      replyTo: {
        email: params.from.email, // User's actual email
        name: params.from.name
      },
      subject: params.subject,
      text: generatePriceSheetEmailText(params),
      html: generatePriceSheetEmailHTML(params),
      // Enable click tracking and open tracking
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      },
      // Custom args for tracking (SendGrid will include these in webhook events)
      customArgs: {
        priceSheetId: params.priceSheetId,
        recipientEmail: params.to.email,
        ...(params.contactId && { contactId: params.contactId })
      }
    }
    
    // Always BCC acrelisthistory@gmail.com for platform oversight, plus user's BCC if requested
    const bccEmails = ['acrelisthistory@gmail.com']
    if (params.bcc) {
      bccEmails.push(params.bcc)
    }
    
    msg.bcc = bccEmails
    console.log(`📧 BCC: ${bccEmails.join(', ')}`)
    
    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      msg.attachments = params.attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: att.disposition
      }))
      console.log(`📎 Attachments: ${params.attachments.length} file(s) - ${params.attachments.map(a => a.filename).join(', ')}`)
    }

    const [response] = await sgMail.send(msg)
    
    console.log(`✅ Email sent to ${params.to.email} (${response.statusCode})`)
    
    return {
      success: true,
      messageId: response.headers['x-message-id']
    }
    
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error.message)
    
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

/**
 * Send bulk price sheet emails (with rate limiting)
 */
export async function sendBulkPriceSheetEmails(
  recipients: EmailRecipient[],
  baseParams: Omit<SendPriceSheetEmailParams, 'to'>
): Promise<{ sent: number; failed: number; results: EmailSendResult[] }> {
  
  console.log(`📬 Starting bulk email send to ${recipients.length} recipient(s)`)
  
  const results: EmailSendResult[] = []
  let sent = 0
  let failed = 0

  // Send emails one by one with a small delay to respect rate limits
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]
    console.log(`📧 [${i + 1}/${recipients.length}] Sending to: ${recipient.email} (${recipient.name})`)
    
    const result = await sendPriceSheetEmail({
      ...baseParams,
      to: recipient
    })

    results.push(result)
    
    if (result.success) {
      sent++
      console.log(`✅ [${i + 1}/${recipients.length}] SUCCESS: ${recipient.email} - MessageID: ${result.messageId}`)
    } else {
      failed++
      console.error(`❌ [${i + 1}/${recipients.length}] FAILED: ${recipient.email} - Error: ${result.error}`)
    }

    // Small delay between sends (100ms = max 10 emails/second)
    // SendGrid free tier: 100 emails/day
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`📬 Bulk send complete: ${sent} sent, ${failed} failed`)
  return { sent, failed, results }
}

export default {
  sendPriceSheetEmail,
  sendBulkPriceSheetEmails
}

