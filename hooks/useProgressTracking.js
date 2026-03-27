import { useState, useEffect, useCallback } from 'react';
import { fetchEventProgress } from '../PrivateMode/services/PrivateModeService';

export const useProgressTracking = () => {
  const [progress, setProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [stepMetadataByPlayerId, setStepMetadataByPlayerId] = useState({});

  const mergeStepMetadata = useCallback((ranking, metadataMap) => {
    if (!Array.isArray(ranking) || ranking.length === 0) {
      return [];
    }

    return ranking.map((entry) => {
      const playerId = Number(entry?.playerId);
      const stepMetadata = !Number.isNaN(playerId) ? metadataMap[playerId] : undefined;

      // Keep existing ranking data intact and only enrich when step metadata exists.
      if (!stepMetadata) {
        return entry;
      }

      return {
        ...entry,
        stepMetadata,
      };
    });
  }, []);

  const loadProgress = useCallback(async (eventId) => {
    if (!eventId) {
      return;
    }

    setProgressLoading(true);
    try {
      const ranking = await fetchEventProgress(eventId);
      setProgress(mergeStepMetadata(ranking, stepMetadataByPlayerId));
    } catch (error) {
      console.warn('Failed to fetch event progress:', error?.message || error);
      setProgress([]);
    } finally {
      setProgressLoading(false);
    }
  }, [mergeStepMetadata, stepMetadataByPlayerId]);

  const setPlayerStepMetadata = useCallback((playerId, stepMetadata) => {
    const normalizedPlayerId = Number(playerId);
    if (Number.isNaN(normalizedPlayerId)) {
      return;
    }

    setStepMetadataByPlayerId((prev) => {
      const next = {
        ...prev,
        [normalizedPlayerId]: stepMetadata,
      };

      setProgress((currentProgress) => mergeStepMetadata(currentProgress, next));
      return next;
    });
  }, [mergeStepMetadata]);

  const refreshProgress = useCallback((eventId) => {
    return loadProgress(eventId);
  }, [loadProgress]);

  return {
    // State
    progress,
    progressLoading,
    stepMetadataByPlayerId,
    // Handlers
    loadProgress,
    refreshProgress,
    setPlayerStepMetadata,
  };
};
