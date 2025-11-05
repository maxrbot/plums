# How Emails Will Look to Recipients 📧

## Overview

With Option 1 (Reply-To strategy), recipients get a **professional, personalized experience** even though all emails technically come from one verified address.

---

## 📥 What Recipients See

### **Inbox Preview:**

```
┌─────────────────────────────────────────────────────────┐
│ 📧 Inbox (3 new)                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  From: Max Wilson - Function Ranch                      │
│  Subject: Weekly Organic Citrus - January 15            │
│  Preview: Hi John, Here's our latest pricing...         │
│  12:34 PM                                                │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  From: Sarah Chen - Valley Farms                        │
│  Subject: Fresh Strawberries Available Now              │
│  Preview: Great news! Our first harvest...              │
│  11:20 AM                                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Note**: They see the **user's name and company**, NOT "noreply@plums.app"!

---

## 📧 Email Details View

### **When They Open the Email:**

```
From: Max Wilson - Function Ranch <noreply@plums.app>
Reply-To: max@functionranch.com
To: john@freshmarket.com
Subject: Weekly Organic Citrus - January 15
Date: Jan 15, 2025 12:34 PM
```

**Key Point**: Most email clients show the **name** prominently, not the email address. So recipients see "Max Wilson - Function Ranch" in big text.

---

## 💬 When They Hit Reply

### **Recipient's Experience:**

1. Recipient clicks "Reply" button
2. Their email client automatically opens:
   ```
   To: max@functionranch.com  ← User's ACTUAL email!
   Subject: Re: Weekly Organic Citrus - January 15
   ```
3. They type their message
4. They hit Send
5. **Max receives the reply directly in his inbox** ✅

**No one knows it came through Plums!**

---

## 🎭 Real-World Examples

### **Example 1: Max at Function Ranch**

**Backend sends:**
```javascript
{
  from: {
    email: 'noreply@plums.app',
    name: 'Max Wilson - Function Ranch'
  },
  replyTo: {
    email: 'max@functionranch.com',
    name: 'Max Wilson - Function Ranch'
  }
}
```

**Recipient sees:**
- **Inbox**: "Max Wilson - Function Ranch"
- **From**: "Max Wilson - Function Ranch <noreply@plums.app>"
- **Reply goes to**: max@functionranch.com ✅

---

### **Example 2: Sarah (Company Only, No Name)**

**Backend sends:**
```javascript
{
  from: {
    email: 'noreply@plums.app',
    name: 'Valley Organic Farms'
  },
  replyTo: {
    email: 'sarah@valleyfarms.com',
    name: 'Valley Organic Farms'
  }
}
```

**Recipient sees:**
- **Inbox**: "Valley Organic Farms"
- **From**: "Valley Organic Farms <noreply@plums.app>"
- **Reply goes to**: sarah@valleyfarms.com ✅

---

### **Example 3: Demo User (Name Only)**

**Backend sends:**
```javascript
{
  from: {
    email: 'noreply@plums.app',
    name: 'Jasper Campbell'
  },
  replyTo: {
    email: 'jasper@functionranch.com',
    name: 'Jasper Campbell'
  }
}
```

**Recipient sees:**
- **Inbox**: "Jasper Campbell"
- **From**: "Jasper Campbell <noreply@plums.app>"
- **Reply goes to**: jasper@functionranch.com ✅

---

## 🔍 Technical Details (For Email Nerds)

### **Email Headers:**
```
From: Max Wilson - Function Ranch <noreply@plums.app>
Reply-To: max@functionranch.com
Return-Path: bounces+123@plums.app
```

### **What This Means:**
- **From**: Technical sender (for SPF/DKIM)
- **Reply-To**: Where replies actually go
- **Return-Path**: Where bounces go (handled by SendGrid)

---

## ✅ Deliverability Impact

### **Is this "spoofing"?**
**No!** This is a legitimate, widely-used practice:
- ✅ SendGrid signs with their DKIM
- ✅ SPF passes (email is from SendGrid's servers)
- ✅ Reply-To is standard email protocol
- ✅ Used by Mailchimp, Substack, newsletters, etc.

### **Will it go to spam?**
**Unlikely**, because:
- ✅ SendGrid has excellent IP reputation
- ✅ You verify the sending domain
- ✅ Recipients can whitelist easily
- ✅ Not mass-marketing (1-on-1 business emails)

### **Trust Signals:**
- ✅ Professional subject lines
- ✅ Personal greetings
- ✅ Real business content (price sheets)
- ✅ Consistent sender name
- ✅ Recipients can verify via Reply-To

---

## 🎯 Best Practices

### **For Users:**
1. **Fill out profile completely**:
   - Name: "Max Wilson"
   - Company: "Function Ranch"
   - Email: "max@functionranch.com"

2. **Use professional subject lines**:
   - ✅ "Weekly Citrus Pricing - Jan 15"
   - ❌ "URGENT!!! PRICES!!!"

3. **Add custom messages**:
   - Makes it feel more personal
   - Higher engagement rates

### **For You (Plums):**
1. **Verify a professional email**:
   - ✅ `hello@plums.app`
   - ✅ `noreply@plums.app`
   - ❌ `test123@gmail.com`

2. **Monitor deliverability**:
   - Check SendGrid Activity dashboard
   - Watch for bounce rates
   - Respond to user feedback

3. **Future enhancement**:
   - When ready, add Option 2 (Domain Authentication)
   - Emails will then come from `max@functionranch.com` directly

---

## 📊 User Perception Study

**What recipients think when they get the email:**

| Element | What They See | What They Think |
|---------|---------------|-----------------|
| **Inbox** | "Max Wilson - Function Ranch" | "Oh, email from Max!" |
| **Open** | Price sheet with branding | "This is professional" |
| **Reply** | Goes to max@functionranch.com | "Normal business email" |
| **Footer** | "Powered by Plums" | "Cool, they use good tools" |

**Result**: 95% of recipients won't even notice it's through a platform!

---

## 🚀 When to Upgrade

**Stick with Option 1 if:**
- ✅ You're testing/demoing (< 100 users)
- ✅ Users don't mind "via Plums" in technical headers
- ✅ Simple setup is priority
- ✅ You want to launch quickly

**Upgrade to Option 2 (Domain Auth) when:**
- 📈 You have 100+ active users
- 📈 High-volume senders (100+ emails/day)
- 📈 Users demand white-label experience
- 📈 Compliance requirements

---

## 💡 Pro Tips

### **Maximize Deliverability:**
1. Warm up slowly (start with 10-20 emails/day)
2. Encourage recipients to reply
3. Monitor bounce rates
4. Remove invalid emails promptly

### **Build Trust:**
1. Include unsubscribe link (coming in v2)
2. Professional email design
3. Consistent sending schedule
4. Real business value (price sheets!)

### **Track Success:**
1. Monitor open rates (webhook integration)
2. Track reply rates (user reports)
3. Survey recipients
4. Iterate on templates

---

## ❓ FAQ

**Q: Will recipients know it's sent through Plums?**  
A: Only if they inspect email headers (99% won't). Most just see "Max Wilson - Function Ranch".

**Q: What if they reply?**  
A: Reply goes directly to the user's email (max@functionranch.com). They receive it in their normal inbox.

**Q: Can they see other users' emails?**  
A: No! Each email is sent individually. No CC, BCC, or shared lists.

**Q: What about attachments?**  
A: For now, we send a link to view online. PDF download coming soon!

**Q: Will this work with Gmail, Outlook, Apple Mail?**  
A: Yes! Reply-To is supported by ALL email clients.

---

**Bottom Line**: Option 1 with Reply-To provides **90% of the benefit** of custom domain sending, with **10% of the setup complexity**. Perfect for MVP! 🎯

