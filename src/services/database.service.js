import { supabase, TABLES } from '../config/supabase.js';

class DatabaseService {
  /**
   * Save scraped data to Supabase
   */
  static async saveScrapedData(data) {
    try {
      const { data: result, error } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .insert([{
          url: data.url,
          title: data.title,
          content: data,
          ai_analysis: data.aiAnalysis || null,
          scraped_at: data.scrapedAt || new Date().toISOString(),
          method: data.method || 'auto'
        }])
        .select();

      if (error) throw error;
      return result[0];
    } catch (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }
  }

  /**
   * Get all scraped data with pagination
   */
  static async getAllData(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
  }

  /**
   * Get scraped data by ID
   */
  static async getDataById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
  }

  /**
   * Get scraped data by URL
   */
  static async getDataByUrl(url) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('*')
        .eq('url', url)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
  }

  /**
   * Search scraped data
   */
  static async searchData(query) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('*')
        .or(`title.ilike.%${query}%,url.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Database search failed: ${error.message}`);
    }
  }

  /**
   * Delete scraped data by ID
   */
  static async deleteData(id) {
    try {
      const { error } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Data deleted successfully' };
    } catch (error) {
      throw new Error(`Database delete failed: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  static async getStatistics() {
    try {
      const { count: totalScraped } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('*', { count: 'exact', head: true });

      const { data: recentData } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: uniqueUrls } = await supabase
        .from(TABLES.SCRAPED_DATA)
        .select('url');

      const uniqueCount = new Set(uniqueUrls?.map(item => item.url)).size;

      return {
        totalScraped: totalScraped || 0,
        uniqueUrls: uniqueCount,
        lastScraped: recentData?.[0]?.created_at || null
      };
    } catch (error) {
      throw new Error(`Statistics fetch failed: ${error.message}`);
    }
  }

  /**
   * Save scheduled scrape job
   */
  static async saveScheduledScrape(url, schedule) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SCHEDULED_SCRAPES)
        .insert([{
          url,
          schedule,
          is_active: true
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Failed to save scheduled scrape: ${error.message}`);
    }
  }

  /**
   * Get all active scheduled scrapes
   */
  static async getActiveScheduledScrapes() {
    try {
      const { data, error } = await supabase
        .from(TABLES.SCHEDULED_SCRAPES)
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch scheduled scrapes: ${error.message}`);
    }
  }
}

export default DatabaseService;
