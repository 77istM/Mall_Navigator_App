const DEFAULT_PROVIDER = 'osrm';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_THROTTLE_MS = 1500;

const buildOsrmRouteUrl = ({ origin, destination, profile = 'walking' }) => {
  const fromLon = Number(origin?.longitude);
  const fromLat = Number(origin?.latitude);
  const toLon = Number(destination?.longitude);
  const toLat = Number(destination?.latitude);

  return `https://router.project-osrm.org/route/v1/${profile}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=polyline&steps=true&alternatives=false&annotations=false`;
};

const withTimeout = async (promiseFactory, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchRouteFromProvider = async ({
  provider = DEFAULT_PROVIDER,
  origin,
  destination,
  profile = 'walking',
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  if (!origin || !destination) {
    throw new Error('Route origin and destination are required.');
  }

  if (provider !== 'osrm') {
    throw new Error(`Unsupported route provider: ${provider}`);
  }

  const url = buildOsrmRouteUrl({ origin, destination, profile });
  const fetchRoute = async (requestSignal) => {
    const response = await fetch(url, { signal: requestSignal });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Route request failed with HTTP ${response.status}`);
    }

    return response.json();
  };

  if (signal) {
    return fetchRoute(signal);
  }

  return withTimeout(fetchRoute, timeoutMs);
};

export const ROUTE_SERVICE_SETTINGS = {
  DEFAULT_PROVIDER,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_THROTTLE_MS,
};
