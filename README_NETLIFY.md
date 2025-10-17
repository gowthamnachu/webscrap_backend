# 🌐 Web Scraper Backend - Netlify Functions

AI-powered web scraping backend deployed on Netlify Functions with Gemini 2.0 Flash AI.

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

### Environment Variables Required

Set these in Netlify dashboard (Site settings → Environment variables):

```
SUPABASE_URL=https://xaurzkcucsoraqoptyrw.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM
```

## 📁 Project Structure

```
backend/
├── netlify/
│   └── functions/
│       ├── scrape.js       # Main scraping endpoint
│       ├── preview.js      # Preview mode
│       ├── data.js         # Get scraped data
│       └── utils/
│           ├── scraper.js  # Scraping logic
│           ├── ai.js       # AI analysis
│           └── database.js # Supabase integration
├── netlify.toml           # Netlify config
├── package.json
└── NETLIFY_DEPLOYMENT.md  # Detailed deployment guide
```

## 🔧 API Endpoints

### POST /.netlify/functions/scrape
Scrape URL and save to database with AI analysis

**Request:**
```json
{
  "url": "https://example.com",
  "analyzeWithAI": true,
  "customPrompt": "Analyze this website..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "URL scraped and analyzed successfully",
  "data": { /* scraped data with AI analysis */ }
}
```

### POST /.netlify/functions/preview
Scrape URL without saving (preview mode)

**Request:** Same as scrape
**Response:** Scraped data without saving to DB

### GET /.netlify/functions/data
Get all scraped data with pagination

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `id` (optional: get single item)

**Response:**
```json
{
  "success": true,
  "data": [ /* array of scraped data */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🎨 Features

✅ **Web Scraping**
- Multi-user-agent rotation
- Retry mechanism for 403 errors
- Comprehensive metadata extraction
- Image, link, and content parsing

✅ **AI Analysis (Gemini 2.0 Flash)**
- 36+ analysis fields
- SEO optimization score
- Content quality rating
- Monetization potential
- Virality score
- Custom prompt support

✅ **Database (Supabase)**
- PostgreSQL storage
- Automatic timestamps
- Full JSON storage
- Query support

✅ **Serverless Architecture**
- Auto-scaling
- Pay-per-use
- Global CDN
- No server management

## 💻 Local Development

```bash
# Install dependencies
npm install

# Install Netlify CLI
npm install -g netlify-cli

# Run locally
netlify dev

# Your functions will be at:
# http://localhost:8888/.netlify/functions/scrape
# http://localhost:8888/.netlify/functions/preview
# http://localhost:8888/.netlify/functions/data
```

## 📊 Free Tier Limits

- **125,000 requests/month** - FREE
- **100 hours runtime/month** - FREE
- **10 second timeout** per function

Need more? Upgrade to Pro ($19/mo) for 26s timeout and unlimited runtime.

## 🔐 Security

- Environment variables secured in Netlify
- CORS headers configured
- Input validation
- Rate limiting ready
- No API keys in code

## 📈 Monitoring

View logs and metrics in Netlify dashboard:
- Real-time function logs
- Request count
- Error tracking
- Performance metrics

## 🆘 Support

See `NETLIFY_DEPLOYMENT.md` for detailed deployment guide and troubleshooting.

---

**Made with ❤️ using Netlify Functions + Gemini AI + Supabase**
