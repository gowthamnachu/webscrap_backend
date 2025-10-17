import axios from 'axios';

/**
 * AI Service for analyzing scraped content
 * Supports multiple AI providers: OpenAI, Google Gemini, Hugging Face (Free)
 */
class AIService {
  
  /**
   * Analyze scraped content using configured AI provider
   */
  static async analyzeContent(scrapedData, customPrompt = null) {
    const provider = process.env.AI_PROVIDER || 'gemini'; // default to Gemini (free)
    
    // Prepare content for analysis
    const contentText = this.prepareContentForAnalysis(scrapedData);
    
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          return await this.analyzeWithOpenAI(contentText, scrapedData, customPrompt);
        case 'gemini':
          return await this.analyzeWithGemini(contentText, scrapedData, customPrompt);
        case 'huggingface':
          return await this.analyzeWithHuggingFace(contentText, scrapedData, customPrompt);
        default:
          return await this.analyzeWithGemini(contentText, scrapedData, customPrompt);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error.message);
      return {
        error: true,
        message: 'AI analysis unavailable',
        summary: 'AI analysis could not be completed',
        keyPoints: [],
        category: 'unknown',
        sentiment: 'neutral'
      };
    }
  }

  /**
   * Prepare scraped content for AI analysis (enhanced)
   */
  static prepareContentForAnalysis(scrapedData) {
    const parts = [];
    
    // Title and URL
    if (scrapedData.title) {
      parts.push(`Title: ${scrapedData.title}`);
    }
    if (scrapedData.url) {
      parts.push(`URL: ${scrapedData.url}`);
    }
    
    // Description
    if (scrapedData.description) {
      parts.push(`Description: ${scrapedData.description}`);
    }
    
    // Metadata
    if (scrapedData.metadata) {
      if (scrapedData.metadata.author) {
        parts.push(`Author: ${scrapedData.metadata.author}`);
      }
      if (scrapedData.metadata.keywords) {
        parts.push(`Keywords: ${scrapedData.metadata.keywords}`);
      }
      if (scrapedData.metadata.og_type) {
        parts.push(`Type: ${scrapedData.metadata.og_type}`);
      }
    }
    
    // Content Stats
    if (scrapedData.contentStats) {
      const stats = [];
      if (scrapedData.contentStats.wordCount) {
        stats.push(`${scrapedData.contentStats.wordCount} words`);
      }
      if (scrapedData.contentStats.readingTime) {
        stats.push(`${scrapedData.contentStats.readingTime} min read`);
      }
      if (scrapedData.contentStats.hasVideo) {
        stats.push('contains video');
      }
      if (scrapedData.contentStats.hasForm) {
        stats.push('has forms');
      }
      if (stats.length > 0) {
        parts.push(`Stats: ${stats.join(', ')}`);
      }
    }
    
    // Main headings (hierarchy aware)
    if (scrapedData.headings && scrapedData.headings.length > 0) {
      const h1s = scrapedData.headings.filter(h => h.level === 1).map(h => h.text);
      const h2s = scrapedData.headings.filter(h => h.level === 2).map(h => h.text).slice(0, 5);
      
      if (h1s.length > 0) {
        parts.push(`Main Heading: ${h1s.join(', ')}`);
      }
      if (h2s.length > 0) {
        parts.push(`Subheadings: ${h2s.join(', ')}`);
      }
    }
    
    // Main content (first few paragraphs)
    if (scrapedData.paragraphs && scrapedData.paragraphs.length > 0) {
      const mainContent = scrapedData.paragraphs.slice(0, 5).join(' ').substring(0, 3000);
      parts.push(`Main Content:\n${mainContent}`);
    }
    
    // Image context
    if (scrapedData.images && scrapedData.images.length > 0) {
      const imageAlts = scrapedData.images
        .filter(img => img.alt)
        .slice(0, 5)
        .map(img => img.alt);
      if (imageAlts.length > 0) {
        parts.push(`Image descriptions: ${imageAlts.join(', ')}`);
      }
    }
    
    return parts.join('\n\n');
  }

  /**
   * Analyze with OpenAI GPT (Paid - requires API key)
   */
  static async analyzeWithOpenAI(content, scrapedData) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this web page content and provide:
1. A concise summary (2-3 sentences)
2. 5 key points or main topics
3. Category (news, blog, documentation, e-commerce, social, educational, entertainment, business, technology, other)
4. Sentiment (positive, negative, neutral, mixed)
5. Main purpose of the page

Content:
${content}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "...", "..."],
  "category": "...",
  "sentiment": "...",
  "purpose": "...",
  "topics": ["...", "..."]
}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a web content analyzer. Provide concise, accurate analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = JSON.parse(response.data.choices[0].message.content);
    return {
      ...analysis,
      provider: 'openai',
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze with Google Gemini (Free tier available) - Enhanced Professional Analysis
   */
  static async analyzeWithGemini(content, scrapedData, customPrompt = null) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      throw new Error('Gemini API key not configured');
    }
    
    console.log('🤖 Using Gemini API key:', apiKey.substring(0, 20) + '...');

    // Use custom prompt if provided, otherwise use default comprehensive prompt
    let prompt;
    
    if (customPrompt && customPrompt.trim()) {
      // User provided custom prompt - use it directly with the content
      prompt = `${customPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 WEBPAGE CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Respond with valid JSON format containing your analysis.`;
    } else {
      // Default comprehensive professional analysis prompt
      prompt = `You are an elite digital content analyst and web intelligence specialist with expertise in SEO, UX, content strategy, and digital marketing. Conduct a comprehensive, multi-dimensional analysis of this webpage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 WEBPAGE INTELLIGENCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide a detailed professional analysis in the following JSON structure:

{
  "summary": "Write a compelling, insightful 4-5 sentence executive summary that captures the essence, value proposition, and unique characteristics of this content. Be specific and analytical.",
  
  "keyPoints": [
    "Most critical insight or finding (be specific with data/examples)",
    "Second major discovery or pattern identified",
    "Third important observation about content quality/structure",
    "Fourth key takeaway about audience or purpose",
    "Fifth significant point about effectiveness or impact",
    "Bonus: Any unique or surprising element worth noting"
  ],
  
  "category": "Select the MOST ACCURATE: news, blog, documentation, e-commerce, social-media, educational, entertainment, business, technology, portfolio, landing-page, forum, wiki, government, non-profit, marketing, saas, media, research, other",
  
  "sentiment": "Determine overall tone: positive, negative, neutral, mixed, informative, promotional, educational, inspirational, critical, balanced",
  
  "purpose": "Articulate the PRIMARY objective: Why does this page exist? What action should visitors take? Be specific about conversion goals or information delivery.",
  
  "topics": [
    "Primary topic/theme",
    "Secondary topic",
    "Tertiary topic",
    "Related keyword 1",
    "Related keyword 2",
    "Industry/niche identifier"
  ],
  
  "targetAudience": "Define the specific audience demographics, expertise level, interests, and needs. Be precise (e.g., 'Enterprise B2B decision-makers in fintech' not just 'business people')",
  
  "contentQuality": {
    "rating": "Choose: exceptional, high, good, average, below-average, poor",
    "score": 0-100,
    "reasoning": "2-3 sentences explaining the rating based on clarity, depth, structure, accuracy, engagement, and professionalism"
  },
  
  "mainTakeaway": "The single most important message or value that readers should remember. Make it actionable and memorable.",
  
  "credibility": {
    "hasAuthor": true/false,
    "hasDate": true/false,
    "hasSources": true/false,
    "professionalPresentation": true/false,
    "trustScore": 0-100,
    "signals": ["List 3-5 specific credibility indicators or red flags found"]
  },
  
  "seoAnalysis": {
    "titleOptimization": "Rate 0-100 and explain",
    "metaDescription": "Rate 0-100 and explain", 
    "headerStructure": "Rate 0-100 and explain",
    "keywordDensity": "Appropriate/Sparse/Keyword-stuffing",
    "recommendations": ["3-5 specific SEO improvements"]
  },
  
  "uxAssessment": {
    "readability": "Rate 0-100 (Flesch reading ease equivalent)",
    "visualHierarchy": "Clear/Moderate/Poor",
    "callToAction": "Strong/Present/Weak/Missing",
    "mobileOptimization": "Detected/Unknown",
    "loadingIndicators": "Fast/Medium/Slow (based on content size)",
    "improvements": ["3-5 specific UX enhancements"]
  },
  
  "competitiveAdvantages": [
    "Unique strength #1 of this content",
    "Unique strength #2",
    "What makes it stand out from similar pages"
  ],
  
  "weaknesses": [
    "Critical gap or limitation",
    "Area needing improvement",
    "Missing element that would enhance value"
  ],
  
  "recommendations": [
    "High-priority actionable recommendation",
    "Secondary improvement suggestion",
    "Long-term strategic enhancement",
    "Quick win optimization"
  ],
  
  "monetizationPotential": {
    "score": 0-100,
    "methods": ["List 2-3 applicable monetization strategies"],
    "reasoning": "Brief explanation of commercial viability"
  },
  
  "viralityScore": {
    "score": 0-100,
    "factors": ["Elements that make it shareable/engaging"],
    "socialAppeal": "High/Medium/Low and why"
  },
  
  "technicalInsights": {
    "contentLength": "Optimal/Too-short/Too-long",
    "mediaRichness": "High/Medium/Low",
    "interactivity": "Present/Absent",
    "uniqueElements": ["Any standout technical features"]
  }
}

CRITICAL INSTRUCTIONS:
1. Be highly specific - avoid generic observations
2. Provide data-driven insights where possible
3. Use professional terminology appropriate for digital strategists
4. Identify patterns, trends, and strategic implications
5. Return ONLY valid JSON - no markdown, no code blocks, no extra text
6. Make every field actionable and valuable for decision-making
7. Be honest about weaknesses while highlighting strengths`;
    }

    console.log('📤 Sending request to Gemini API...');
    console.log('🔗 Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent');

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          timeout: 45000
        }
      );

      console.log('✅ Gemini API response received');

      const text = response.data.candidates[0].content.parts[0].text;
    
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      // Remove any trailing text after the JSON
      const jsonEnd = jsonText.lastIndexOf('}');
      if (jsonEnd !== -1) {
        jsonText = jsonText.substring(0, jsonEnd + 1);
      }
      
      try {
        const analysis = JSON.parse(jsonText);
        return {
          ...analysis,
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          analyzedAt: new Date().toISOString(),
          confidence: 'high',
          version: '2.0-enhanced'
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', jsonText.substring(0, 200));
        // Fallback to basic analysis if JSON parsing fails
        return this.createFallbackAnalysis(scrapedData, text);
      }
    } catch (apiError) {
      console.error('❌ Gemini API Error:', apiError.message);
      console.error('📊 Error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data
      });
      throw new Error(`Gemini API failed: ${apiError.response?.status || apiError.message}`);
    }
  }

  /**
   * Create fallback analysis when AI parsing fails
   */
  static createFallbackAnalysis(scrapedData, aiText = '') {
    return {
      summary: scrapedData.description || 
               (scrapedData.paragraphs && scrapedData.paragraphs[0]) || 
               'This webpage contains information about ' + scrapedData.title,
      keyPoints: scrapedData.headings
        ? scrapedData.headings.slice(0, 5).map(h => h.text)
        : ['Content analysis available'],
      category: this.detectCategory(scrapedData),
      sentiment: 'informative',
      purpose: 'To provide information to visitors',
      topics: this.extractTopics(scrapedData),
      targetAudience: 'General public',
      contentQuality: 'medium - automated analysis',
      mainTakeaway: scrapedData.title || 'General web content',
      credibility: {
        hasAuthor: !!scrapedData.metadata?.author,
        hasDate: false,
        hasSources: (scrapedData.links?.length || 0) > 5,
        professionalPresentation: true
      },
      recommendations: [
        'Consider adding more structured data',
        'Enhance metadata for better SEO'
      ],
      provider: 'fallback',
      analyzedAt: new Date().toISOString(),
      confidence: 'low',
      note: aiText ? 'AI response could not be parsed, using fallback analysis' : 'Basic analysis without AI API'
    };
  }

  /**
   * Analyze with Hugging Face (Free API)
   */
  static async analyzeWithHuggingFace(content, scrapedData) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    // Use summarization model (free tier)
    const summaryResponse = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: content.substring(0, 1024) },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = summaryResponse.data[0]?.summary_text || 'Summary not available';

    // Basic analysis from scraped data
    const keyPoints = scrapedData.headings
      ? scrapedData.headings.slice(0, 5).map(h => h.text)
      : ['No key points extracted'];

    return {
      summary,
      keyPoints,
      category: this.detectCategory(scrapedData),
      sentiment: 'neutral',
      purpose: 'Content analysis',
      topics: this.extractTopics(scrapedData),
      provider: 'huggingface',
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Fallback: Basic analysis without AI API
   */
  static analyzeWithoutAI(scrapedData) {
    const summary = scrapedData.description || 
                   (scrapedData.paragraphs && scrapedData.paragraphs[0]) || 
                   'No summary available';

    const keyPoints = scrapedData.headings
      ? scrapedData.headings.slice(0, 5).map(h => h.text)
      : ['No key points available'];

    return {
      summary: summary.substring(0, 300),
      keyPoints,
      category: this.detectCategory(scrapedData),
      sentiment: 'neutral',
      purpose: 'General web content',
      topics: this.extractTopics(scrapedData),
      provider: 'basic',
      analyzedAt: new Date().toISOString(),
      note: 'Basic analysis without AI. Configure AI_PROVIDER and API key for enhanced analysis.'
    };
  }

  /**
   * Detect category from scraped data
   */
  static detectCategory(scrapedData) {
    const text = (scrapedData.title + ' ' + scrapedData.description).toLowerCase();
    
    if (text.match(/news|article|breaking|report/)) return 'news';
    if (text.match(/blog|post|author/)) return 'blog';
    if (text.match(/docs|documentation|api|guide|tutorial/)) return 'documentation';
    if (text.match(/shop|buy|cart|product|price/)) return 'e-commerce';
    if (text.match(/social|profile|follow|share/)) return 'social';
    if (text.match(/learn|course|education|school|university/)) return 'educational';
    if (text.match(/video|movie|music|game|entertainment/)) return 'entertainment';
    if (text.match(/business|company|service|enterprise/)) return 'business';
    if (text.match(/tech|software|code|developer|programming/)) return 'technology';
    
    return 'other';
  }

  /**
   * Extract topics from scraped data
   */
  static extractTopics(scrapedData) {
    const topics = new Set();
    
    if (scrapedData.metadata) {
      const keywords = scrapedData.metadata['keywords'] || scrapedData.metadata['og:keywords'];
      if (keywords) {
        keywords.split(',').forEach(k => topics.add(k.trim()));
      }
    }
    
    if (scrapedData.headings) {
      scrapedData.headings.slice(0, 3).forEach(h => {
        const words = h.text.split(' ').filter(w => w.length > 4);
        words.slice(0, 2).forEach(w => topics.add(w));
      });
    }
    
    return Array.from(topics).slice(0, 5);
  }
}

export default AIService;
