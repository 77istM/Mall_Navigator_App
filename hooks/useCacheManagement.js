import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getPublicCaches, getEventCaches, logFind } from '../api';
import { getDistanceInMeters } from '../utils/distanceCalculator';
import { getBearingInDegrees } from '../utils/bearingCalculator';
import { PLAYER_ID } from '../constants/appConstants';

/**
 * Custom Hook: useCacheManagement
 * Manages cache data, selection, and discovery logging
 * @param {Object} location - Current user location {latitude, longitude}
 * @param {number|null} eventId - Active private event ID
 * @param {number|null} heading - Current device heading (0-359)
 * @returns {Object} { caches, loading, error, selectedCache, distanceToCache, handleSelectCache, handleLogDiscovery, isLogging }
 */
export const useCacheManagement = (location, eventId = null, heading = null) => {
  const [caches, setCaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCache, setSelectedCache] = useState(null);
  const [distanceToCache, setDistanceToCache] = useState(null);
  const [targetBearing, setTargetBearing] = useState(null);
  const [turnDelta, setTurnDelta] = useState(null);
  const [directionHint, setDirectionHint] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

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
      setDistanceToCache(Math.round(distance));
    } else {
      setDistanceToCache(null);
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

    if (Math.abs(roundedDelta) <= 10) {
      setDirectionHint('On target');
    } else if (roundedDelta > 0) {
      setDirectionHint(`Turn right ${Math.abs(roundedDelta)}°`);
    } else {
      setDirectionHint(`Turn left ${Math.abs(roundedDelta)}°`);
    }
  }, [heading, targetBearing]);

  const handleSelectCache = (cache) => {
    setSelectedCache(cache);
  };

  const handleLogDiscovery = async () => {
    if (!selectedCache) return;
    
    setIsLogging(true);
    try {
      await logFind(PLAYER_ID, selectedCache.CacheID);
      
      Alert.alert(
        "Success!", 
        `You found ${selectedCache.CacheName} and earned ${selectedCache.CachePoints} points!`
      );
      
      // Filter out the found cache from the map
      setCaches((prevCaches) => 
        prevCaches.filter((cache) => cache.CacheID !== selectedCache.CacheID)
      );
      
      // Close the targeting panel
      setSelectedCache(null); 
      
    } catch (err) {
      console.error('Error logging discovery:', err);
      Alert.alert("Error", "Failed to log discovery. Try again.");
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
    handleSelectCache,
    handleLogDiscovery,
    isLogging,
  };
};
