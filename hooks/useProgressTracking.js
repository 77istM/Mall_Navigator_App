import { useState, useEffect, useCallback } from 'react';
import { fetchEventProgress } from '../PrivateMode/services/PrivateModeService';

export const useProgressTracking = () => {
  const [progress, setProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const loadProgress = useCallback(async (eventId) => {
    if (!eventId) {
      return;
    }

    setProgressLoading(true);
    try {
      const ranking = await fetchEventProgress(eventId);
      setProgress(ranking);
    } catch (error) {
      console.warn('Failed to fetch event progress:', error?.message || error);
      setProgress([]);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  const refreshProgress = useCallback((eventId) => {
    return loadProgress(eventId);
  }, [loadProgress]);

  return {
    // State
    progress,
    progressLoading,
    // Handlers
    loadProgress,
    refreshProgress,
  };
};
