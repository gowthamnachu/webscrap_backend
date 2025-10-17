import axios from 'axios';

const analyzeWithGemini = async (content, scrapedData, customPrompt = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    throw new Error('Gemini API key not configured');
  }

  // Prepare content
  const parts = [];
  if (scrapedData.title) parts.push(`Title: ${scrapedData.title}`);
  if (scrapedData.url) parts.push(`URL: ${scrapedData.url}`);
  if (scrapedData.description) parts.push(`Description: ${scrapedData.description}`);
  
  if (scrapedData.contentStats) {
    const stats = [];
    if (scrapedData.contentStats.wordCount) stats.push(`${scrapedData.contentStats.wordCount} words`);
    if (scrapedData.contentStats.readingTime) stats.push(`${scrapedData.contentStats.readingTime} min read`);
    if (stats.length > 0) parts.push(`Stats: ${stats.join(', ')}`);
  }
  
  if (scrapedData.headings && scrapedData.headings.length > 0) {
    parts.push(`Headings: ${scrapedData.headings.slice(0, 10).map(h => h.text).join(', ')}`);
  }
  
  if (scrapedData.paragraphs && scrapedData.paragraphs.length > 0) {
    parts.push(`Content: ${scrapedData.paragraphs.slice(0, 3).join(' ').substring(0, 1500)}`);
  }
  
  const contentText = parts.join('\n\n');

  let prompt;
  
  if (customPrompt && customPrompt.trim()) {
    prompt = `${customPrompt}\n\nContent:\n${contentText}\n\nRespond in valid JSON format only.`;
  } else {
    prompt = `Analyze this webpage comprehensively and return ONLY valid JSON with these exact fields:

{
  "summary": "2-3 sentence executive summary",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "category": "Choose: news/blog/documentation/e-commerce/social/educational/entertainment/business/technology/other",
  "sentiment": "positive/negative/neutral/mixed",
  "purpose": "Main purpose in 1 sentence",
  "targetAudience": "Who is this content for?",
  "topics": ["topic1", "topic2", "topic3"],
  
  "contentQuality": {
    "score": 0-100,
    "rating": "Excellent/Good/Average/Poor",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"]
  },
  
  "credibility": {
    "hasAuthor": true/false,
    "hasDate": true/false,
    "hasSources": true/false,
    "professionalPresentation": true/false,
    "trustScore": 0-100,
    "signals": ["signal1", "signal2"]
  },
  
  "seoAnalysis": {
    "titleOptimization": "Rate 0-100 and explain",
    "metaDescription": "Rate 0-100 and explain", 
    "headerStructure": "Rate 0-100 and explain",
    "keywordDensity": "Appropriate/Sparse/Keyword-stuffing",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  
  "uxAssessment": {
    "readability": 0-100,
    "visualHierarchy": "Clear/Moderate/Poor",
    "callToAction": "Strong/Present/Weak/Missing",
    "mobileOptimization": "Detected/Unknown",
    "loadingIndicators": "Fast/Medium/Slow",
    "improvements": ["improvement1", "improvement2"]
  },
  
  "competitiveAdvantages": ["advantage1", "advantage2", "advantage3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  
  "monetizationPotential": {
    "score": 0-100,
    "methods": ["method1", "method2"],
    "reasoning": "Brief explanation"
  },
  
  "viralityScore": {
    "score": 0-100,
    "factors": ["factor1", "factor2"],
    "socialAppeal": "High/Medium/Low and why"
  },
  
  "technicalInsights": {
    "contentLength": "Optimal/Too-short/Too-long",
    "mediaRichness": "High/Medium/Low",
    "interactivity": "High/Medium/Low/None"
  }
}

Content:
${contentText}

Return ONLY valid JSON - no markdown, no code blocks, no extra text.`;
  }

  console.log('📤 Sending request to Gemini API...');

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
  
    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
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
      return createFallbackAnalysis(scrapedData, text);
    }
  } catch (apiError) {
    console.error('❌ Gemini API Error:', apiError.message);
    throw new Error(`Gemini API failed: ${apiError.response?.status || apiError.message}`);
  }
};

const createFallbackAnalysis = (scrapedData, aiText = '') => {
  return {
    summary: scrapedData.description || 
             (scrapedData.paragraphs && scrapedData.paragraphs[0]) || 
             'This webpage contains information about ' + scrapedData.title,
    keyPoints: scrapedData.headings
      ? scrapedData.headings.slice(0, 5).map(h => h.text)
      : ['Content analysis unavailable'],
    category: 'other',
    sentiment: 'neutral',
    purpose: 'Information sharing',
    targetAudience: 'General audience',
    topics: scrapedData.metadata?.keywords 
      ? scrapedData.metadata.keywords.split(',').slice(0, 3)
      : ['General'],
    contentQuality: {
      score: 70,
      rating: 'Average',
      strengths: ['Basic content structure'],
      weaknesses: ['AI analysis unavailable']
    },
    credibility: {
      hasAuthor: !!scrapedData.metadata?.author,
      hasDate: false,
      hasSources: false,
      professionalPresentation: true,
      trustScore: 60,
      signals: ['Basic metadata present']
    },
    provider: 'fallback',
    analyzedAt: new Date().toISOString(),
    note: 'Basic analysis - AI analysis unavailable'
  };
};

export { analyzeWithGemini, createFallbackAnalysis };
