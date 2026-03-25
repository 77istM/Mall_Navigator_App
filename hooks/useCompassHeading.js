import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';
import { COMPASS_SETTINGS } from '../constants/appConstants';

/**
 * Custom Hook: useCompassHeading
 * Tracks magnetic heading using device magnetometer.
 * @returns {Object} { heading, isHeadingAvailable, sensorError }
 */
export const useCompassHeading = () => {
  const [heading, setHeading] = useState(null);
  const [isHeadingAvailable, setIsHeadingAvailable] = useState(false);
  const [sensorError, setSensorError] = useState(null);

  useEffect(() => {
    let subscription;

    const startCompass = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable) {
          setIsHeadingAvailable(false);
          setSensorError('Compass sensor not available on this device.');
          return;
        }

        setIsHeadingAvailable(true);
        setSensorError(null);

        Magnetometer.setUpdateInterval(COMPASS_SETTINGS.UPDATE_INTERVAL_MS);

        subscription = Magnetometer.addListener(({ x, y }) => {
          // Convert magnetic vector to a compass heading in degrees (0-359)
          const headingInDegrees = (Math.atan2(y, x) * 180) / Math.PI;
          const normalizedHeading = Math.round((headingInDegrees + 360) % 360);
          setHeading(normalizedHeading);
        });
      } catch (err) {
        console.error('Compass sensor error:', err);
        setSensorError(err.message || 'Failed to initialize compass sensor.');
        setIsHeadingAvailable(false);
      }
    };

    startCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    heading,
    isHeadingAvailable,
    sensorError,
  };
};

export default useCompassHeading;
