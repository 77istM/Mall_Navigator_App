const asPositiveNumber = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const parsePositiveNumber = asPositiveNumber;

export const validateInviteCode = (inviteCode) => {
  const code = inviteCode.trim();
  const numericEventId = Number(code);

  if (!code || Number.isNaN(numericEventId) || numericEventId <= 0) {
    return 'Enter a valid numeric invite code shared by the event owner.';
  }

  return null;
};

export const validateEventForm = ({ eventName, startInHours, durationHours }) => {
  const trimmedName = eventName.trim();
  const startOffset = Number(startInHours);
  const duration = asPositiveNumber(durationHours);

  if (!trimmedName) {
    return 'Event name is required.';
  }
  if (trimmedName.length < 8) {
    return 'Event name must be at least 8 characters long.';
  }
  if (Number.isNaN(startOffset) || startOffset < 0) {
    return 'Start offset hours must be 0 or more.';
  }
  if (!duration) {
    return 'Duration must be a positive number of hours.';
  }

  return null;
};

export const validateCacheForm = ({
  cacheName,
  cacheClue,
  cacheDescription,
  cacheLatitude,
  cacheLongitude,
  cachePoints,
}) => {
  const trimmedCacheName = cacheName.trim();
  const trimmedCacheClue = cacheClue.trim();
  const trimmedCacheDescription = cacheDescription.trim();
  const latitude = Number(cacheLatitude);
  const longitude = Number(cacheLongitude);
  const points = asPositiveNumber(cachePoints);

  if (!trimmedCacheName || !trimmedCacheClue) {
    return 'Cache name and clue are required.';
  }
  if (trimmedCacheClue.length < 4) {
    return 'Cache clue must be at least 4 characters long.';
  }
  if (!trimmedCacheDescription) {
    return 'Cache description is required.';
  }
  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return 'Latitude must be a valid value between -90 and 90.';
  }
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return 'Longitude must be a valid value between -180 and 180.';
  }
  if (!points) {
    return 'Cache points must be a positive number.';
  }

  return null;
};
