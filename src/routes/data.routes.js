import express from 'express';
import DataController from '../controllers/data.controller.js';

const router = express.Router();

/**
 * @route   GET /api/data
 * @desc    Get all scraped data with pagination
 * @query   page?, limit?
 */
router.get('/', DataController.getAllData);

/**
 * @route   GET /api/data/stats
 * @desc    Get scraping statistics
 */
router.get('/stats', DataController.getStatistics);

/**
 * @route   GET /api/data/search
 * @desc    Search scraped data
 * @query   query
 */
router.get('/search', DataController.searchData);

/**
 * @route   GET /api/data/by-url
 * @desc    Get scraped data by URL
 * @query   url
 */
router.get('/by-url', DataController.getDataByUrl);

/**
 * @route   GET /api/data/:id
 * @desc    Get scraped data by ID
 */
router.get('/:id', DataController.getDataById);

/**
 * @route   DELETE /api/data/:id
 * @desc    Delete scraped data
 */
router.delete('/:id', DataController.deleteData);

export default router;
