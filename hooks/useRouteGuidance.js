import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRouteFromProvider, ROUTE_SERVICE_SETTINGS } from '../services/navigation/routeService';
import { normalizeRouteResponse } from '../utils/routeNormalization';
import { getGuidanceMode } from '../utils/navigationTrust';

const DEFAULT_REFRESH_DISTANCE_METERS = 25;
const DEFAULT_REFRESH_INTERVAL_MS = 60000;

const getDistanceMeters = (from, to) => {
  if (!from || !to) {
    return null;
  }

  const radians = (value) => value * (Math.PI / 180);
  const earthRadius = 6371e3;
  const deltaLat = radians(to.latitude - from.latitude);
  const deltaLon = radians(to.longitude - from.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useRouteGuidance = ({ location, selectedCache, enabled = true, profile = 'walking', sensorAvailable = true, locationTrust = null }) => {
  const [routeState, setRouteState] = useState({
    loading: false,
    error: null,
    route: null,
    provider: ROUTE_SERVICE_SETTINGS.DEFAULT_PROVIDER,
    mode: 'compass',
    lastUpdatedAt: null,
  });
  const abortRef = useRef(null);
  const lastFetchAtRef = useRef(0);
  const lastOriginRef = useRef(null);
  const lastDestinationRef = useRef(null);

  const destination = useMemo(() => {
    if (!selectedCache) {
      return null;
    }

    return {
      latitude: Number(selectedCache.CacheLatitude),
      longitude: Number(selectedCache.CacheLongitude),
    };
  }, [selectedCache]);

  useEffect(() => {
    if (!enabled || !location || !destination) {
      setRouteState((previous) => ({
        ...previous,
        loading: false,
        error: null,
        route: null,
        mode: getGuidanceMode({ sensorAvailable, locationTrust }),
      }));
      return undefined;
    }

    const shouldRefresh = () => {
      if (!lastOriginRef.current || !lastDestinationRef.current) {
        return true;
      }

      const movedDistance = getDistanceMeters(lastOriginRef.current, location);
      const destinationShift = getDistanceMeters(lastDestinationRef.current, destination);
      const elapsedMs = Date.now() - lastFetchAtRef.current;

      return (
        movedDistance === null ||
        destinationShift === null ||
        movedDistance >= DEFAULT_REFRESH_DISTANCE_METERS ||
        destinationShift >= DEFAULT_REFRESH_DISTANCE_METERS ||
        elapsedMs >= DEFAULT_REFRESH_INTERVAL_MS
      );
    };

    if (!shouldRefresh()) {
      return undefined;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    lastFetchAtRef.current = Date.now();
    lastOriginRef.current = { latitude: location.latitude, longitude: location.longitude };
    lastDestinationRef.current = destination;

    setRouteState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    (async () => {
      try {
        const response = await fetchRouteFromProvider({
          origin: location,
          destination,
          profile,
          signal: controller.signal,
        });

        const normalizedRoute = normalizeRouteResponse(response);
        if (!normalizedRoute) {
          throw new Error('Route provider returned no route.');
        }

        setRouteState({
          loading: false,
          error: null,
          route: normalizedRoute,
          provider: ROUTE_SERVICE_SETTINGS.DEFAULT_PROVIDER,
          mode: 'route',
          lastUpdatedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRouteState((previous) => ({
          ...previous,
          loading: false,
          error: error?.message || 'Unable to load route guidance.',
          route: null,
          mode: getGuidanceMode({ sensorAvailable, locationTrust }),
        }));
      }
    })();

    return () => {
      controller.abort();
    };
  }, [enabled, location, destination, profile, sensorAvailable, locationTrust]);

  return routeState;
};

export default useRouteGuidance;
