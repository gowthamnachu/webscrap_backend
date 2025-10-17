import { refreshStaleUrls } from './utils/refresh.js';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Get refresh interval from request (default: 60 seconds)
    const body = event.body ? JSON.parse(event.body) : {};
    const refreshInterval = body.refreshInterval || 60000; // 60 seconds

    console.log(`🔄 Starting refresh of stale URLs (interval: ${refreshInterval}ms)...`);

    const result = await refreshStaleUrls(refreshInterval);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Refreshed ${result.refreshed} URLs successfully, ${result.failed} failed`,
        data: result
      })
    };
  } catch (error) {
    console.error('Refresh handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to refresh URLs'
      })
    };
  }
};
