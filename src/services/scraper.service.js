import axios from 'axios';
import * as cheerio from 'cheerio';
import validator from 'validator';

class ScraperService {
  /**
   * Validate URL
   */
  static validateUrl(url) {
    if (!validator.isURL(url, { require_protocol: true })) {
      throw new Error('Invalid URL format');
    }
    return true;
  }

  /**
   * Scrape static content using Cheerio (fast & professional)
   */
  static async scrapeStatic(url, selectors = {}) {
    try {
      this.validateUrl(url);

      // Try multiple user agents if blocked
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
      ];

      let response;
      let lastError;

      for (let i = 0; i < userAgents.length; i++) {
        try {
          response = await axios.get(url, {
            headers: {
              'User-Agent': userAgents[i],
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Cache-Control': 'max-age=0',
              'Referer': 'https://www.google.com/'
            },
            timeout: 20000,
            maxRedirects: 5,
            validateStatus: (status) => status < 500 // Accept 4xx errors to handle them
          });

          if (response.status === 200) {
            break; // Success!
          }
          
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
          lastError = err;
          if (i === userAgents.length - 1) {
            throw lastError; // Last attempt failed
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!response || response.status !== 200) {
        throw lastError || new Error('Failed to fetch URL');
      }

      const $ = cheerio.load(response.data);
      
      // Remove script and style tags for cleaner content
      $('script, style, noscript, iframe').remove();
      
      const scrapedData = {
        url,
        title: $('title').text().trim() || $('h1').first().text().trim() || 'No title',
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || 
                    $('p').first().text().trim().substring(0, 200) || '',
        headings: [],
        paragraphs: [],
        links: [],
        images: [],
        metadata: {
          author: $('meta[name="author"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || '',
          og_title: $('meta[property="og:title"]').attr('content') || '',
          og_description: $('meta[property="og:description"]').attr('content') || '',
          og_image: $('meta[property="og:image"]').attr('content') || '',
          og_type: $('meta[property="og:type"]').attr('content') || '',
          og_url: $('meta[property="og:url"]').attr('content') || '',
          twitter_card: $('meta[name="twitter:card"]').attr('content') || '',
          twitter_title: $('meta[name="twitter:title"]').attr('content') || '',
          canonical: $('link[rel="canonical"]').attr('href') || '',
          language: $('html').attr('lang') || 'en'
        },
        contentStats: {
          wordCount: 0,
          readingTime: 0,
          hasVideo: $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0,
          hasAudio: $('audio').length > 0,
          hasForm: $('form').length > 0
        }
      };

      // Extract all headings with hierarchy
      $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 2) {
          scrapedData.headings.push({
            level: parseInt(elem.tagName.substring(1)),
            tag: elem.tagName,
            text: text.substring(0, 300)
          });
        }
      });

      // Extract paragraphs with better filtering
      const paragraphs = [];
      $('p, article p, main p, .content p').each((i, elem) => {
        const text = $(elem).text().trim();
        // Filter out very short paragraphs and navigation text
        if (text && text.length > 30 && !text.match(/^(cookie|accept|deny|close|menu|nav)/i)) {
          paragraphs.push(text);
        }
      });
      scrapedData.paragraphs = paragraphs.slice(0, 20).map(p => p.substring(0, 800));

      // Extract main content/article text
      const mainContent = $('article, main, .content, .post-content, .entry-content').first().text().trim();
      if (mainContent) {
        const words = mainContent.split(/\s+/).filter(w => w.length > 0);
        scrapedData.contentStats.wordCount = words.length;
        scrapedData.contentStats.readingTime = Math.ceil(words.length / 200); // 200 words per minute
      }

      // Extract links with better filtering
      const uniqueLinks = new Set();
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && text) {
          const fullUrl = new URL(href, url).href;
          if (!uniqueLinks.has(fullUrl) && uniqueLinks.size < 50) {
            uniqueLinks.add(fullUrl);
            scrapedData.links.push({
              url: fullUrl,
              text: text.substring(0, 150),
              isExternal: !fullUrl.includes(new URL(url).hostname)
            });
          }
        }
      });

      // Extract images with better quality filtering
      const uniqueImages = new Set();
      $('img[src], picture img, figure img').each((i, elem) => {
        const src = $(elem).attr('src');
        const alt = $(elem).attr('alt') || '';
        const width = $(elem).attr('width');
        const height = $(elem).attr('height');
        
        if (src && !src.endsWith('.svg') && !src.includes('data:image')) {
          const fullSrc = new URL(src, url).href;
          if (!uniqueImages.has(fullSrc) && uniqueImages.size < 30) {
            uniqueImages.add(fullSrc);
            scrapedData.images.push({
              src: fullSrc,
              alt: alt.substring(0, 250),
              width: width || null,
              height: height || null
            });
          }
        }
      });

      // Custom selectors if provided
      if (selectors && Object.keys(selectors).length > 0) {
        scrapedData.custom = {};
        for (const [key, selector] of Object.entries(selectors)) {
          scrapedData.custom[key] = $(selector).text().trim();
        }
      }

      scrapedData.scrapedAt = new Date().toISOString();
      scrapedData.method = 'static';
      
      return scrapedData;
    } catch (error) {
      throw new Error(`Static scraping failed: ${error.message}`);
    }
  }

  /**
   * Scrape dynamic content (fallback to static scraping)
   * Note: Puppeteer removed to avoid dependency issues
   */
  static async scrapeDynamic(url) {
    try {
      console.log('Dynamic scraping requested but using static method (Puppeteer removed)');
      const data = await this.scrapeStatic(url);
      data.method = 'static-fallback';
      return data;
    } catch (error) {
      throw new Error(`Dynamic scraping failed: ${error.message}`);
    }
  }

  /**
   * Auto-detect and scrape (tries static first, falls back to dynamic)
   */
  static async scrapeAuto(url, selectors = {}) {
    try {
      // Try static first (faster)
      return await this.scrapeStatic(url, selectors);
    } catch (error) {
      console.log('Static scraping failed, trying dynamic scraping...');
      // Fall back to dynamic
      return await this.scrapeDynamic(url);
    }
  }
}

export default ScraperService;
