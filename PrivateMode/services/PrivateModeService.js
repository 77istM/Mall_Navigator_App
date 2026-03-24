import {
  createPrivateEvent,
  joinEvent,
  createEventCache,
  getEventLeaderboard,
} from '../../api';

export const joinPrivateEvent = (userId, eventId) => {
  return joinEvent(Number(userId), Number(eventId));
};

export const createPrivateModeEvent = (eventPayload) => {
  return createPrivateEvent(eventPayload);
};

export const extractCreatedEventId = (response) => {
  return response?.EventID ?? response?.[0]?.EventID ?? null;
};

export const createPrivateModeCache = (eventId, cachePayload) => {
  return createEventCache(eventId, cachePayload);
};

export const fetchEventProgress = (eventId) => {
  return getEventLeaderboard(eventId);
};
