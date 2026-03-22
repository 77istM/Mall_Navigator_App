

const BASE_URL = 'https://mark0s.com/geoquest/v1/api'; // Changed http to https
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
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
};

export const getPublicCaches = () => fetchAPI('/caches');

export const logFind = (playerId, cacheId) => {
  const findData = {
    FindPlayerID: playerId,
    FindCacheID: cacheId,
    FindDatetime: new Date().toISOString(), 
  };
  return fetchAPI('/finds', 'POST', findData);
};