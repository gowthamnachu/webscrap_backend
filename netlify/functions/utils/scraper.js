import axios from 'axios';
import * as cheerio from 'cheerio';
import validator from 'validator';

// Import services (we'll inline them for serverless)
const validateUrl = (url) => {
  if (!validator.isURL(url, { require_protocol: true })) {
    throw new Error('Invalid URL format');
  }
  return true;
};

const scrapeStatic = async (url, selectors = {}) => {
  validateUrl(url);

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
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        break;
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err;
      if (i === userAgents.length - 1) {
        throw lastError;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!response || response.status !== 200) {
    throw lastError || new Error('Failed to fetch URL');
  }

  const $ = cheerio.load(response.data);
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

  // Extract headings
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

  // Extract paragraphs
  const paragraphs = [];
  $('p, article p, main p, .content p').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 30 && !text.match(/^(cookie|accept|deny|close|menu|nav)/i)) {
      paragraphs.push(text);
    }
  });
  scrapedData.paragraphs = paragraphs.slice(0, 20).map(p => p.substring(0, 800));

  // Calculate word count
  const mainContent = $('article, main, .content, .post-content, .entry-content').first().text().trim();
  if (mainContent) {
    const words = mainContent.split(/\s+/).filter(w => w.length > 0);
    scrapedData.contentStats.wordCount = words.length;
    scrapedData.contentStats.readingTime = Math.ceil(words.length / 200);
  }

  // Extract links
  $('a[href]').each((i, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().trim();
    if (href && href.length > 0 && !href.startsWith('#')) {
      try {
        const linkUrl = new URL(href, url);
        scrapedData.links.push({
          url: linkUrl.href,
          text: text.substring(0, 200),
          external: linkUrl.origin !== new URL(url).origin
        });
      } catch (e) {
        // Skip invalid URLs
      }
    }
  });
  scrapedData.links = scrapedData.links.slice(0, 50);

  // Extract images
  $('img[src]').each((i, elem) => {
    const src = $(elem).attr('src');
    const alt = $(elem).attr('alt') || '';
    if (src) {
      try {
        const imgUrl = new URL(src, url);
        scrapedData.images.push({
          src: imgUrl.href,
          alt: alt.substring(0, 200)
        });
      } catch (e) {
        // Skip invalid URLs
      }
    }
  });
  scrapedData.images = scrapedData.images.slice(0, 20);

  scrapedData.scrapedAt = new Date().toISOString();
  scrapedData.method = 'static';

  return scrapedData;
};

export { scrapeStatic, validateUrl };
