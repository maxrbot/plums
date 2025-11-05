# 🔐 Contact-Specific Pricing System

## Overview

The Acrelist platform now implements a **secure, contact-specific pricing system** for price sheets. This allows you to:

1. **Share product catalogs publicly** (without pricing) via a base URL
2. **Send personalized pricing** to specific contacts via unique, hashed URLs
3. **Apply contact-specific discounts** automatically
4. **Track who views what** with detailed analytics

## How It Works

### 1. Base URL (Catalog View)

When someone visits a price sheet without a contact hash:

```
https://acrelist.com/ps/abc123
```

**What they see:**
- ✅ All product names and details
- ✅ Availability status
- ✅ Package types and sizes
- ❌ **NO PRICING** - All prices are hidden

**Use case:** Share your product catalog publicly, on social media, or with prospects before you're ready to share pricing.

---

### 2. Personalized URL (With Pricing)

When a contact receives an email, they get a unique URL with a hash:

```
https://acrelist.com/ps/abc123?c=a1b2c3d4e5f6g7h8
```

**What they see:**
- ✅ All product names and details
- ✅ Availability status
- ✅ Package types and sizes
- ✅ **THEIR PERSONALIZED PRICING** - Including any contact-specific discounts

**Security:**
- The hash (`c=a1b2c3d4e5f6g7h8`) is generated using the contact's ID as part of the encryption salt
- It's **impossible to reverse-engineer** the contact ID from the hash
- It's **impossible to forge** a hash for a different contact
- Each contact gets a **completely unique** hash, even for the same price sheet

---

## Technical Implementation

### Backend: Hash Generation

Located in: `backend/src/utils/contactHash.ts`

```typescript
// Generate a secure hash for a contact
const hash = generateContactHash(contactId, priceSheetId)
// Result: "a1b2c3d4e5f6g7h8" (16 characters)

// The hash uses:
// 1. A secret key from environment variables
// 2. The contact's ID as additional salt
// 3. HMAC-SHA256 encryption
```

**Why it's secure:**
- Uses the contact ID itself as part of the salt
- Even if someone knows the algorithm, they can't generate valid hashes without knowing:
  - The secret key (`CONTACT_HASH_SECRET`)
  - The specific contact ID

### Backend: Email Sending

Located in: `backend/src/routes/priceSheets.ts`

When sending emails:

```typescript
for (const contact of contacts) {
  // Generate unique hash for this contact
  const contactHash = generateContactHash(
    contact._id.toString(), 
    priceSheet._id.toString()
  )
  
  // Build personalized URL
  const personalizedUrl = `${baseUrl}?c=${contactHash}`
  
  // Send email with personalized URL
  await sendEmail(contact, personalizedUrl)
}
```

### Backend: Public Price Sheet Route

Located in: `backend/src/routes/public.ts`

When someone views a price sheet:

```typescript
// 1. Check if there's a contact hash in the URL
const contactHash = request.query.c

// 2. If hash exists, verify it's valid
if (contactHash) {
  const matchedContactId = findContactByHash(
    contactHash, 
    priceSheetId, 
    sentToContactIds
  )
  
  if (matchedContactId) {
    // Valid hash! Show pricing with contact-specific adjustments
    showPricing = true
    applyContactPricingAdjustments(products, contact)
  }
}

// 3. If no valid hash, hide all pricing
if (!showPricing) {
  products = products.map(p => ({ ...p, price: null }))
}
```

### Frontend: Public Viewer

Located in: `src/app/ps/[id]/page.tsx`

The public price sheet viewer:

```typescript
// 1. Read the contact hash from URL
const contactHash = urlParams.get('c')

// 2. Fetch price sheet with hash (if present)
const response = await fetch(
  contactHash 
    ? `/api/public/price-sheets/${id}?c=${contactHash}`
    : `/api/public/price-sheets/${id}`
)

// 3. Display pricing conditionally
{showPricing && (
  <td className="text-right">
    ${product.price.toFixed(2)}
  </td>
)}
```

---

## Contact-Specific Pricing Adjustments

Each contact can have a `pricingAdjustment` field (percentage):

- **`pricingAdjustment: 0`** → Base pricing (no change)
- **`pricingAdjustment: -10`** → 10% discount
- **`pricingAdjustment: 5`** → 5% markup

**Example:**

```typescript
// Base price: $100
// Contact has -10% adjustment

// Backend automatically calculates:
adjustedPrice = basePrice * (1 + pricingAdjustment / 100)
adjustedPrice = 100 * (1 + (-10) / 100)
adjustedPrice = 100 * 0.9
adjustedPrice = $90
```

The contact sees **$90** in their personalized price sheet, while another contact with no adjustment sees **$100**.

---

## Environment Variables

Add to `backend/.env`:

```bash
# Contact Hash Secret (for personalized price sheet URLs)
# Change this to a random string in production
CONTACT_HASH_SECRET=your-random-secret-string-for-contact-hashing
```

**Important:** 
- Use a strong, random secret in production
- Never commit this to version control
- Changing this will invalidate all existing hashed URLs

---

## Security Considerations

### ✅ What's Protected

1. **Contact IDs are hidden** - The hash doesn't reveal the contact ID
2. **Can't forge hashes** - Need the secret key + contact ID to generate valid hashes
3. **Can't guess hashes** - 16-character hex string = 2^64 possible combinations
4. **Contact-specific** - Each contact gets a unique hash, even for the same price sheet

### ⚠️ What's NOT Protected

1. **URL sharing** - If a contact shares their personalized URL, others can see their pricing
2. **Email forwarding** - If a contact forwards the email, the recipient gets the same pricing

**Mitigation:**
- Track views by IP address and user agent
- Monitor for suspicious access patterns
- Add "This pricing is confidential and intended for [Contact Name] only" to emails

---

## Analytics & Tracking

Every price sheet view is logged to `priceSheetViews` collection:

```typescript
{
  priceSheetId: ObjectId,
  userId: ObjectId,
  contactEmail: "buyer@example.com", // Only if valid hash
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  viewedAt: Date,
  referrer: "https://gmail.com"
}
```

**Use this data to:**
- See which contacts opened their price sheets
- Track view counts per price sheet
- Identify which products get the most views
- Monitor for suspicious access patterns

---

## Use Cases

### 1. Public Product Catalog

Share the base URL on your website or social media:

```
"Check out our current availability: https://acrelist.com/ps/abc123"
```

Visitors see products but not pricing. They contact you for quotes.

### 2. Personalized Quotes

Send personalized emails to specific buyers:

```
"Hi John, here's your personalized pricing: 
https://acrelist.com/ps/abc123?c=a1b2c3d4e5f6g7h8"
```

John sees his custom pricing (with his 10% volume discount applied).

### 3. Tiered Pricing

Set different `pricingAdjustment` values for different customer tiers:

- **Retail customers:** `pricingAdjustment: 0` (base pricing)
- **Wholesale customers:** `pricingAdjustment: -15` (15% discount)
- **Premium partners:** `pricingAdjustment: -25` (25% discount)

Each tier sees their appropriate pricing automatically.

---

## Testing

### Test the Base URL (No Pricing)

1. Send a price sheet to at least one contact
2. Copy the price sheet ID from the URL
3. Visit: `http://localhost:3000/ps/{priceSheetId}`
4. Verify: Products are visible, but **no pricing column** appears

### Test the Personalized URL (With Pricing)

1. Send a price sheet to a contact via email
2. Open the email and click the "View Price Sheet" button
3. Verify: Products are visible **with pricing**
4. Check the URL - it should have `?c=...` at the end

### Test Contact-Specific Pricing

1. Create two contacts with different `pricingAdjustment` values
2. Send the same price sheet to both
3. Open each personalized link
4. Verify: Each contact sees different pricing

---

## Future Enhancements

Potential improvements to consider:

1. **Expiring links** - Add a timestamp to the hash, make links expire after X days
2. **One-time links** - Track if a link has been used, invalidate after first view
3. **IP restrictions** - Only allow views from specific IP ranges
4. **Password protection** - Require a password in addition to the hash
5. **View limits** - Limit how many times a link can be accessed
6. **Watermarking** - Add the contact's name/email as a watermark on the page

---

## Troubleshooting

### "Pricing is hidden even with a hash in the URL"

**Possible causes:**
1. The hash is invalid or expired
2. The contact wasn't in the original `sentTo` list
3. The `CONTACT_HASH_SECRET` changed since the email was sent

**Solution:**
- Re-send the price sheet to the contact
- Check backend logs for hash verification errors

### "All contacts see the same pricing"

**Possible causes:**
1. Contact `pricingAdjustment` values are all `0`
2. The adjustment isn't being applied in the backend

**Solution:**
- Check contact records in MongoDB for `pricingAdjustment` field
- Verify the pricing adjustment logic in `backend/src/routes/public.ts`

---

## Summary

✅ **Base URL** → Catalog view (no pricing)  
✅ **Hashed URL** → Personalized pricing for specific contacts  
✅ **Secure** → Can't forge or reverse-engineer hashes  
✅ **Flexible** → Apply contact-specific discounts automatically  
✅ **Trackable** → Monitor who views what  

This system gives you full control over who sees what pricing, while keeping your base product catalog shareable publicly.

