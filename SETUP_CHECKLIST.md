# Setup Checklist for Real Email Sending ✅

Quick checklist to get email sending working in 10 minutes.

---

## Local Testing (5 minutes)

### 1. Create SendGrid Account
- [ ] Go to [sendgrid.com/signup](https://signup.sendgrid.com/)
- [ ] Sign up and verify email
- [ ] Complete onboarding wizard

### 2. Get API Key
- [ ] Go to Settings → API Keys
- [ ] Create new API key: "Plums Development"
- [ ] Select "Full Access" or "Mail Send"
- [ ] Copy the API key (starts with `SG.`)

### 3. Verify Sender (ONE Email for All Users)
- [ ] Go to Settings → Sender Authentication
- [ ] Click "Verify a Single Sender"
- [ ] Enter a "noreply" email you control:
  - If you own `plums.app`: use `noreply@plums.app`
  - For testing: use `hello@functionranch.com` (or your domain)
- [ ] Check email and click verify link
- [ ] **Note**: This is the "technical sender" - user's name will show in inbox

### 4. Configure Backend
- [ ] Open `backend/.env`
- [ ] Add line: `SENDGRID_API_KEY=SG.your-key-here`
- [ ] Add line: `SENDGRID_VERIFIED_EMAIL=hello@functionranch.com` (or whatever you verified)
- [ ] Add line: `FRONTEND_URL=http://localhost:3000`
- [ ] Save file

### 5. Restart Backend
```bash
cd backend
npm run dev
```
- [ ] Check logs for "MarketHunt API server running"
- [ ] Should NOT see "SENDGRID_API_KEY not set" warning

### 6. Test Email Send
- [ ] Open `http://localhost:3000/dashboard/contacts`
- [ ] Add a contact with YOUR email address
- [ ] Go to `/dashboard/price-sheets/send`
- [ ] Select a price sheet
- [ ] Select your contact
- [ ] Click "Generate Emails"
- [ ] Click "Send Now"
- [ ] Check your inbox! 📧

---

## Production Deployment (30 minutes)

### 1. Deploy Backend
- [ ] Choose platform: Railway / Render / DigitalOcean
- [ ] Connect GitHub repo
- [ ] Set root directory: `/backend`
- [ ] Add environment variables:
  - `SENDGRID_API_KEY`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL` (your Vercel URL)
- [ ] Deploy
- [ ] Copy backend URL

### 2. Deploy Frontend
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import GitHub repo
- [ ] Add environment variable:
  - `NEXT_PUBLIC_API_URL` = your backend URL
- [ ] Deploy
- [ ] Wait for build to complete

### 3. Update Backend URL
- [ ] Go back to backend platform
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Redeploy backend

### 4. Test Production
- [ ] Open your Vercel URL
- [ ] Login
- [ ] Send test email
- [ ] Verify it works

---

## Verification

### Email Arrives?
- ✅ Check inbox (and spam folder)
- ✅ Email has green header with price sheet title
- ✅ "View Price Sheet" button is clickable

### Public Viewer Works?
- ✅ Click "View Price Sheet" button in email
- ✅ Opens in browser without login
- ✅ Shows all products with correct pricing
- ✅ Mobile-friendly layout

### Tracking Works?
- ✅ Check MongoDB `sentEmails` collection (should have entry)
- ✅ Click the link (should log view to `priceSheetViews`)

---

## Troubleshooting

### "Email service not configured"
→ Restart backend after adding `SENDGRID_API_KEY`

### "Failed to send email"
→ Check SendGrid Activity dashboard for errors
→ Verify sender email is confirmed

### Email never arrives
→ Check spam folder
→ Check SendGrid Activity for delivery status
→ Verify recipient email is correct

### Link broken
→ Check `FRONTEND_URL` is set correctly
→ Price sheet must exist in database

---

## Success! 🎉

If you've checked all boxes above, you're ready to:
- Send price sheets to real customers
- Track views and engagement
- Scale up as needed

---

## What's Next?

Once basic sending works:
1. [ ] Set up email webhooks for open tracking
2. [ ] Build analytics dashboard
3. [ ] Add scheduled sends
4. [ ] Integrate SMS (Twilio)

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

