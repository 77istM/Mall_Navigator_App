export const normalizeHeading = (value) => ((value % 360) + 360) % 360;

export const calculateShortestTurnDelta = (fromHeading, toHeading) => {
  if (!Number.isFinite(fromHeading) || !Number.isFinite(toHeading)) {
    return null;
  }

  return ((toHeading - fromHeading + 540) % 360) - 180;
};

export const isWithinCompassThreshold = (delta, thresholdDegrees) => {
  if (!Number.isFinite(delta) || !Number.isFinite(thresholdDegrees)) {
    return false;
  }

  return Math.abs(delta) <= thresholdDegrees;
};