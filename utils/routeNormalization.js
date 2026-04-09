const decodePolyline = (encoded) => {
  const polyline = String(encoded || '');
  const coordinates = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < polyline.length) {
    let result = 0;
    let shift = 0;
    let byte = null;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLatitude = ((result & 1) ? ~(result >> 1) : (result >> 1));
    latitude += deltaLatitude;

    result = 0;
    shift = 0;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLongitude = ((result & 1) ? ~(result >> 1) : (result >> 1));
    longitude += deltaLongitude;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
};

const normalizeStepManeuver = (step) => {
  const maneuver = step?.maneuver || {};
  const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
  const instruction = maneuver.instruction || maneuver.type || 'Continue';
  return `${instruction}${modifier}`.trim();
};

export const normalizeRouteResponse = (response) => {
  const route = response?.routes?.[0];
  if (!route) {
    return null;
  }

  const legs = Array.isArray(route.legs) ? route.legs : [];
  const steps = legs.flatMap((leg) => Array.isArray(leg.steps) ? leg.steps : []);
  const maneuvers = steps
    .map((step, index) => ({
      index,
      instruction: normalizeStepManeuver(step),
      distanceMeters: Number(step?.distance) || 0,
      durationSeconds: Number(step?.duration) || 0,
    }))
    .filter((step) => Boolean(step.instruction));

  return {
    geometry: decodePolyline(route.geometry),
    distanceMeters: Number(route.distance) || 0,
    durationSeconds: Number(route.duration) || 0,
    nextManeuver: maneuvers[0]?.instruction || null,
    maneuvers,
  };
};
