import { getDistanceInMeters } from './distanceCalculator';
import { GUIDANCE_MODE, NAVIGATION_TRUST } from '../constants/appConstants';

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

export const createInitialLocationTrust = () => ({
  score: 100,
  isTrusted: true,
  isStale: false,
  isSuspicious: false,
  warningText: null,
  speedMps: null,
  jumpMeters: null,
  lastFixAt: null,
});

export const evaluateLocationTrust = ({ previousFix, currentFix, now = Date.now() }) => {
  if (!currentFix) {
    return createInitialLocationTrust();
  }

  if (!previousFix) {
    return {
      ...createInitialLocationTrust(),
      lastFixAt: now,
    };
  }

  const elapsedMs = Math.max(now - previousFix.timestamp, 1);
  const jumpMeters = getDistanceInMeters(
    previousFix.latitude,
    previousFix.longitude,
    currentFix.latitude,
    currentFix.longitude,
  );
  const speedMps = jumpMeters / (elapsedMs / 1000);

  const suspiciousJump = jumpMeters > NAVIGATION_TRUST.MAX_LOCATION_JUMP_METERS;
  const implausibleSpeed = speedMps > NAVIGATION_TRUST.MAX_PLAUSIBLE_SPEED_MPS;
  const extremeSpeed = speedMps > NAVIGATION_TRUST.MAX_JUMP_SPEED_MPS;

  let score = 100;
  const reasons = [];

  if (suspiciousJump) {
    score -= 35;
    reasons.push(`jumped ${Math.round(jumpMeters)}m`);
  }

  if (implausibleSpeed) {
    score -= 25;
    reasons.push(`speed ${speedMps.toFixed(1)}m/s`);
  }

  if (extremeSpeed) {
    score -= 20;
    reasons.push('speed spike');
  }

  const normalizedScore = clampScore(score);
  const isTrusted = normalizedScore >= NAVIGATION_TRUST.LOW_TRUST_THRESHOLD;

  return {
    score: normalizedScore,
    isTrusted,
    isStale: false,
    isSuspicious: !isTrusted,
    warningText: reasons.length > 0
      ? `Location signal limited (${reasons[0]}).`
      : null,
    speedMps,
    jumpMeters,
    lastFixAt: now,
  };
};

export const evaluateLocationStaleness = (lastFixAt, now = Date.now()) => {
  if (!lastFixAt) {
    return {
      isStale: false,
      warningText: null,
    };
  }

  const ageMs = now - lastFixAt;

  if (ageMs > NAVIGATION_TRUST.MAX_LOCATION_AGE_MS) {
    return {
      isStale: true,
      warningText: 'Location fix is stale. Waiting for a fresh GPS update.',
    };
  }

  return {
    isStale: false,
    warningText: null,
  };
};

export const getGuidanceMode = ({ sensorAvailable, locationTrust }) => {
  if (!sensorAvailable) {
    return GUIDANCE_MODE.SENSOR_LIMITED;
  }

  if (locationTrust && !locationTrust.isTrusted) {
    return GUIDANCE_MODE.GPS_FALLBACK;
  }

  return GUIDANCE_MODE.COMPASS;
};