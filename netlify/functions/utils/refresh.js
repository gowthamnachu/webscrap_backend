import { scrapeStatic } from './scraper.js';
import { analyzeWithGemini, createFallbackAnalysis } from './ai.js';
import { getSupabaseClient } from './database.js';

/**
 * Re-scrape a URL and update its data in the database
 */
const rescrapeUrl = async (url, analyzeWithAI = true) => {
  console.log(`🔄 Re-scraping: ${url}`);
  
  try {
    // Scrape fresh data
    const scrapedData = await scrapeStatic(url);
    
    // Analyze with AI if requested
    let aiAnalysis = null;
    if (analyzeWithAI) {
      try {
        const fullContent = [
          scrapedData.title,
          scrapedData.description,
          ...scrapedData.paragraphs.slice(0, 10)
        ].join('\n\n');
        
        aiAnalysis = await analyzeWithGemini(fullContent, scrapedData);
      } catch (aiError) {
        console.error('AI analysis failed during re-scrape:', aiError);
        aiAnalysis = createFallbackAnalysis(scrapedData, 'AI analysis unavailable during auto-refresh');
      }
    }
    
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Update existing record(s) with this URL
    const { error: updateError } = await supabase
      .from('scraped_data')
      .update({
        title: scrapedData.title,
        content: {
          ...scrapedData,
          aiAnalysis
        },
        ai_analysis: aiAnalysis,
        scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('url', url)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (updateError) throw updateError;
    
    console.log(`✅ Successfully re-scraped: ${url}`);
    return { success: true, url, timestamp: new Date().toISOString() };
    
  } catch (error) {
    console.error(`❌ Failed to re-scrape ${url}:`, error.message);
    return { success: false, url, error: error.message };
  }
};

/**
 * Get all URLs that need to be refreshed (older than refreshInterval)
 */
const getUrlsToRefresh = async (refreshInterval = 60000) => {
  const supabase = getSupabaseClient();
  
  // Calculate timestamp for refresh threshold
  const refreshThreshold = new Date(Date.now() - refreshInterval);
  
  // Get URLs that were scraped before the threshold
  const { data, error } = await supabase
    .from('scraped_data')
    .select('url, created_at')
    .lt('scraped_at', refreshThreshold.toISOString())
    .order('scraped_at', { ascending: true })
    .limit(10); // Limit to avoid overload
  
  if (error) throw error;
  
  return data || [];
};

/**
 * Refresh stale URLs
 */
const refreshStaleUrls = async (refreshInterval = 60000) => {
  try {
    const urlsToRefresh = await getUrlsToRefresh(refreshInterval);
    
    if (urlsToRefresh.length === 0) {
      console.log('ℹ️ No stale URLs to refresh');
      return { refreshed: 0, failed: 0 };
    }
    
    console.log(`🔄 Refreshing ${urlsToRefresh.length} stale URLs...`);
    
    const results = await Promise.allSettled(
      urlsToRefresh.map(item => rescrapeUrl(item.url, true))
    );
    
    const refreshed = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;
    
    console.log(`✅ Refresh complete: ${refreshed} succeeded, ${failed} failed`);
    
    return { refreshed, failed };
  } catch (error) {
    console.error('Error refreshing stale URLs:', error);
    throw error;
  }
};

export { rescrapeUrl, getUrlsToRefresh, refreshStaleUrls };
