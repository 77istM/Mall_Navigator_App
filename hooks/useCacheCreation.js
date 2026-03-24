import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { createPrivateModeCache } from '../PrivateMode/services/PrivateModeService';
import { validateCacheForm, parsePositiveNumber } from '../PrivateMode/validation/PrivateModeValidation';
import { TEST_IMAGE_URL, WORLD_PICKER_REGION, DEFAULT_CACHE_POINTS } from '../PrivateMode/constants/PrivateModeConstants';

export const useCacheCreation = () => {
  const [cacheName, setCacheName] = useState('');
  const [cacheClue, setCacheClue] = useState('');
  const [cacheDescription, setCacheDescription] = useState('');
  const [cacheImageURL, setCacheImageURL] = useState(TEST_IMAGE_URL);
  const [cacheLatitude, setCacheLatitude] = useState('');
  const [cacheLongitude, setCacheLongitude] = useState('');
  const [cachePoints, setCachePoints] = useState(DEFAULT_CACHE_POINTS);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);

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
      return Alert.alert('Error', cacheFormError);
    }

    const latitude = Number(cacheLatitude);
    const longitude = Number(cacheLongitude);
    const points = parsePositiveNumber(cachePoints);

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

      Alert.alert('Success', 'Cache created for this private event.');
      resetCacheForm();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create cache.');
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
  }, []);

  const getPickerRegion = useCallback(() => {
    const latitude = Number(cacheLatitude);
    const longitude = Number(cacheLongitude);

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      return {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    return WORLD_PICKER_REGION;
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
    // Setters
    setCacheName,
    setCacheClue,
    setCacheDescription,
    setCacheImageURL,
    setCacheLatitude,
    setCacheLongitude,
    setCachePoints,
    // Handlers
    handleCreateCache,
    handleMapPress,
    getPickerRegion,
    toggleMapPicker,
    resetCacheForm,
  };
};
