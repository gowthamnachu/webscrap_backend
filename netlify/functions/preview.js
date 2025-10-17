import { scrapeStatic } from './utils/scraper.js';
import { analyzeWithGemini, createFallbackAnalysis } from './utils/ai.js';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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

    let scrapedData;
    try {
      scrapedData = await scrapeStatic(url);
    } catch (scrapeError) {
      const errorDetails = scrapeError.message.includes('403') 
        ? 'This website is blocking automated requests.'
        : 'Unable to access the website.';

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'URL scraped and analyzed successfully (preview mode)',
        data: scrapedData
      })
    };
  } catch (error) {
    console.error('Preview handler error:', error);
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
