import { getAllData, getDataById, deleteData, getStatistics } from './utils/database.js';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { id } = event.queryStringParameters || {};
    const pathSegments = event.path.split('/').filter(Boolean);
    const isStatsRequest = pathSegments[pathSegments.length - 1] === 'stats';

    // Handle DELETE request
    if (event.httpMethod === 'DELETE') {
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'ID is required for delete' })
        };
      }

      await deleteData(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Data deleted successfully'
        })
      };
    }

    // Handle GET requests
    if (event.httpMethod === 'GET') {
      // Get statistics
      if (isStatsRequest) {
        const stats = await getStatistics();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: stats
          })
        };
      }

      // Get single item by ID
      if (id) {
        const data = await getDataById(id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data
          })
        };
      }

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

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
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
