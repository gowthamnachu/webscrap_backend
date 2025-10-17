import cron from 'node-cron';
import ScraperService from '../services/scraper.service.js';
import DatabaseService from '../services/database.service.js';

/**
 * Start all cron jobs
 */
export const startCronJobs = () => {
  // Run scheduled scrapes every 6 hours by default
  const schedule = process.env.CRON_SCHEDULE || '0 */6 * * *';
  
  cron.schedule(schedule, async () => {
    console.log('🕐 Running scheduled scrapes...');
    
    try {
      const scheduledScrapes = await DatabaseService.getActiveScheduledScrapes();
      
      if (!scheduledScrapes || scheduledScrapes.length === 0) {
        console.log('No scheduled scrapes found');
        return;
      }

      for (const scrape of scheduledScrapes) {
        try {
          console.log(`Scraping: ${scrape.url}`);
          const scrapedData = await ScraperService.scrapeAuto(scrape.url);
          await DatabaseService.saveScrapedData(scrapedData);
          console.log(`✅ Successfully scraped: ${scrape.url}`);
        } catch (error) {
          console.error(`❌ Failed to scrape ${scrape.url}:`, error.message);
        }
      }
      
      console.log('✅ Scheduled scrapes completed');
    } catch (error) {
      console.error('❌ Cron job error:', error.message);
    }
  });

  console.log(`⏰ Cron job scheduled with pattern: ${schedule}`);
};

/**
 * Example: Custom cron job to clean old data (runs daily at midnight)
 */
export const startCleanupJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 Running cleanup job...');
    
    try {
      // Add cleanup logic here
      // e.g., delete data older than 30 days
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  });
};
