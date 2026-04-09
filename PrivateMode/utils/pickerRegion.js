import { WORLD_PICKER_REGION } from '../constants/PrivateModeConstants';

export const buildPickerRegion = (cacheLatitude, cacheLongitude) => {
  const hasLatitude = cacheLatitude !== null && cacheLatitude !== undefined && String(cacheLatitude).trim() !== '';
  const hasLongitude = cacheLongitude !== null && cacheLongitude !== undefined && String(cacheLongitude).trim() !== '';

  if (!hasLatitude || !hasLongitude) {
    return WORLD_PICKER_REGION;
  }

  const latitude = Number(cacheLatitude);
  const longitude = Number(cacheLongitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  return WORLD_PICKER_REGION;
};