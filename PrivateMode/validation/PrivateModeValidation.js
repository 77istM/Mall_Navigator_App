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
    return 'Enter a valid numeric invite code shared by the Location.';
  }

  return null;
};

export const validateEventForm = ({ eventName, eventDescription, startInHours, durationHours }) => {
  const trimmedName = eventName.trim();
  const trimmedDescription = (eventDescription || '').trim();
  const startOffset = Number(startInHours);
  const duration = asPositiveNumber(durationHours);

  if (!trimmedName) {
    return 'Location Name is required.';
  }
  if (trimmedName.length < 8) {
    return 'Location Name must be at least 8 characters long.';
  }
  if (trimmedDescription && trimmedDescription.length < 4) {
    return 'Event description must be at least 4 characters long.';
  }
  if (Number.isNaN(startOffset) || startOffset < 0) {
    return 'Start offset hours must be 0 or more.';
  }
  if (!duration) {
    return 'Duration must be a positive number of hours.';
  }

  return null;
};

export const validateDiscoveryRadius = (discoveryRadiusMeters) => {
  const parsedRadius = asPositiveNumber(discoveryRadiusMeters);

  if (!parsedRadius) {
    return 'Discovery radius must be a positive number of meters.';
  }

  if (parsedRadius < 5) {
    return 'Discovery radius is too small. Use at least 5 meters.';
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
    return 'Product name and clue are required.';
  }
  if (trimmedCacheName.length < 4) {
    return 'Product name must be at least 4 characters long.';
  }
  if (trimmedCacheClue.length < 4) {
    return 'Product clue must be at least 4 characters long.';
  }
  if (!trimmedCacheDescription) {
    return 'Product description is required.';
  }
  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return 'Latitude must be a valid value between -90 and 90.';
  }
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return 'Longitude must be a valid value between -180 and 180.';
  }
  if (!points) {
    return 'Product points must be a positive number.';
  }

  return null;
};
