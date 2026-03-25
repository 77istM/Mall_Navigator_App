/**
 * Bearing Formula for Direction Calculation
 * Calculates initial bearing in degrees (0-359) from origin to target coordinates
 */
export const getBearingInDegrees = (fromLat, fromLon, toLat, toLon) => {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const toDegrees = (rad) => rad * (180 / Math.PI);

  const phi1 = toRadians(fromLat);
  const phi2 = toRadians(toLat);
  const deltaLambda = toRadians(toLon - fromLon);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return Math.round((toDegrees(theta) + 360) % 360);
};
