import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { createPrivateModeCache } from '../PrivateMode/services/PrivateModeService';
import { validateCacheForm, parsePositiveNumber } from '../PrivateMode/validation/PrivateModeValidation';
import { TEST_IMAGE_URL, DEFAULT_CACHE_POINTS } from '../PrivateMode/constants/PrivateModeConstants';
import { buildPickerRegion } from '../PrivateMode/utils/pickerRegion';

export const useCacheCreation = () => {
  const [cacheName, setCacheName] = useState('');
  const [cacheClue, setCacheClue] = useState('');
  const [cacheDescription, setCacheDescription] = useState('');
  const [cacheImageURL, setCacheImageURL] = useState(TEST_IMAGE_URL);
  const [cacheLatitude, setCacheLatitude] = useState('');
  const [cacheLongitude, setCacheLongitude] = useState('');
  const [cachePoints, setCachePoints] = useState(DEFAULT_CACHE_POINTS);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [isCreatingCache, setIsCreatingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);

  const handleCreateCache = useCallback(async (ownedEventId) => {
    if (!ownedEventId) {
      return Alert.alert('Error', 'Create an event first before adding caches.');
    }

    const cacheFormError = validateCacheForm({
      cacheName,
      cacheClue,
      cacheDescription,
      cacheLatitude,
      cacheLongitude,
      cachePoints,
    });

    if (cacheFormError) {
      setCacheStatus({ tone: 'error', message: cacheFormError });
      return;
    }

    const latitude = Number(cacheLatitude);
    const longitude = Number(cacheLongitude);
    const points = parsePositiveNumber(cachePoints);
    setIsCreatingCache(true);
    setCacheStatus({ tone: 'info', message: 'Creating cache...' });

    try {
      const trimmedCacheName = cacheName.trim();
      const trimmedCacheClue = cacheClue.trim();
      const trimmedCacheDescription = cacheDescription.trim();
      const trimmedCacheImageURL = cacheImageURL.trim();

      await createPrivateModeCache(ownedEventId, {
        CacheName: trimmedCacheName,
        CacheClue: trimmedCacheClue,
        CacheDescription: trimmedCacheDescription,
        CacheImageURL: trimmedCacheImageURL,
        CacheLatitude: latitude,
        CacheLongitude: longitude,
        CachePoints: points,
      });

      setCacheStatus({ tone: 'success', message: 'Cache created for this private event.' });
      resetCacheForm();
    } catch (error) {
      setCacheStatus({ tone: 'error', message: error?.message || 'Failed to create cache.' });
    } finally {
      setIsCreatingCache(false);
    }
  }, [cacheName, cacheClue, cacheDescription, cacheImageURL, cacheLatitude, cacheLongitude, cachePoints]);

  const resetCacheForm = useCallback(() => {
    setCacheName('');
    setCacheClue('');
    setCacheDescription('');
    setCacheImageURL(TEST_IMAGE_URL);
    setCacheLatitude('');
    setCacheLongitude('');
    setCachePoints(DEFAULT_CACHE_POINTS);
  }, []);

  const handleMapPress = useCallback((event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCacheLatitude(latitude.toFixed(6));
    setCacheLongitude(longitude.toFixed(6));
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCacheNameChange = useCallback((value) => {
    setCacheName(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCacheClueChange = useCallback((value) => {
    setCacheClue(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCacheDescriptionChange = useCallback((value) => {
    setCacheDescription(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCacheImageUrlChange = useCallback((value) => {
    setCacheImageURL(value);
  }, []);

  const handleCacheLatitudeChange = useCallback((value) => {
    setCacheLatitude(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCacheLongitudeChange = useCallback((value) => {
    setCacheLongitude(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const handleCachePointsChange = useCallback((value) => {
    setCachePoints(value);
    if (cacheStatus?.tone === 'error') {
      setCacheStatus(null);
    }
  }, [cacheStatus]);

  const getPickerRegion = useCallback(() => {
    return buildPickerRegion(cacheLatitude, cacheLongitude);
  }, [cacheLatitude, cacheLongitude]);

  const toggleMapPicker = useCallback(() => {
    setIsMapPickerVisible((prev) => !prev);
  }, []);

  return {
    // State
    cacheName,
    cacheClue,
    cacheDescription,
    cacheImageURL,
    cacheLatitude,
    cacheLongitude,
    cachePoints,
    isMapPickerVisible,
    isCreatingCache,
    cacheStatus,
    // Setters
    setCacheName: handleCacheNameChange,
    setCacheClue: handleCacheClueChange,
    setCacheDescription: handleCacheDescriptionChange,
    setCacheImageURL: handleCacheImageUrlChange,
    setCacheLatitude: handleCacheLatitudeChange,
    setCacheLongitude: handleCacheLongitudeChange,
    setCachePoints: handleCachePointsChange,
    // Handlers
    handleCreateCache,
    handleMapPress,
    getPickerRegion,
    toggleMapPicker,
    resetCacheForm,
  };
};
