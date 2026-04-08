import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { getPublicCaches, getEventCaches, logFind } from '../api';
import { getDistanceInMeters } from '../utils/distanceCalculator';
import { getBearingInDegrees } from '../utils/bearingCalculator';
import {
  DISCOVERY_RADIUS,
  PLAYER_ID,
  COMPASS_SETTINGS,
  MOTION_FEATURES,
  MOTION_GAMEPLAY_SETTINGS,
  NAVIGATION_TRUST,
} from '../constants/appConstants';
import {
  buildDiscoveryIntegritySnapshot,
  evaluateDiscoveryLogAttempt,
  getGuidanceMode,
} from '../utils/navigationTrust';
import { useNavigationTelemetry } from './useNavigationTelemetry';

/**
 * Custom Hook: useCacheManagement
 * Manages cache data, selection, and discovery logging
 * @param {Object} location - Current user location {latitude, longitude}
 * @param {number|null} eventId - Active private event ID
 * @param {number|null} heading - Current device heading (0-359)
 * @param {Object} motionContext - Optional movement context { motionState, motionMagnitude }
 * @returns {Object} { caches, loading, error, selectedCache, distanceToCache, handleSelectCache, handleLogDiscovery, isLogging }
 */
export const useCacheManagement = (location, eventId = null, heading = null, motionContext = {}) => {
  const [caches, setCaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCache, setSelectedCache] = useState(null);
  const [distanceToCache, setDistanceToCache] = useState(null);
  const [targetBearing, setTargetBearing] = useState(null);
  const [turnDelta, setTurnDelta] = useState(null);
  const [directionHint, setDirectionHint] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [movementConfidence, setMovementConfidence] = useState(null);
  const [isAligned, setIsAligned] = useState(false);
  const [lastLogAttemptAt, setLastLogAttemptAt] = useState(null);
  const [distanceTrendText, setDistanceTrendText] = useState(null);
  const [distanceTrendTone, setDistanceTrendTone] = useState('info');
  const previousDistanceRef = useRef(null);
  const trackNavigationTelemetry = useNavigationTelemetry();

  const motionState = motionContext?.motionState || null;
  const motionMagnitude = motionContext?.motionMagnitude;
  const locationTrust = motionContext?.locationTrust || null;
  const discoveryRadius = motionContext?.discoveryRadius ?? DISCOVERY_RADIUS;

  useEffect(() => {
    previousDistanceRef.current = null;
    setDistanceTrendText(null);
    setDistanceTrendTone('info');
  }, [selectedCache?.CacheID]);

  const calculateMovementConfidence = () => {
    if (!MOTION_FEATURES.ENABLE_ACCELEROMETER || !MOTION_GAMEPLAY_SETTINGS.ENABLE_MOVEMENT_CONFIDENCE) {
      return null;
    }

    const stateBaseScore = {
      stationary: 20,
      walking: 65,
      active: 85,
    };

    const baseScore = stateBaseScore[motionState] ?? 45;
    const magnitudeBonus = Number.isFinite(motionMagnitude)
      ? Math.min(Math.max(motionMagnitude * 120, 0), 15)
      : 0;

    return Math.round(Math.min(baseScore + magnitudeBonus, 100));
  };

  // Fetch caches on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setSelectedCache(null);
      try {
        const cacheData = eventId ? await getEventCaches(eventId) : await getPublicCaches();
        setCaches(cacheData);
        setError(null);
      } catch (err) {
        console.error('Error fetching caches:', err);
        Alert.alert("Error", "Could not fetch caches from the API.");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  // Recalculate distance whenever location OR selected cache changes
  useEffect(() => {
    if (location && selectedCache) {
      const distance = getDistanceInMeters(
        location.latitude,
        location.longitude,
        selectedCache.CacheLatitude,
        selectedCache.CacheLongitude
      );
      const roundedDistance = Math.round(distance);
      const previousDistance = previousDistanceRef.current;

      setDistanceToCache(roundedDistance);

      if (Number.isFinite(previousDistance)) {
        const delta = previousDistance - roundedDistance;
        const deltaMagnitude = Math.abs(delta);

        if (deltaMagnitude < 3) {
          setDistanceTrendText('Distance steady');
          setDistanceTrendTone('info');
        } else if (delta > 0) {
          setDistanceTrendText(`Getting closer by ${deltaMagnitude}m`);
          setDistanceTrendTone('success');
        } else {
          setDistanceTrendText(`Moving away by ${deltaMagnitude}m`);
          setDistanceTrendTone('warning');
        }
      } else {
        setDistanceTrendText(null);
        setDistanceTrendTone('info');
      }

      previousDistanceRef.current = roundedDistance;
    } else {
      setDistanceToCache(null);
      setDistanceTrendText(null);
      setDistanceTrendTone('info');
      previousDistanceRef.current = null;
    }
  }, [location, selectedCache]);

  // Recalculate target bearing whenever location OR selected cache changes
  useEffect(() => {
    if (location && selectedCache) {
      const bearing = getBearingInDegrees(
        location.latitude,
        location.longitude,
        selectedCache.CacheLatitude,
        selectedCache.CacheLongitude
      );
      setTargetBearing(bearing);
    } else {
      setTargetBearing(null);
    }
  }, [location, selectedCache]);

  // Recalculate turn delta and hint whenever heading OR target bearing changes
  useEffect(() => {
    if (heading === null || targetBearing === null) {
      setTurnDelta(null);
      setDirectionHint(null);
      return;
    }

    // Normalize shortest turn angle to range [-180, 180)
    const delta = ((targetBearing - heading + 540) % 360) - 180;
    const roundedDelta = Math.round(delta);
    setTurnDelta(roundedDelta);
    const aligned = Math.abs(roundedDelta) <= COMPASS_SETTINGS.ON_TARGET_THRESHOLD_DEGREES;
    setIsAligned(aligned);

    if (aligned) {
      setDirectionHint('On target');
    } else if (roundedDelta > 0) {
      setDirectionHint(`Turn right ${Math.abs(roundedDelta)}°`);
    } else {
      setDirectionHint(`Turn left ${Math.abs(roundedDelta)}°`);
    }
  }, [heading, targetBearing]);

  const logAttemptState = evaluateDiscoveryLogAttempt({
    selectedCache,
    distanceToCache,
    discoveryRadius,
    locationTrust,
    lastLogAttemptAt,
  });

  const canLogDiscovery = logAttemptState.canLog;

  const handleSelectCache = (cache) => {
    setSelectedCache(cache);
  };

  const handleLogDiscovery = async (imageUrl = null) => {
    if (isLogging) {
      return;
    }

    if (!logAttemptState.canLog) {
      trackNavigationTelemetry(
        'navigation.discovery_log_blocked',
        {
          reason: logAttemptState.reason,
          selectedCacheId: selectedCache?.CacheID ?? null,
          distanceToCache,
          discoveryRadius,
          locationTrusted: locationTrust?.isTrusted ?? null,
          locationStale: locationTrust?.isStale ?? null,
          guidanceMode: getGuidanceMode({
            sensorAvailable: Number.isFinite(heading),
            locationTrust,
          }),
        },
        {
          level: 'warning',
          dedupeKey: `discovery_log_blocked:${selectedCache?.CacheID ?? 'none'}:${logAttemptState.reason || 'unknown'}`,
        },
      );
      return;
    }

    setLastLogAttemptAt(Date.now());

    const confidenceSnapshot = calculateMovementConfidence();
    setMovementConfidence(confidenceSnapshot);
    const guidanceMode = getGuidanceMode({
      sensorAvailable: Number.isFinite(heading),
      locationTrust,
    });
    const integrityMetadata = buildDiscoveryIntegritySnapshot({
      location,
      locationTrust,
      distanceToCache,
      discoveryRadius,
      targetBearing,
      turnDelta,
      motionState,
      motionMagnitude,
      guidanceMode,
    });
    
    setIsLogging(true);
    try {
      await logFind(PLAYER_ID, selectedCache.CacheID, imageUrl, integrityMetadata);

      const confidenceMessage =
        MOTION_GAMEPLAY_SETTINGS.SHOW_CONFIDENCE_IN_SUCCESS_MESSAGE && Number.isFinite(confidenceSnapshot)
          ? `\nMovement confidence: ${confidenceSnapshot}%`
          : '';
      
      Alert.alert(
        "Success!", 
        `You found ${selectedCache.CacheName} and earned ${selectedCache.CachePoints} points!${confidenceMessage}`
      );
      
      // Filter out the found cache from the map
      setCaches((prevCaches) => 
        prevCaches.filter((cache) => cache.CacheID !== selectedCache.CacheID)
      );
      
      // Close the targeting panel
      setSelectedCache(null); 
      
    } catch (err) {
      console.error('Error logging discovery:', err);
      Alert.alert('Log Failed', err?.message || 'Unable to log discovery right now. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return {
    caches,
    loading,
    error,
    selectedCache,
    distanceToCache,
    targetBearing,
    turnDelta,
    directionHint,
    isAligned,
    canLogDiscovery,
    logAttemptReason: logAttemptState.reason,
    distanceTrendText,
    distanceTrendTone,
    movementConfidence,
    handleSelectCache,
    handleLogDiscovery,
    isLogging,
  };
};
