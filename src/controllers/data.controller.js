import DatabaseService from '../services/database.service.js';

class DataController {
  /**
   * Get all scraped data with pagination
   */
  static async getAllData(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await DatabaseService.getAllData(page, limit);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get scraped data by ID
   */
  static async getDataById(req, res, next) {
    try {
      const { id } = req.params;

      const data = await DatabaseService.getDataById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Data not found'
        });
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get scraped data by URL
   */
  static async getDataByUrl(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }

      const data = await DatabaseService.getDataByUrl(url);

      res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search scraped data
   */
  static async searchData(req, res, next) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const data = await DatabaseService.searchData(query);

      res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete scraped data
   */
  static async deleteData(req, res, next) {
    try {
      const { id } = req.params;

      const result = await DatabaseService.deleteData(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const stats = await DatabaseService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DataController;
