import { useEffect, useRef, useState } from 'react';
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
  const lastSmoothedHeadingRef = useRef(null);

  const normalizeHeading = (value) => ((value % 360) + 360) % 360;
  const getShortestDelta = (from, to) => ((to - from + 540) % 360) - 180;

  const smoothHeading = (rawHeading) => {
    const smoothingFactor = 0.2;
    const previousHeading = lastSmoothedHeadingRef.current;

    if (previousHeading === null) {
      return rawHeading;
    }

    const delta = getShortestDelta(previousHeading, rawHeading);
    const blendedHeading = normalizeHeading(previousHeading + delta * smoothingFactor);
    return blendedHeading;
  };

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
          const normalizedHeading = normalizeHeading(headingInDegrees);
          const smoothedHeading = smoothHeading(normalizedHeading);

          lastSmoothedHeadingRef.current = smoothedHeading;
          setHeading(Math.round(smoothedHeading));
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
      lastSmoothedHeadingRef.current = null;
    };
  }, []);

  return {
    heading,
    isHeadingAvailable,
    sensorError,
  };
};

export default useCompassHeading;
