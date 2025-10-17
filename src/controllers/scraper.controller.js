import ScraperService from '../services/scraper.service.js';
import DatabaseService from '../services/database.service.js';
import AIService from '../services/ai.service.js';

class ScraperController {
  /**
   * Scrape a URL and save to database
   */
  static async scrapeUrl(req, res, next) {
    try {
      const { url, method = 'auto', selectors = {}, analyzeWithAI = true, customPrompt } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      let scrapedData;
      let scrapingError = null;

      // Try scraping with fallback methods
      try {
        switch (method) {
          case 'static':
            scrapedData = await ScraperService.scrapeStatic(url, selectors);
            break;
          case 'dynamic':
            scrapedData = await ScraperService.scrapeDynamic(url);
            break;
          default:
            scrapedData = await ScraperService.scrapeAuto(url, selectors);
        }
      } catch (scrapeError) {
        scrapingError = scrapeError;
        console.error('Scraping failed:', scrapeError.message);
        
        // Return helpful error message
        return res.status(400).json({
          success: false,
          message: 'Failed to scrape URL',
          error: scrapeError.message,
          details: scrapeError.message.includes('403') 
            ? 'This website is blocking automated requests. Try a different URL or contact the site owner.'
            : scrapeError.message.includes('ENOTFOUND') || scrapeError.message.includes('ECONNREFUSED')
            ? 'Cannot reach the website. Check if the URL is correct and the site is online.'
            : 'Unable to access the website. Please try again or use a different URL.'
        });
      }

      // Analyze content with AI (with optional custom prompt)
      if (analyzeWithAI) {
        try {
          const aiAnalysis = await AIService.analyzeContent(scrapedData, customPrompt);
          scrapedData.aiAnalysis = aiAnalysis;
          scrapedData.customPromptUsed = customPrompt ? true : false;
        } catch (aiError) {
          console.error('AI analysis failed:', aiError.message);
          // Use basic analysis as fallback - don't fail the entire request
          scrapedData.aiAnalysis = AIService.analyzeWithoutAI(scrapedData);
          scrapedData.aiAnalysisNote = 'AI analysis unavailable - using basic analysis';
        }
      }

      // Save to database
      const savedData = await DatabaseService.saveScrapedData(scrapedData);

      res.status(201).json({
        success: true,
        message: 'URL scraped and analyzed successfully',
        data: savedData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Scrape URL without saving (preview mode)
   */
  static async previewScrape(req, res, next) {
    try {
      const { url, method = 'auto', selectors = {}, analyzeWithAI = true, customPrompt } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      let scrapedData;

      // Try scraping with fallback methods
      try {
        switch (method) {
          case 'static':
            scrapedData = await ScraperService.scrapeStatic(url, selectors);
            break;
          case 'dynamic':
            scrapedData = await ScraperService.scrapeDynamic(url);
            break;
          default:
            scrapedData = await ScraperService.scrapeAuto(url, selectors);
        }
      } catch (scrapeError) {
        console.error('Scraping failed:', scrapeError.message);
        
        // Return helpful error message
        return res.status(400).json({
          success: false,
          message: 'Failed to scrape URL',
          error: scrapeError.message,
          details: scrapeError.message.includes('403') 
            ? 'This website is blocking automated requests. Try a different URL or contact the site owner.'
            : scrapeError.message.includes('ENOTFOUND') || scrapeError.message.includes('ECONNREFUSED')
            ? 'Cannot reach the website. Check if the URL is correct and the site is online.'
            : 'Unable to access the website. Please try again or use a different URL.'
        });
      }

      // Analyze content with AI (with optional custom prompt)
      if (analyzeWithAI) {
        try {
          const aiAnalysis = await AIService.analyzeContent(scrapedData, customPrompt);
          scrapedData.aiAnalysis = aiAnalysis;
          scrapedData.customPromptUsed = customPrompt ? true : false;
        } catch (aiError) {
          console.error('AI analysis failed:', aiError.message);
          // Use basic analysis as fallback - don't fail the entire request
          scrapedData.aiAnalysis = AIService.analyzeWithoutAI(scrapedData);
          scrapedData.aiAnalysisNote = 'AI analysis unavailable - using basic analysis';
        }
      }

      res.status(200).json({
        success: true,
        message: 'URL scraped and analyzed successfully (preview mode)',
        data: scrapedData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch scrape multiple URLs
   */
  static async batchScrape(req, res, next) {
    try {
      const { urls, method = 'auto' } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'URLs array is required'
        });
      }

      if (urls.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 URLs allowed per batch'
        });
      }

      const results = [];
      const errors = [];

      for (const url of urls) {
        try {
          let scrapedData;
          if (method === 'static') {
            scrapedData = await ScraperService.scrapeStatic(url);
          } else if (method === 'dynamic') {
            scrapedData = await ScraperService.scrapeDynamic(url);
          } else {
            scrapedData = await ScraperService.scrapeAuto(url);
          }

          const savedData = await DatabaseService.saveScrapedData(scrapedData);
          results.push(savedData);
        } catch (error) {
          errors.push({ url, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: `Batch scraping completed. ${results.length} succeeded, ${errors.length} failed.`,
        data: {
          succeeded: results,
          failed: errors
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Schedule a recurring scrape
   */
  static async scheduleScrape(req, res, next) {
    try {
      const { url, schedule } = req.body;

      if (!url || !schedule) {
        return res.status(400).json({
          success: false,
          message: 'URL and schedule are required'
        });
      }

      const savedSchedule = await DatabaseService.saveScheduledScrape(url, schedule);

      res.status(201).json({
        success: true,
        message: 'Scrape scheduled successfully',
        data: savedSchedule
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ScraperController;
