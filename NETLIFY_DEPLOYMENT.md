# 🚀 Netlify Deployment Guide

## Backend Deployment to Netlify Functions

### Prerequisites
- Netlify account (free tier works!)
- GitHub/GitLab/Bitbucket account (or Netlify CLI)

### Deployment Steps

#### Method 1: Netlify UI (Recommended)

1. **Push to Git Repository**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit for Netlify deployment"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository
   - Select the `backend` folder as base directory

3. **Configure Build Settings**
   - **Base directory**: `backend`
   - **Build command**: `npm install`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**
   Go to Site settings → Environment variables and add:
   ```
   SUPABASE_URL=https://xaurzkcucsoraqoptyrw.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Your functions will be at: `https://your-site.netlify.app/.netlify/functions/`

#### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd backend
   netlify init
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set SUPABASE_URL "https://xaurzkcucsoraqoptyrw.supabase.co"
   netlify env:set SUPABASE_ANON_KEY "your_key"
   netlify env:set GEMINI_API_KEY "AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### API Endpoints

After deployment, your endpoints will be:

- **Scrape URL (save to DB)**: `POST https://your-site.netlify.app/.netlify/functions/scrape`
- **Preview Scrape**: `POST https://your-site.netlify.app/.netlify/functions/preview`
- **Get All Data**: `GET https://your-site.netlify.app/.netlify/functions/data`
- **Get Single Data**: `GET https://your-site.netlify.app/.netlify/functions/data?id=123`

### Update Frontend API URL

In `frontend/src/services/api.js`, update:

```javascript
const API_URL = 'https://your-site.netlify.app/.netlify/functions';
```

Or use environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

Then in `frontend/.env`:
```
VITE_API_URL=https://your-site.netlify.app/.netlify/functions
```

### Testing Deployed Functions

```bash
# Test scrape endpoint
curl -X POST https://your-site.netlify.app/.netlify/functions/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","analyzeWithAI":true}'

# Test data endpoint
curl https://your-site.netlify.app/.netlify/functions/data?page=1&limit=10
```

### Troubleshooting

1. **Function timeout**: Netlify free tier has 10s timeout. Consider:
   - Upgrading to Pro ($19/mo) for 26s timeout
   - Optimizing scraping speed
   - Using preview mode for faster response

2. **Build errors**: Check build logs in Netlify dashboard

3. **Environment variables**: Ensure all vars are set in Netlify UI

4. **CORS errors**: Already handled in function headers

### Monitoring

- View logs: Netlify dashboard → Functions → Select function
- Real-time logs: `netlify dev` for local testing
- Production logs: Netlify dashboard → Deploys → Function logs

### Cost Estimate (Free Tier)

- **125k requests/month** - FREE
- **100 hours runtime/month** - FREE
- Beyond that: $25 per 1M requests

Perfect for testing and small-scale production! 🎉
