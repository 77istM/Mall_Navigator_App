import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { ACCELEROMETER_SETTINGS, MOTION_FEATURES } from '../constants/appConstants';

/**
 * Custom Hook: useMotionTracking
 * Passive accelerometer tracking for movement awareness.
 * @returns {Object} { x, y, z, magnitude, smoothedMagnitude, motionState, isAvailable, sensorError }
 */
export const useMotionTracking = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const [magnitude, setMagnitude] = useState(0);
  const [smoothedMagnitude, setSmoothedMagnitude] = useState(0);
  const [motionState, setMotionState] = useState('unknown');
  const [isAvailable, setIsAvailable] = useState(false);
  const [sensorError, setSensorError] = useState(null);

  const smoothedMagnitudeRef = useRef(0);

  const classifyMotionState = (value) => {
    if (value < ACCELEROMETER_SETTINGS.STATIONARY_THRESHOLD) {
      return 'stationary';
    }

    if (value >= ACCELEROMETER_SETTINGS.ACTIVE_MOVEMENT_THRESHOLD) {
      return 'active';
    }

    return 'walking';
  };

  useEffect(() => {
    let subscription;

    const startMotionTracking = async () => {
      if (!MOTION_FEATURES.ENABLE_ACCELEROMETER) {
        setIsAvailable(false);
        setMotionState('disabled');
        return;
      }

      try {
        const available = await Accelerometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          setSensorError('Accelerometer not available on this device.');
          setMotionState('unavailable');
          return;
        }

        setSensorError(null);
        Accelerometer.setUpdateInterval(ACCELEROMETER_SETTINGS.UPDATE_INTERVAL_MS);

        subscription = Accelerometer.addListener((data) => {
          const nextX = data?.x ?? 0;
          const nextY = data?.y ?? 0;
          const nextZ = data?.z ?? 0;

          setX(nextX);
          setY(nextY);
          setZ(nextZ);

          const rawMagnitude = Math.sqrt(
            nextX * nextX +
            nextY * nextY +
            nextZ * nextZ
          );

          // Remove gravity baseline (~1g) so movement intensity is easier to reason about.
          const gravityAdjustedMagnitude = Math.abs(rawMagnitude - 1);
          setMagnitude(Number(gravityAdjustedMagnitude.toFixed(4)));

          const previousSmoothed = smoothedMagnitudeRef.current;
          const smoothed =
            previousSmoothed * (1 - ACCELEROMETER_SETTINGS.SMOOTHING_FACTOR) +
            gravityAdjustedMagnitude * ACCELEROMETER_SETTINGS.SMOOTHING_FACTOR;

          smoothedMagnitudeRef.current = smoothed;
          setSmoothedMagnitude(Number(smoothed.toFixed(4)));
          setMotionState(classifyMotionState(smoothed));
        });
      } catch (error) {
        console.error('Motion tracking error:', error);
        setSensorError(error?.message || 'Failed to initialize accelerometer.');
        setIsAvailable(false);
        setMotionState('error');
      }
    };

    startMotionTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      smoothedMagnitudeRef.current = 0;
    };
  }, []);

  return {
    x,
    y,
    z,
    magnitude,
    smoothedMagnitude,
    motionState,
    isAvailable,
    sensorError,
  };
};

export default useMotionTracking;
