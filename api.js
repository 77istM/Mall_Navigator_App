

const BASE_URL = 'http://mark0s.com/geoquest/v1/api';
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

/**
 * Fetches all public caches.
 * Caches contain properties like CacheLatitude, CacheLongitude, CachePoints, and CacheClue.
 */
export const getPublicCaches = () => fetchAPI('/caches');

/**
 * Logs a new discovery (Find).
 * @param {string} playerId - The ID of the player making the find.
 * @param {string} cacheId - The ID of the cache found.
 */
export const logFind = (playerId, cacheId) => {
  const findData = {
    FindPlayerID: playerId,
    FindCacheID: cacheId,
    FindDatetime: new Date().toISOString(), // Must be ISO 8601 format
  };
  return fetchAPI('/finds', 'POST', findData);
};