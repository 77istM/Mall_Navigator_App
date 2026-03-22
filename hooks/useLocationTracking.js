import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { LOCATION_PERMISSIONS } from '../constants/appConstants';

/**
 * Custom Hook: useLocationTracking
 * Handles all location permission and tracking logic
 * @returns {Object} { location, loading, error }
 */
export const useLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let locationSubscription;

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

        // 2. Start watching the user's location continuously
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: LOCATION_PERMISSIONS.TIME_INTERVAL,
            distanceInterval: LOCATION_PERMISSIONS.DISTANCE_INTERVAL,
          },
          (newLocation) => {
            setLocation(newLocation.coords);
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
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return { location, loading, error };
};
