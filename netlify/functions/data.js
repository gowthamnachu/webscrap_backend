import { getAllData, getDataById } from './utils/database.js';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { id } = event.queryStringParameters || {};

    if (id) {
      // Get single item by ID
      const data = await getDataById(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data
        })
      };
    } else {
      // Get all items with pagination
      const page = parseInt(event.queryStringParameters?.page || '1');
      const limit = parseInt(event.queryStringParameters?.limit || '10');
      
      const result = await getAllData(page, limit);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          ...result
        })
      };
    }
  } catch (error) {
    console.error('Data handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      })
    };
  }
};
