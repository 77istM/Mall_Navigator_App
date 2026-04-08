import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRouteFromProvider, ROUTE_SERVICE_SETTINGS } from '../services/navigation/routeService';
import { normalizeRouteResponse } from '../utils/routeNormalization';
import { getGuidanceMode } from '../utils/navigationTrust';
import { GEOQUEST_ROLLOUT_FLAGS } from '../constants/featureFlags';
import { useNavigationTelemetry } from './useNavigationTelemetry';

const DEFAULT_REFRESH_DISTANCE_METERS = 25;
const DEFAULT_REFRESH_INTERVAL_MS = 60000;
const DEFAULT_REFRESH_DEDUP_WINDOW_MS = 10000;

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

const buildRouteRequestSignature = (origin, destination, profile) => {
  if (!origin || !destination) {
    return null;
  }

  return [
    profile,
    origin.latitude.toFixed(5),
    origin.longitude.toFixed(5),
    destination.latitude.toFixed(5),
    destination.longitude.toFixed(5),
  ].join('|');
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
  const lastRequestSignatureRef = useRef(null);
  const inFlightSignatureRef = useRef(null);
  const trackNavigationTelemetry = useNavigationTelemetry();

  const destination = useMemo(() => {
    if (!selectedCache) {
      return null;
    }

    return {
      latitude: Number(selectedCache.CacheLatitude),
      longitude: Number(selectedCache.CacheLongitude),
    };
  }, [selectedCache]);

  const origin = useMemo(() => {
    if (!location) {
      return null;
    }

    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
  }, [location?.latitude, location?.longitude]);

  const requestSignature = useMemo(
    () => buildRouteRequestSignature(origin, destination, profile),
    [origin, destination, profile],
  );

  useEffect(() => {
    if (!GEOQUEST_ROLLOUT_FLAGS.routeEnabled) {
      setRouteState((previous) => ({
        ...previous,
        loading: false,
        error: null,
        route: null,
        mode: getGuidanceMode({ sensorAvailable, locationTrust }),
      }));
      return undefined;
    }

    if (!enabled || !origin || !destination) {
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

    if (inFlightSignatureRef.current === requestSignature) {
      trackNavigationTelemetry(
        'navigation.route_request_deduped',
        {
          reason: 'in_flight',
          profile,
          requestSignature,
        },
        {
          level: 'info',
          dedupeKey: `${requestSignature}:in_flight`,
          dedupeWindowMs: DEFAULT_REFRESH_DEDUP_WINDOW_MS,
        },
      );
      return undefined;
    }

    if (!shouldRefresh()) {
      trackNavigationTelemetry(
        'navigation.route_refresh_skipped',
        {
          reason: 'movement_guard',
          profile,
          requestSignature,
        },
        {
          level: 'info',
          dedupeKey: `${requestSignature}:movement_guard`,
          dedupeWindowMs: DEFAULT_REFRESH_DEDUP_WINDOW_MS,
        },
      );
      return undefined;
    }

    if (lastRequestSignatureRef.current === requestSignature && Date.now() - lastFetchAtRef.current < DEFAULT_REFRESH_INTERVAL_MS) {
      trackNavigationTelemetry(
        'navigation.route_refresh_skipped',
        {
          reason: 'recent_request',
          profile,
          requestSignature,
        },
        {
          level: 'info',
          dedupeKey: `${requestSignature}:recent_request`,
          dedupeWindowMs: DEFAULT_REFRESH_DEDUP_WINDOW_MS,
        },
      );
      return undefined;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    lastFetchAtRef.current = Date.now();
    lastOriginRef.current = { latitude: origin.latitude, longitude: origin.longitude };
    lastDestinationRef.current = destination;
    lastRequestSignatureRef.current = requestSignature;
    inFlightSignatureRef.current = requestSignature;

    setRouteState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    (async () => {
      try {
        const response = await fetchRouteFromProvider({
          origin,
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
        inFlightSignatureRef.current = null;
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        inFlightSignatureRef.current = null;
        trackNavigationTelemetry(
          'navigation.route_degraded',
          {
            reason: 'fetch_failed',
            profile,
            requestSignature,
            message: error?.message || 'Unable to load route guidance.',
            guidanceMode: getGuidanceMode({ sensorAvailable, locationTrust }),
          },
          {
            level: 'warning',
            dedupeKey: `${requestSignature}:route_degraded:${error?.message || 'unknown'}`,
            dedupeWindowMs: DEFAULT_REFRESH_DEDUP_WINDOW_MS,
          },
        );

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
      inFlightSignatureRef.current = null;
    };
  }, [enabled, origin, destination, profile, sensorAvailable, locationTrust, requestSignature, trackNavigationTelemetry]);

  return routeState;
};

export default useRouteGuidance;
