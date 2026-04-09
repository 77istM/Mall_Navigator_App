

const BASE_URLS = [
  'https://mark0s.com/geoquest/v1/api',
  'https://www.mark0s.com/geoquest/v1/api',
];
//const API_KEY = '16gv8f'; // Public test key
const API_KEY = '499xwo'; //Private key
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
        let hasStatusCode = false;
        let isNotTransient = true;
        if (error) {
          if (error.statusCode) {
            hasStatusCode = true;
          }
          if (error.transient) {
            isNotTransient = false;
          }
        }
        if (hasStatusCode && isNotTransient) {
          throw error;
        }

        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        console.warn(`Fetch attempt failed for ${endpoint} (${baseUrl}):`, errorMessage);

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
    let errorStatusCode = null;
    let errorText = null;
    if (error) {
      if (error.statusCode) {
        errorStatusCode = error.statusCode;
      }
      if (error.errorText) {
        errorText = error.errorText;
      }
    }
    if (isNoRecordsFound(errorStatusCode, errorText)) {
      return [];
    }
    // Keep the app usable during transient upstream outages.
    let errorMessage = error;
    if (error && error.message) {
      errorMessage = error.message;
    }
    console.warn(`Using empty fallback for ${endpoint}:`, errorMessage);
    return [];
  }

  throw lastError || new Error(`Failed to fetch ${endpoint} from all configured hosts`);
};

/**
 * Logs a new discovery (Find).
 *
 * Backward-compatible contract:
 * - Legacy callers may still send only FindPlayerID, FindCacheID, FindDatetime, and FindImageURL.
 * - New integrity metadata fields are additive and optional.
 * - Backend validation can reject only the additive fields it understands without breaking older clients.
 */
export const logFind = (playerId, cacheId, imageUrl = null, integrityMetadata = {}) => {
  const normalizedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const normalizedIntegrityMetadata = integrityMetadata && typeof integrityMetadata === 'object'
    ? integrityMetadata
    : {};

  const findData = {
    FindPlayerID: playerId,
    FindCacheID: cacheId,
    FindDatetime: new Date().toISOString(), // ISO 8601 format
    FindImageURL: normalizedImageUrl || TEST_IMAGE_URL,
    ...normalizedIntegrityMetadata,
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
  let eventName = '';
  let eventDescription = 'A private treasure hunt';
  let eventOwnerId = 0;
  let eventStatusId = 1;

  if (eventData) {
    if (eventData.EventName) {
      eventName = eventData.EventName;
    }
    if (eventData.EventDescription) {
      eventDescription = eventData.EventDescription;
    }
    if (eventData.EventOwnerID) {
      eventOwnerId = eventData.EventOwnerID;
    }
    if (eventData.EventStatusID !== null && eventData.EventStatusID !== undefined) {
      eventStatusId = eventData.EventStatusID;
    }
  }

  const normalizedName = eventName.trim();
  const payload = {
    ...eventData,
    EventName: normalizedName,
    EventDescription: eventDescription,
    EventOwnerID: Number(eventOwnerId),
    EventIspublic: false,
    EventStatusID: eventStatusId,
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
export const joinEvent = (userId, eventId, playerName = null) => {
  const normalizedUserId = Number(userId);
  const normalizedEventId = Number(eventId);

  if (Number.isNaN(normalizedUserId) || Number.isNaN(normalizedEventId)) {
    return Promise.reject(new Error('Invalid user ID or invite code.'));
  }

  const playerData = {
    PlayerUserID: normalizedUserId,
    PlayerEventID: normalizedEventId
  };

  if (playerName) {
    playerData.PlayerName = playerName.trim();
  }

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

  let cacheName = '';
  let cacheClue = '';
  let cacheDescription = '';
  let cacheImageURL = '';
  let cacheLatitude = 0;
  let cacheLongitude = 0;
  let cachePoints = 10;

  if (cacheData) {
    if (cacheData.CacheName) {
      cacheName = cacheData.CacheName;
    }
    if (cacheData.CacheClue) {
      cacheClue = cacheData.CacheClue;
    }
    if (cacheData.CacheDescription) {
      cacheDescription = cacheData.CacheDescription;
    }
    if (cacheData.CacheImageURL) {
      cacheImageURL = cacheData.CacheImageURL;
    }
    if (cacheData.CacheLatitude) {
      cacheLatitude = cacheData.CacheLatitude;
    }
    if (cacheData.CacheLongitude) {
      cacheLongitude = cacheData.CacheLongitude;
    }
    if (cacheData.CachePoints !== null && cacheData.CachePoints !== undefined) {
      cachePoints = cacheData.CachePoints;
    }
  }

  const normalizedName = cacheName.trim();
  const normalizedClue = cacheClue.trim();
  const normalizedDescription = cacheDescription.trim();
  const normalizedImageUrl = cacheImageURL.trim();

  const payload = {
    ...cacheData,
    CacheEventID: normalizedEventId,
    CacheName: normalizedName,
    CacheClue: normalizedClue,
    CacheDescription: normalizedDescription || `Cache for event #${normalizedEventId}`,
    CacheImageURL: normalizedImageUrl || TEST_IMAGE_URL,
    CacheLatitude: Number(cacheLatitude),
    CacheLongitude: Number(cacheLongitude),
    CachePoints: Number(cachePoints),
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
    let errorStatusCode = null;
    let errorText = null;
    if (error) {
      if (error.statusCode) {
        errorStatusCode = error.statusCode;
      }
      if (error.errorText) {
        errorText = error.errorText;
      }
    }
    if (isNoRecordsFound(errorStatusCode, errorText)) {
      return [];
    }
    try {
      const players = await fetchAPI(`/players?eventId=${normalizedEventId}`);
      return Array.isArray(players) ? players : [];
    } catch (fallbackError) {
      let fallbackStatusCode = null;
      let fallbackErrorText = null;
      if (fallbackError) {
        if (fallbackError.statusCode) {
          fallbackStatusCode = fallbackError.statusCode;
        }
        if (fallbackError.errorText) {
          fallbackErrorText = fallbackError.errorText;
        }
      }
      if (isNoRecordsFound(fallbackStatusCode, fallbackErrorText)) {
        return [];
      }
      let fallbackMessage = fallbackError;
      if (fallbackError && fallbackError.message) {
        fallbackMessage = fallbackError.message;
      }
      console.warn(`Unable to fetch players for event ${normalizedEventId}:`, fallbackMessage);
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
    let playerId = NaN;
    if (player && player.PlayerID) {
      playerId = Number(player.PlayerID);
    }
    if (!Number.isNaN(playerId)) {
      let playerName = `Player #${playerId}`;
      if (player.PlayerName) {
        playerName = player.PlayerName;
      }
      eventPlayersById[playerId] = {
        playerId,
        playerName,
        totalPoints: 0,
        findsCount: 0,
      };
    }
  });

  finds.forEach((find) => {
    let playerId = NaN;
    if (find && find.FindPlayerID) {
      playerId = Number(find.FindPlayerID);
    }
    if (Number.isNaN(playerId)) {
      return;
    }

    let nestedPlayer = null;
    if (find && find.FindPlayer) {
      nestedPlayer = find.FindPlayer;
    } else if (find && find.Player) {
      nestedPlayer = find.Player;
    }

    let nestedPlayerEventId = NaN;
    if (nestedPlayer && nestedPlayer.PlayerEventID) {
      nestedPlayerEventId = Number(nestedPlayer.PlayerEventID);
    } else if (find && find.PlayerEventID) {
      nestedPlayerEventId = Number(find.PlayerEventID);
    } else if (find && find.FindPlayerEventID) {
      nestedPlayerEventId = Number(find.FindPlayerEventID);
    }

    let isEventFind = false;
    if (!Number.isNaN(nestedPlayerEventId) && nestedPlayerEventId === normalizedEventId) {
      isEventFind = true;
    } else if (eventPlayersById[playerId]) {
      isEventFind = true;
    }

    if (!isEventFind) {
      return;
    }

    if (!eventPlayersById[playerId]) {
      let playerName = `Player #${playerId}`;
      if (nestedPlayer && nestedPlayer.PlayerName) {
        playerName = nestedPlayer.PlayerName;
      }
      eventPlayersById[playerId] = {
        playerId,
        playerName,
        totalPoints: 0,
        findsCount: 0,
      };
    }

    let points = 0;
    if (find && find.FindCache && find.FindCache.CachePoints) {
      points = Number(find.FindCache.CachePoints);
    } else if (find && find.Cache && find.Cache.CachePoints) {
      points = Number(find.Cache.CachePoints);
    }

    if (Number.isNaN(points)) {
      points = 0;
    }
    eventPlayersById[playerId].totalPoints += points;
    eventPlayersById[playerId].findsCount += 1;
  });

  return Object.values(eventPlayersById).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.findsCount - a.findsCount;
  });
};
