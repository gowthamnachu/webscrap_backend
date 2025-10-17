# 📋 Netlify Deployment Checklist

## Pre-Deployment
- [ ] All environment variables ready
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `GEMINI_API_KEY`
- [ ] Supabase database tables created
- [ ] Code tested locally
- [ ] Git repository ready

## Deployment Steps
- [ ] Push backend code to GitHub
- [ ] Create new site on Netlify
- [ ] Connect GitHub repository
- [ ] Set base directory to `backend`
- [ ] Add environment variables in Netlify
- [ ] Deploy site
- [ ] Copy deployed URL

## Post-Deployment
- [ ] Test scrape endpoint
- [ ] Test preview endpoint
- [ ] Test data endpoint
- [ ] Verify AI analysis works
- [ ] Check Supabase database for saved data
- [ ] Update frontend API URL
- [ ] Test full application flow

## Verification Tests

### 1. Test Scrape Function
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","analyzeWithAI":true}'
```
**Expected**: 201 status, data saved to Supabase

### 2. Test Preview Function
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/preview \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","analyzeWithAI":true}'
```
**Expected**: 200 status, data returned (not saved)

### 3. Test Data Function
```bash
curl https://YOUR_SITE.netlify.app/.netlify/functions/data?page=1&limit=5
```
**Expected**: 200 status, array of scraped data

### 4. Test AI Analysis
- [ ] Check response includes `aiAnalysis` object
- [ ] Verify `summary` field exists
- [ ] Verify `keyPoints` array exists
- [ ] Check scores (contentQuality, credibility, etc.)
- [ ] Verify `provider: 'gemini'` and `model: 'gemini-2.0-flash'`

### 5. Test Error Handling
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"invalid-url","analyzeWithAI":true}'
```
**Expected**: 400 status, helpful error message

## Common Issues & Solutions

### Issue: 404 on functions
**Solution**: 
- Verify `netlify.toml` is in backend root
- Check `functions = "netlify/functions"` in config
- Ensure functions are in correct directory

### Issue: Environment variables not working
**Solution**:
- Add vars in Netlify UI (not .env file)
- Redeploy after adding vars
- Verify var names match exactly

### Issue: Function timeout
**Solution**:
- Free tier: 10s timeout
- Optimize scraping speed
- Upgrade to Pro for 26s timeout

### Issue: AI analysis fails
**Solution**:
- Verify `GEMINI_API_KEY` is set correctly
- Check Gemini API quota (60 req/min)
- Fallback analysis should work automatically

### Issue: Database errors
**Solution**:
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check Supabase tables exist
- Verify table schema matches

## Monitoring

### Netlify Dashboard
- [ ] Check function logs
- [ ] Monitor request count
- [ ] Track error rate
- [ ] Review build logs

### Supabase Dashboard
- [ ] Verify data is being saved
- [ ] Check table row count
- [ ] Monitor database size
- [ ] Review query performance

### AI Usage
- [ ] Monitor Gemini API usage
- [ ] Track daily request count
- [ ] Stay within quota limits

## Success Criteria

✅ All three endpoints respond successfully
✅ AI analysis returns comprehensive data
✅ Data is saved to Supabase correctly
✅ Error handling works as expected
✅ Frontend can connect to deployed backend
✅ No CORS errors
✅ Response times under 10 seconds

## 🎉 Deployment Complete!

Your backend is now live and ready for production use!

**Next**: Deploy frontend to Netlify/Vercel and update API URL.
