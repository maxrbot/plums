# Plums Deployment Guide 🚀

This guide will help you deploy Plums to production and set up email sending with SendGrid.

---

## 📋 Prerequisites

Before deploying, you'll need:

1. **SendGrid Account** (free tier: 100 emails/day)
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Verify your email address
   - Create an API key

2. **MongoDB Atlas** (free tier: 512MB)
   - Already set up ✅

3. **Vercel Account** (free for hobby projects)
   - Sign up at [vercel.com](https://vercel.com)

---

## 🔐 Step 1: Set Up SendGrid

### Create SendGrid Account
1. Go to [sendgrid.com/signup](https://signup.sendgrid.com/)
2. Sign up with your email
3. Verify your email address
4. Complete the setup wizard

### Create API Key
1. Log in to SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `Plums Production`
5. Select **Full Access** (or at minimum: **Mail Send** permission)
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### Verify Sender Identity
SendGrid requires you to verify your sending email address:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: Your name or company name
   - From Email: Your business email (e.g., max@yourcompany.com)
   - Reply To: Same as from email
   - Company Address: Your address
4. Check your email and verify

---

## ⚙️ Step 2: Configure Environment Variables

### Local Development (.env.local)

Update `/Users/max/Documents/GitHub/plums/backend/.env`:

```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL (for generating price sheet links)
FRONTEND_URL=http://localhost:3000

# Existing variables...
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PORT=3001
```

### Update Frontend Environment

Create `/Users/max/Documents/GitHub/plums/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🌐 Step 3: Deploy to Vercel

### Deploy Frontend

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm install -g vercel
   ```

2. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add email sending functionality"
   git push origin main
   ```

3. **Deploy via Vercel Web Interface**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Next.js
     - **Root Directory**: `./` (leave default)
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
   
4. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-url.com
     ```

5. Click **Deploy**

### Deploy Backend

You have several options:

#### Option A: Railway (Recommended - Easy)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   ```
   SENDGRID_API_KEY = SG.xxxxxxxxx
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = your-secret-key
   FRONTEND_URL = https://your-vercel-app.vercel.app
   PORT = 3001
   ```
7. Deploy!

#### Option B: Render
Similar to Railway, very straightforward.

#### Option C: DigitalOcean App Platform
Good for scaling, slightly more complex.

---

## 🧪 Step 4: Test Email Sending

### Test Locally First

1. **Start backend** (with SENDGRID_API_KEY set):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   cd ..
   npm run dev
   ```

3. **Create a test contact**:
   - Go to `http://localhost:3000/dashboard/contacts`
   - Add a contact with YOUR email address

4. **Create a test price sheet**:
   - Go to `http://localhost:3000/dashboard/price-sheets/new`
   - Add a few products
   - Save the price sheet

5. **Send test email**:
   - Go to `http://localhost:3000/dashboard/price-sheets/send`
   - Select your price sheet
   - Select your test contact
   - Click "Generate Emails"
   - Click "Send Now"

6. **Check your inbox!** 📧
   - You should receive an email with a link to view the price sheet
   - Click the link to test the public viewer

### Test in Production

Repeat the same steps on your deployed Vercel URL.

---

## 📊 How It Works

### Email Flow

```
1. User creates price sheet → Saved to MongoDB
2. User selects contacts → Loads from MongoDB
3. User clicks "Send Now" → Frontend calls API
4. Backend generates unique URL → /ps/[priceSheetId]
5. Backend sends via SendGrid → Beautiful HTML email
6. Recipient clicks link → Public viewer page (no login)
7. View is tracked → Logged to MongoDB
```

### What's Sent

Each recipient receives:
- ✅ Personalized email with their name
- ✅ Custom message (if you added one)
- ✅ Link to view full price sheet
- ✅ Contact information for replies

### What's Tracked

- ✅ Email sent timestamp
- ✅ Price sheet views (IP, timestamp, user agent)
- ✅ Which contacts received which sheets
- ❌ Email opens (not yet - see TODO #5)
- ❌ Link clicks (not yet - see TODO #5)

---

## 🎯 Next Steps (TODOs)

### Completed ✅
1. ✅ Public price sheet viewer (`/ps/[id]`)
2. ✅ SendGrid integration
3. ✅ Email sending API
4. ✅ Wire up frontend to real API

### Pending 🚧
5. **Add email open/click tracking** (SendGrid webhooks)
6. **Create analytics dashboard** (show engagement metrics)

---

## 🐛 Troubleshooting

### "Email service not configured"
- Make sure `SENDGRID_API_KEY` is set in backend `.env`
- Restart backend after adding environment variable

### "Failed to send email"
- Check SendGrid API key is valid
- Verify sender email address in SendGrid
- Check backend logs for detailed error

### Emails not arriving
- Check spam folder
- Verify recipient email is correct
- Check SendGrid Activity dashboard for delivery status

### Public viewer shows "Not Found"
- Price sheet ID must be valid MongoDB ObjectId
- Price sheet must exist in database
- Check browser console for errors

---

## 💰 Costs (Free Tier Limits)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| SendGrid | 100 emails/day | $15/month for 40k emails |
| MongoDB Atlas | 512MB storage | $9/month for 2GB |
| Vercel | Unlimited hobby projects | $20/month per team member |
| Railway/Render | $5 credit | ~$5-10/month |

**Total for MVP: $0/month** (within free tiers)
**Total for production (100 users): ~$5-15/month**

---

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ JWT authentication for all protected routes
- ✅ MongoDB user isolation (each user sees only their data)
- ✅ Public routes don't expose sensitive data
- ✅ Rate limiting enabled (100 requests/minute)
- ⚠️ **TODO**: Add HTTPS redirect in production
- ⚠️ **TODO**: Set up proper CORS for production domain

---

## 📞 Support

If you run into issues:
1. Check the troubleshooting section above
2. Check backend logs (Railway/Render dashboard)
3. Check SendGrid Activity feed
4. Review browser console errors

---

**Ready to go live? Let's ship it! 🚀**

