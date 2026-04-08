import { useCallback, useRef } from 'react';

const DEFAULT_DEDUPE_WINDOW_MS = 15000;

const buildTelemetryKey = (eventName, payload) => {
  try {
    return `${eventName}:${JSON.stringify(payload || {})}`;
  } catch {
    return `${eventName}:unserializable`;
  }
};

export const useNavigationTelemetry = () => {
  const lastEventRef = useRef({ key: null, at: 0 });

  return useCallback((eventName, payload = {}, options = {}) => {
    if (!eventName) {
      return false;
    }

    const now = Date.now();
    const dedupeWindowMs = Number.isFinite(options.dedupeWindowMs)
      ? options.dedupeWindowMs
      : DEFAULT_DEDUPE_WINDOW_MS;
    const telemetryKey = options.dedupeKey || buildTelemetryKey(eventName, payload);
    const shouldDedupe = options.dedupe !== false;
    const isDuplicate = shouldDedupe
      && lastEventRef.current.key === telemetryKey
      && now - lastEventRef.current.at < dedupeWindowMs;

    if (isDuplicate) {
      return false;
    }

    lastEventRef.current = {
      key: telemetryKey,
      at: now,
    };

    const eventRecord = {
      eventName,
      timestamp: new Date(now).toISOString(),
      ...payload,
    };

    if (typeof globalThis !== 'undefined' && typeof globalThis.__NAVIGATION_TELEMETRY_HOOK__ === 'function') {
      try {
        globalThis.__NAVIGATION_TELEMETRY_HOOK__(eventRecord);
      } catch (error) {
        console.warn('Navigation telemetry hook failed:', error?.message || error);
      }
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const logger = options.level === 'warning' ? console.warn : console.info;
      logger(`[navigation] ${eventName}`, payload);
    }

    return true;
  }, []);
};

export default useNavigationTelemetry;