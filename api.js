

const BASE_URLS = [
  'https://mark0s.com/geoquest/v1/api',
  'https://www.mark0s.com/geoquest/v1/api',
];
const API_KEY = '16gv8f'; // Public test key
const MAX_RETRIES_PER_HOST = 1;
const TEST_IMAGE_URL = 'https://imgs.search.brave.com/QepbmUa7ANhll-Fjdx6_3dxZxzRVSNNg5JCt8Nbiehk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI5/OTQ5MjY4Mi9waG90/by9jYXQtaW4teW91/ci1mYWNlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz05WDAt/VlRQRktHakN0QzFa/Tkc4YUUxb2hoaU1z/c3V0RDgwWEtBZk9P/X3VvPQ';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (baseUrl, endpoint) => {
  const queryJoinChar = endpoint.includes('?') ? '&' : '?';
  return `${baseUrl}${endpoint}${queryJoinChar}key=${API_KEY}`;
};

const isTransientApiFailure = (statusCode, errorText) => {
  const text = (errorText || '').toLowerCase();
  return statusCode >= 500 || text.includes('error code: 1033');
};

const isNoRecordsFound = (statusCode, errorText) => {
  const text = (errorText || '').toLowerCase();
  return statusCode === 404 && text.includes('no record(s) found');
};

const buildApiError = (statusCode, errorText, transient = false) => {
  const error = new Error(`API Error: ${statusCode} - ${errorText}`);
  error.statusCode = statusCode;
  error.errorText = errorText;
  error.transient = transient;
  return error;
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
            lastError = buildApiError(response.status, errorText, true);
            if (attempt < MAX_RETRIES_PER_HOST) {
              await delay(500);
              continue;
            }
            break;
          }

          // Several list endpoints return 404 for "no data" instead of an empty list.
          // Treat this as a normal API miss, not an application error log.
          if (isNoRecordsFound(response.status, errorText)) {
            throw buildApiError(response.status, errorText, false);
          }

          console.error(`API Error Response from ${requestLabel}:`, errorText);
          throw buildApiError(response.status, errorText, false);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        }

        return await response.text();
      } catch (error) {
        lastError = error;

        // Validation/other 4xx API errors should not be retried or duplicated across hosts.
        if (error?.statusCode && !error?.transient) {
          throw error;
        }

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
    if (isNoRecordsFound(error?.statusCode, error?.errorText)) {
      return [];
    }
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
    FindImageURL: TEST_IMAGE_URL
  };
  return fetchAPI('/finds', 'POST', findData);
};

export const getPublicCaches = () => fetchListWithFallback('/caches');

/**
 * Fetches all finds to build the leaderboard.
 * Finds contain the Player details and the Cache details (including Points).
 */
export const getAllFinds = () => fetchListWithFallback('/finds');

// api.js (Additions)

/**
 * Creates a new private event.
 * Maps to the Event entity requiring EventName, EventDescription, EventOwnerID, etc. [cite: 11, 13, 14]
 */
export const createPrivateEvent = (eventData) => {
  const normalizedName = (eventData?.EventName || '').trim();
  const payload = {
    ...eventData,
    EventName: normalizedName,
    EventDescription: eventData?.EventDescription || 'A private treasure hunt',
    EventOwnerID: Number(eventData?.EventOwnerID),
    EventIspublic: false,
    EventStatusID: eventData?.EventStatusID ?? 1,
  };

  return fetchAPI('/events', 'POST', payload).then((response) => {
    if (Array.isArray(response)) {
      return response[0] || null;
    }
    return response;
  });
};

/**
 * Joins a user to an event by creating a Player entity.
 * Associates PlayerUserID to PlayerEventID[cite: 19].
 */
export const joinEvent = (userId, eventId) => {
  const normalizedUserId = Number(userId);
  const normalizedEventId = Number(eventId);

  if (Number.isNaN(normalizedUserId) || Number.isNaN(normalizedEventId)) {
    return Promise.reject(new Error('Invalid user ID or invite code.'));
  }

  const playerData = {
    PlayerUserID: normalizedUserId,
    PlayerEventID: normalizedEventId
  };
  return fetchAPI('/players', 'POST', playerData);
};

/**
 * Fetches caches specific to a private event to filter the map view.
 */
export const getEventCaches = (eventId) => {
  return fetchListWithFallback(`/caches/events/${eventId}`);
};

export const createEventCache = (eventId, cacheData) => {
  const normalizedEventId = Number(eventId);
  const normalizedName = (cacheData?.CacheName || '').trim();
  const normalizedClue = (cacheData?.CacheClue || '').trim();
  const normalizedDescription = (cacheData?.CacheDescription || '').trim();
  const normalizedImageUrl = (cacheData?.CacheImageURL || '').trim();

  const payload = {
    ...cacheData,
    CacheEventID: normalizedEventId,
    CacheName: normalizedName,
    CacheClue: normalizedClue,
    CacheDescription: normalizedDescription || `Cache for event #${normalizedEventId}`,
    CacheImageURL: normalizedImageUrl || TEST_IMAGE_URL,
    CacheLatitude: Number(cacheData?.CacheLatitude),
    CacheLongitude: Number(cacheData?.CacheLongitude),
    CachePoints: Number(cacheData?.CachePoints ?? 10),
  };

  return fetchAPI('/caches', 'POST', payload).then((response) => {
    if (Array.isArray(response)) {
      return response[0] || null;
    }
    return response;
  });
};

export const getEventPlayers = async (eventId) => {
  const normalizedEventId = Number(eventId);
  try {
    const players = await fetchAPI(`/players/events/${normalizedEventId}`);
    return Array.isArray(players) ? players : [];
  } catch (error) {
    if (isNoRecordsFound(error?.statusCode, error?.errorText)) {
      return [];
    }
    try {
      const players = await fetchAPI(`/players?eventId=${normalizedEventId}`);
      return Array.isArray(players) ? players : [];
    } catch (fallbackError) {
      if (isNoRecordsFound(fallbackError?.statusCode, fallbackError?.errorText)) {
        return [];
      }
      console.warn(`Unable to fetch players for event ${normalizedEventId}:`, fallbackError?.message || fallbackError);
      return [];
    }
  }
};

export const getEventLeaderboard = async (eventId) => {
  const normalizedEventId = Number(eventId);
  const [players, finds] = await Promise.all([
    getEventPlayers(normalizedEventId),
    fetchListWithFallback('/finds'),
  ]);

  const eventPlayersById = {};
  players.forEach((player) => {
    const playerId = Number(player?.PlayerID);
    if (!Number.isNaN(playerId)) {
      eventPlayersById[playerId] = {
        playerId,
        playerName: player?.PlayerUser?.UserName || player?.PlayerName || `Player #${playerId}`,
        totalPoints: 0,
        findsCount: 0,
      };
    }
  });

  finds.forEach((find) => {
    const playerId = Number(find?.FindPlayerID);
    if (Number.isNaN(playerId)) {
      return;
    }

    const nestedPlayer = find?.FindPlayer || find?.Player;
    const nestedPlayerEventId = Number(
      nestedPlayer?.PlayerEventID ??
      find?.PlayerEventID ??
      find?.FindPlayerEventID
    );

    const isEventFind = (
      (!Number.isNaN(nestedPlayerEventId) && nestedPlayerEventId === normalizedEventId) ||
      Boolean(eventPlayersById[playerId])
    );

    if (!isEventFind) {
      return;
    }

    if (!eventPlayersById[playerId]) {
      eventPlayersById[playerId] = {
        playerId,
        playerName: `Player #${playerId}`,
        totalPoints: 0,
        findsCount: 0,
      };
    }

    const points = Number(find?.FindCache?.CachePoints ?? find?.Cache?.CachePoints ?? 0);
    eventPlayersById[playerId].totalPoints += Number.isNaN(points) ? 0 : points;
    eventPlayersById[playerId].findsCount += 1;
  });

  return Object.values(eventPlayersById).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.findsCount - a.findsCount;
  });
};