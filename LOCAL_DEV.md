# 🚀 Local Development Guide

## Quick Start

### Option 1: Automated (Recommended)
```bash
./dev.sh
```
This opens 3 terminal tabs with all servers running.

### Option 2: Manual (if you prefer)
Open 3 separate terminals and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Platform App:**
```bash
npm run dev
```

**Terminal 3 - Marketing Site:**
```bash
cd marketing
npm run dev
```

---

## Access URLs

- 🌐 **Marketing Site**: http://localhost:3002
- 💻 **Platform App**: http://localhost:3000  
- 🔧 **Backend API**: http://localhost:3001

---

## Testing the Full Flow

1. Go to http://localhost:3002 (marketing site)
2. Click "Join AcreList Early Access"
3. Enter invite code or sign up for waitlist
4. After login, you'll be redirected to http://localhost:3000/dashboard
5. Make changes to any file → see them instantly!

---

## Environment Files

All `.env.local` files are already configured for local development:

- `/backend/.env` → MongoDB Atlas, SendGrid, JWT secrets
- `/.env.local` → Platform app config
- `/marketing/.env.local` → Marketing site config

---

## Hot Reload

✅ **Frontend changes** → Instant reload (no restart needed)
✅ **Backend changes** → Auto-restart with `tsx watch`
✅ **Environment variable changes** → Restart the affected server

---

## Tips

### Stop All Servers
Close the terminal tabs or press `Ctrl+C` in each terminal.

### Check if Ports are in Use
```bash
lsof -i :3000  # Platform app
lsof -i :3001  # Backend
lsof -i :3002  # Marketing site
```

### Kill a Port if Stuck
```bash
kill -9 $(lsof -t -i:3000)  # Replace 3000 with the stuck port
```

### Test API Directly
```bash
curl http://localhost:3001/api/health
```

---

## Workflow

### Making Changes

1. **Edit files** in your code editor
2. **See changes instantly** in browser (auto-reload)
3. **Test thoroughly** locally
4. **Commit when ready**: `git add . && git commit -m "Your message"`
5. **Push to deploy**: `git push origin main`

### No More Waiting for Deployments! 🎉

- Local changes: **Instant** ⚡
- Production deploys: Only when you're ready to ship

---

## Troubleshooting

### "Port already in use"
Another process is using the port. Kill it:
```bash
kill -9 $(lsof -t -i:3000)
```

### "Cannot connect to MongoDB"
Check your `backend/.env` has the correct `MONGODB_URI` (currently using MongoDB Atlas).

### "API calls failing"
Make sure backend is running on port 3001:
```bash
curl http://localhost:3001/api/health
```

### Changes not showing
Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

---

## Next Steps

Now you can:
- ✅ Test changes instantly without deployments
- ✅ Debug with full console access
- ✅ Iterate quickly on features
- ✅ Only push to production when ready

Happy coding! 🚀

