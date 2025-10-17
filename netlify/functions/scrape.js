import { scrapeStatic } from './utils/scraper.js';
import { analyzeWithGemini, createFallbackAnalysis } from './utils/ai.js';
import { saveScrapedData } from './utils/database.js';

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { url, method = 'auto', analyzeWithAI = true, customPrompt } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'URL is required' })
      };
    }

    // Scrape the URL
    let scrapedData;
    try {
      scrapedData = await scrapeStatic(url);
    } catch (scrapeError) {
      console.error('Scraping failed:', scrapeError.message);
      
      const errorDetails = scrapeError.message.includes('403') 
        ? 'This website is blocking automated requests. Try a different URL or contact the site owner.'
        : scrapeError.message.includes('ENOTFOUND') || scrapeError.message.includes('ECONNREFUSED')
        ? 'Cannot reach the website. Check if the URL is correct and the site is online.'
        : 'Unable to access the website. Please try again or use a different URL.';

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Failed to scrape URL',
          error: scrapeError.message,
          details: errorDetails
        })
      };
    }

    // Analyze with AI
    if (analyzeWithAI) {
      try {
        const aiAnalysis = await analyzeWithGemini('', scrapedData, customPrompt);
        scrapedData.aiAnalysis = aiAnalysis;
        scrapedData.customPromptUsed = customPrompt ? true : false;
      } catch (aiError) {
        console.error('AI analysis failed:', aiError.message);
        scrapedData.aiAnalysis = createFallbackAnalysis(scrapedData);
        scrapedData.aiAnalysisNote = 'AI analysis unavailable - using basic analysis';
      }
    }

    // Save to database
    const savedData = await saveScrapedData(scrapedData);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'URL scraped and analyzed successfully',
        data: savedData
      })
    };
  } catch (error) {
    console.error('Scrape handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      })
    };
  }
};
