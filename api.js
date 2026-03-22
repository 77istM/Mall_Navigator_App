

const BASE_URL = 'https://mark0s.com/geoquest/v1/api';
const API_KEY = '16gv8f'; // Public test key

/**
 * Helper function to handle fetch requests
 */
const fetchAPI = async (endpoint, method = 'GET', body = null) => {
  const url = `${BASE_URL}${endpoint}?key=${API_KEY}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Extract the actual error message from the server
      const errorText = await response.text(); 
      console.error(`API Error Response from ${endpoint}:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
};

export const getPublicCaches = () => fetchAPI('/caches');

/**
 * Logs a new discovery (Find).
 */
export const logFind = (playerId, cacheId) => {
  const findData = {
    FindPlayerID: playerId,
    FindCacheID: cacheId,
    FindDatetime: new Date().toISOString(), // ISO 8601 format
    FindImageURL: "https://imgs.search.brave.com/QepbmUa7ANhll-Fjdx6_3dxZxzRVSNNg5JCt8Nbiehk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI5/OTQ5MjY4Mi9waG90/by9jYXQtaW4teW91/ci1mYWNlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz05WDAt/VlRQRktHakN0QzFa/Tkc4YUUxb2hoaU1z/c3V0RDgwWEtBZk9P/X3VvPQ" // Adding this as an empty string in case it's required
  };
  return fetchAPI('/finds', 'POST', findData);
};