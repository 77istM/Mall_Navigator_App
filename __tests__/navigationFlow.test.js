import { getGuidanceMode } from '../utils/navigationTrust';
import { buildDiscoveryIntegritySnapshot } from '../utils/navigationTrust';
import { normalizeRouteResponse } from '../utils/routeNormalization';

describe('navigation flow integration', () => {
  it('transitions guidance modes from sensor limited to gps fallback to compass', () => {
    const trustedLocation = { isTrusted: true };
    const degradedLocation = { isTrusted: false };

    expect(getGuidanceMode({ sensorAvailable: false, locationTrust: trustedLocation })).toBe('sensor-limited');
    expect(getGuidanceMode({ sensorAvailable: true, locationTrust: degradedLocation })).toBe('gps-fallback');
    expect(getGuidanceMode({ sensorAvailable: true, locationTrust: trustedLocation })).toBe('compass');
  });

  it('builds an integrity snapshot with radius and guidance metadata', () => {
    const snapshot = buildDiscoveryIntegritySnapshot({
      location: { timestamp: 1000 },
      locationTrust: { score: 80, isTrusted: true, isStale: false, isSuspicious: false, speedMps: 1.2, jumpMeters: 5 },
      distanceToCache: 27,
      discoveryRadius: 30,
      targetBearing: 90,
      turnDelta: -15,
      motionState: 'walking',
      motionMagnitude: 0.12,
      guidanceMode: 'route',
      now: 2000,
    });

    expect(snapshot.FindIntegrityWithinRadius).toBe(true);
    expect(snapshot.FindIntegrityDiscoveryRadiusMeters).toBe(30);
    expect(snapshot.FindIntegrityGuidanceMode).toBe('route');
    expect(snapshot.FindIntegrityLocationAgeMs).toBe(1000);
  });

  it('normalizes a route response into route summary data', () => {
    const normalized = normalizeRouteResponse({
      routes: [
        {
          geometry: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
          distance: 1234,
          duration: 321,
          legs: [
            {
              steps: [
                {
                  distance: 100,
                  duration: 20,
                  maneuver: {
                    instruction: 'Turn',
                    modifier: 'left',
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(normalized).toMatchObject({
      distanceMeters: 1234,
      durationSeconds: 321,
      nextManeuver: 'Turn left',
    });
    expect(normalized.geometry).toHaveLength(3);
  });
});