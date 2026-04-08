import {
  createPrivateEvent,
  joinEvent,
  createEventCache,
  getEventLeaderboard,
} from '../../api';

export const normalizeEventId = (value) => {
  const numericEventId = Number(value);
  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    return null;
  }
  return numericEventId;
};

export const joinPrivateEvent = (userId, eventId) => {
  return joinEvent(Number(userId), Number(eventId));
};

export const createPrivateModeEvent = (eventPayload) => {
  return createPrivateEvent(eventPayload);
};

export const extractCreatedEventId = (response) => {
  const rawEventId = response?.EventID ?? response?.[0]?.EventID ?? null;
  return normalizeEventId(rawEventId);
};

export const createPrivateModeCache = (eventId, cachePayload) => {
  return createEventCache(eventId, cachePayload);
};

export const fetchEventProgress = (eventId) => {
  return getEventLeaderboard(eventId);
};
