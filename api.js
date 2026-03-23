

const BASE_URLS = [
  'https://mark0s.com/geoquest/v1/api',
  'https://www.mark0s.com/geoquest/v1/api',
];
const API_KEY = '16gv8f'; // Public test key
const MAX_RETRIES_PER_HOST = 1;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (baseUrl, endpoint) => {
  const queryJoinChar = endpoint.includes('?') ? '&' : '?';
  return `${baseUrl}${endpoint}${queryJoinChar}key=${API_KEY}`;
};

const isTransientApiFailure = (statusCode, errorText) => {
  const text = (errorText || '').toLowerCase();
  return statusCode >= 500 || text.includes('error code: 1033');
};

/**
 * Helper function to handle fetch requests
 */
const fetchAPI = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  let lastError = null;

  for (const baseUrl of BASE_URLS) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_HOST; attempt += 1) {
      const url = buildUrl(baseUrl, endpoint);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          const requestLabel = `${endpoint} (${baseUrl})`;

          const transientError = isTransientApiFailure(response.status, errorText);
          if (transientError) {
            console.warn(`Transient API error from ${requestLabel}:`, errorText || `HTTP ${response.status}`);
            lastError = new Error(`API Error: ${response.status} - ${errorText}`);
            if (attempt < MAX_RETRIES_PER_HOST) {
              await delay(500);
              continue;
            }
            break;
          }

          console.error(`API Error Response from ${requestLabel}:`, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        }

        return await response.text();
      } catch (error) {
        lastError = error;
        console.warn(`Fetch attempt failed for ${endpoint} (${baseUrl}):`, error?.message || error);

        // For network-level failures, retry then fall back to the next host.
        if (attempt < MAX_RETRIES_PER_HOST) {
          await delay(500);
          continue;
        }
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${endpoint} from all configured hosts`);
};

const fetchListWithFallback = async (endpoint) => {
  try {
    const data = await fetchAPI(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Keep the app usable during transient upstream outages.
    console.warn(`Using empty fallback for ${endpoint}:`, error?.message || error);
    return [];
  }
};

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

export const getPublicCaches = () => fetchListWithFallback('/caches');

/**
 * Fetches all finds to build the leaderboard.
 * Finds contain the Player details and the Cache details (including Points).
 */
export const getAllFinds = () => fetchListWithFallback('/finds');