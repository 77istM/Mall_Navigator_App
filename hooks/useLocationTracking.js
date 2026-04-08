import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { LOCATION_PERMISSIONS } from '../constants/appConstants';
import {
  createInitialLocationTrust,
  evaluateLocationStaleness,
  evaluateLocationTrust,
} from '../utils/navigationTrust';
import { useNavigationTelemetry } from './useNavigationTelemetry';

/**
 * Custom Hook: useLocationTracking
 * Handles all location permission and tracking logic
 * @returns {Object} { location, loading, error }
 */
export const useLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationTrust, setLocationTrust] = useState(createInitialLocationTrust());
  const lastFixRef = useRef(null);
  const staleTimerRef = useRef(null);
  const trackNavigationTelemetry = useNavigationTelemetry();
  const lastTrustTelemetryRef = useRef(null);

  const emitTrustTelemetry = (nextTrust, reason) => {
    if (!nextTrust) {
      return;
    }

    if (!nextTrust.isSuspicious && !nextTrust.isStale && nextTrust.isTrusted) {
      lastTrustTelemetryRef.current = null;
      return;
    }

    const telemetryKey = `${reason}:${nextTrust.score}:${nextTrust.isStale}:${nextTrust.isSuspicious}:${nextTrust.warningText || ''}`;
    if (lastTrustTelemetryRef.current === telemetryKey) {
      return;
    }

    lastTrustTelemetryRef.current = telemetryKey;
    trackNavigationTelemetry(
      'navigation.location_trust_degraded',
      {
        reason,
        score: nextTrust.score,
        isStale: nextTrust.isStale,
        isSuspicious: nextTrust.isSuspicious,
        warningText: nextTrust.warningText,
        speedMps: nextTrust.speedMps,
        jumpMeters: nextTrust.jumpMeters,
      },
      {
        level: 'warning',
        dedupeKey: telemetryKey,
      },
    );
  };

  const updateStaleTrustState = () => {
    const staleSnapshot = evaluateLocationStaleness(lastFixRef.current?.timestamp);

    setLocationTrust((previousTrust) => {
      if (previousTrust.isStale === staleSnapshot.isStale && previousTrust.warningText === staleSnapshot.warningText) {
        return previousTrust;
      }

      const nextTrust = {
        ...previousTrust,
        isStale: staleSnapshot.isStale,
        isTrusted: staleSnapshot.isStale ? false : previousTrust.isTrusted,
        warningText: staleSnapshot.warningText,
        score: staleSnapshot.isStale ? Math.min(previousTrust.score, 35) : previousTrust.score,
      };

      emitTrustTelemetry(nextTrust, 'stale_fix');
      return nextTrust;
    });
  };

  useEffect(() => {
    let locationSubscription;
    let mounted = true;

    (async () => {
      try {
        // 1. Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        staleTimerRef.current = setInterval(() => {
          if (mounted) {
            updateStaleTrustState();
          }
        }, LOCATION_PERMISSIONS.TIME_INTERVAL);

        // 2. Start watching the user's location continuously
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: LOCATION_PERMISSIONS.TIME_INTERVAL,
            distanceInterval: LOCATION_PERMISSIONS.DISTANCE_INTERVAL,
          },
          (newLocation) => {
            const nextCoords = newLocation.coords;
            const timestamp = newLocation.timestamp || Date.now();
            const nextFix = {
              latitude: nextCoords.latitude,
              longitude: nextCoords.longitude,
              timestamp,
            };

            setLocation(nextCoords);
            const nextTrust = evaluateLocationTrust({
              previousFix: lastFixRef.current,
              currentFix: nextFix,
              now: timestamp,
            });

            emitTrustTelemetry(nextTrust, 'location_update');
            setLocationTrust(nextTrust);
            lastFixRef.current = nextFix;
            setError(null);
          }
        );

        setLoading(false);
      } catch (err) {
        console.error('Location tracking error:', err);
        setError(err.message);
        setLoading(false);
      }
    })();

    // Cleanup subscription when component unmounts
    return () => {
      mounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (staleTimerRef.current) {
        clearInterval(staleTimerRef.current);
        staleTimerRef.current = null;
      }
      lastFixRef.current = null;
    };
  }, []);

  return { location, loading, error, locationTrust };
};
