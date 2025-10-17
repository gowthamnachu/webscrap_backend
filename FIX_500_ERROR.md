# 🚨 URGENT: Fix Netlify 500 Error

## Current Issue
Your Netlify Functions are returning **500 Internal Server Error** because environment variables are missing.

## ✅ Quick Fix Steps

### Step 1: Add Environment Variables to Netlify

1. **Go to Netlify Dashboard:**
   - Open: https://app.netlify.com/sites/backend-17-10-2025/settings/env

2. **Add these 3 environment variables:**

   | Variable Name | Value | Where to Get It |
   |--------------|-------|-----------------|
   | `SUPABASE_URL` | `https://xaurzkcucsoraqoptyrw.supabase.co` | Already known |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Get from Supabase Dashboard |
   | `GEMINI_API_KEY` | `AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM` | Already known |

3. **How to get SUPABASE_ANON_KEY:**
   - Go to: https://supabase.com/dashboard/project/xaurzkcucsoraqoptyrw/settings/api
   - Look for **Project API keys** section
   - Copy the **anon public** key (starts with `eyJhbG...`)

### Step 2: Redeploy After Adding Variables

1. Go to: https://app.netlify.com/sites/backend-17-10-2025/deploys
2. Click **"Trigger deploy"** button
3. Select **"Clear cache and deploy site"**
4. Wait 1-2 minutes for deployment

### Step 3: Test Your Functions

After redeployment, run this command from the backend folder:

```powershell
.\test-netlify.ps1
```

Or test manually in your browser:
- Frontend: http://localhost:5174
- Try scraping: https://example.com

---

## 🔍 Detailed Instructions

### Getting Your Supabase Anon Key

1. **Login to Supabase:**
   - Go to: https://supabase.com/dashboard

2. **Select Your Project:**
   - Project: `xaurzkcucsoraqoptyrw`

3. **Navigate to Settings:**
   - Left sidebar → ⚙️ **Project Settings**
   - Click **API** section

4. **Copy the Anon Key:**
   - Under **Project API keys**
   - Look for `anon` `public` key
   - Click the **Copy** button
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXJ6a2N1Y3NvcmFxb3B0eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk3NDkyMDAsImV4cCI6MjAwNTMyNTIwMH0...`

### Adding Environment Variables in Netlify

1. **Navigate to Site Settings:**
   - https://app.netlify.com/sites/backend-17-10-2025/settings/env

2. **Click "Add a variable"**

3. **Add First Variable:**
   - **Key:** `SUPABASE_URL`
   - **Values → Production:** `https://xaurzkcucsoraqoptyrw.supabase.co`
   - Click **"Create variable"**

4. **Add Second Variable:**
   - **Key:** `SUPABASE_ANON_KEY`
   - **Values → Production:** `[paste your anon key here]`
   - Click **"Create variable"**

5. **Add Third Variable:**
   - **Key:** `GEMINI_API_KEY`
   - **Values → Production:** `AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM`
   - Click **"Create variable"**

### Triggering a Redeploy

**Important:** Environment variables only take effect after a new deployment!

1. **Go to Deploys Tab:**
   - https://app.netlify.com/sites/backend-17-10-2025/deploys

2. **Trigger Deploy:**
   - Click the **"Trigger deploy"** dropdown button
   - Select **"Clear cache and deploy site"**

3. **Wait for Build:**
   - Watch the build log (takes 1-2 minutes)
   - Look for **"Published"** status

4. **Verify Success:**
   - Build should show: ✅ **Published**
   - No error messages in logs

---

## 🧪 Testing After Fix

### Option 1: Use PowerShell Script

```powershell
cd c:\Users\gowth\Desktop\deploython\web_scarp\backend
.\test-netlify.ps1
```

### Option 2: Test in Frontend

1. Make sure frontend is running:
   ```powershell
   cd c:\Users\gowth\Desktop\deploython\web_scarp\frontend
   npm run dev
   ```

2. Open: http://localhost:5174

3. Try scraping:
   - URL: `https://example.com`
   - Enable AI Analysis: ✅
   - Click **Scrape**

### Option 3: Test with cURL/Postman

```bash
# Test scrape endpoint
curl -X POST https://backend-17-10-2025.netlify.app/.netlify/functions/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","analyzeWithAI":true}'
```

---

## 📋 Expected Results After Fix

### ✅ Success Indicators:

1. **Netlify Function Returns 200/201:**
   - No more 500 errors
   - JSON response with scraped data

2. **Frontend Works:**
   - Can submit scrape requests
   - Displays scraped data and AI analysis
   - No console errors

3. **Test Script Shows:**
   ```
   ✅ Scrape endpoint working!
   ✅ Preview endpoint working!
   ✅ Data endpoint working!
   ```

---

## 🚨 Still Getting Errors?

### Check Netlify Function Logs

1. Go to: https://app.netlify.com/sites/backend-17-10-2025/functions
2. Click on **scrape** function
3. Click **"View logs"**
4. Look for error messages

### Common Issues:

| Error | Cause | Solution |
|-------|-------|----------|
| `SUPABASE_URL is not defined` | Env var not set | Add SUPABASE_URL in Netlify settings |
| `Invalid API key` | Wrong Gemini key | Check GEMINI_API_KEY value |
| `Cannot connect to Supabase` | Wrong anon key | Verify SUPABASE_ANON_KEY |
| `Function timeout` | Scraping taking too long | Use preview mode for testing |

### Need More Help?

Check these logs:
1. **Netlify Function Logs:** https://app.netlify.com/sites/backend-17-10-2025/logs
2. **Netlify Build Logs:** https://app.netlify.com/sites/backend-17-10-2025/deploys
3. **Browser Console:** Press F12 → Console tab
4. **Network Tab:** Press F12 → Network tab → Look for failed requests

---

## 📝 Quick Reference

**Your Netlify Site:** https://backend-17-10-2025.netlify.app

**API Endpoints:**
- Scrape: `POST /.netlify/functions/scrape`
- Preview: `POST /.netlify/functions/preview`
- Data: `GET /.netlify/functions/data`

**Dashboard Links:**
- Site Overview: https://app.netlify.com/sites/backend-17-10-2025
- Environment Variables: https://app.netlify.com/sites/backend-17-10-2025/settings/env
- Function Logs: https://app.netlify.com/sites/backend-17-10-2025/functions
- Deploys: https://app.netlify.com/sites/backend-17-10-2025/deploys

**Supabase Dashboard:**
- Project: https://supabase.com/dashboard/project/xaurzkcucsoraqoptyrw
- API Settings: https://supabase.com/dashboard/project/xaurzkcucsoraqoptyrw/settings/api

---

**⚡ TL;DR:**
1. Add 3 environment variables in Netlify
2. Redeploy the site
3. Test with `.\test-netlify.ps1`
4. Frontend should work! 🎉
