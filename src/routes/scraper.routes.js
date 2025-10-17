import express from 'express';
import ScraperController from '../controllers/scraper.controller.js';

const router = express.Router();

/**
 * @route   POST /api/scraper/scrape
 * @desc    Scrape a URL and save to database
 * @body    { url, method?, selectors? }
 */
router.post('/scrape', ScraperController.scrapeUrl);

/**
 * @route   POST /api/scraper/preview
 * @desc    Scrape a URL without saving (preview mode)
 * @body    { url, method?, selectors? }
 */
router.post('/preview', ScraperController.previewScrape);

/**
 * @route   POST /api/scraper/batch
 * @desc    Scrape multiple URLs
 * @body    { urls: [], method? }
 */
router.post('/batch', ScraperController.batchScrape);

/**
 * @route   POST /api/scraper/schedule
 * @desc    Schedule a recurring scrape
 * @body    { url, schedule }
 */
router.post('/schedule', ScraperController.scheduleScrape);

export default router;
