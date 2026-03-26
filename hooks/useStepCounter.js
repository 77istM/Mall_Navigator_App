import { useEffect, useRef, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { MOTION_FEATURES } from '../constants/appConstants';

/**
 * Custom Hook: useStepCounter
 * Optional pedometer tracking for daily/session step counts.
 * @returns {Object} { isAvailable, permissionState, todaySteps, sessionSteps, stepError }
 */
export const useStepCounter = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [permissionState, setPermissionState] = useState('unknown');
  const [todaySteps, setTodaySteps] = useState(0);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [stepError, setStepError] = useState(null);

  const baselineRef = useRef(null);

  const getStartOfDay = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const refreshTodaySteps = async () => {
    try {
      const result = await Pedometer.getStepCountAsync(getStartOfDay(), new Date());
      setTodaySteps(result?.steps || 0);
      return result?.steps || 0;
    } catch (error) {
      console.warn('Unable to refresh today step count:', error?.message || error);
      return 0;
    }
  };

  useEffect(() => {
    let subscription;

    const initializePedometer = async () => {
      if (!MOTION_FEATURES.ENABLE_PEDOMETER) {
        setPermissionState('disabled');
        setIsAvailable(false);
        setTodaySteps(0);
        setSessionSteps(0);
        return;
      }

      try {
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          setPermissionState('unavailable');
          setStepError('Pedometer not available on this device.');
          return;
        }

        // Not all SDK/device combinations expose explicit permission methods.
        if (typeof Pedometer.getPermissionsAsync === 'function') {
          const currentPermission = await Pedometer.getPermissionsAsync();

          if (currentPermission?.status !== 'granted' && typeof Pedometer.requestPermissionsAsync === 'function') {
            const requestedPermission = await Pedometer.requestPermissionsAsync();
            setPermissionState(requestedPermission?.status || 'unknown');

            if (requestedPermission?.status !== 'granted') {
              setStepError('Motion permission denied for pedometer.');
              return;
            }
          } else {
            setPermissionState(currentPermission?.status || 'unknown');
          }
        } else {
          setPermissionState('not-required');
        }

        setStepError(null);

        const initialTodaySteps = await refreshTodaySteps();
        baselineRef.current = initialTodaySteps;
        setSessionSteps(0);

        subscription = Pedometer.watchStepCount((result) => {
          const latestSessionSteps = result?.steps || 0;
          setSessionSteps(latestSessionSteps);
          setTodaySteps((baselineRef.current || 0) + latestSessionSteps);
        });
      } catch (error) {
        console.error('Step counter initialization error:', error);
        setStepError(error?.message || 'Failed to initialize pedometer tracking.');
        setIsAvailable(false);
      }
    };

    initializePedometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      baselineRef.current = null;
    };
  }, []);

  return {
    isAvailable,
    permissionState,
    todaySteps,
    sessionSteps,
    stepError,
  };
};

export default useStepCounter;
