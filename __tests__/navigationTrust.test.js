import {
  createInitialLocationTrust,
  evaluateDiscoveryLogAttempt,
  evaluateLocationStaleness,
  evaluateLocationTrust,
} from '../utils/navigationTrust';

describe('navigationTrust', () => {
  it('keeps a first fix trusted', () => {
    const trust = evaluateLocationTrust({
      previousFix: null,
      currentFix: {
        latitude: 40,
        longitude: -73,
      },
      now: 1000,
    });

    expect(trust.isTrusted).toBe(true);
    expect(trust.score).toBe(100);
    expect(trust.lastFixAt).toBe(1000);
  });

  it('flags implausible jumps as suspicious', () => {
    const trust = evaluateLocationTrust({
      previousFix: {
        latitude: 40,
        longitude: -73,
        timestamp: 1000,
      },
      currentFix: {
        latitude: 41,
        longitude: -72,
      },
      now: 2000,
    });

    expect(trust.isTrusted).toBe(false);
    expect(trust.isSuspicious).toBe(true);
    expect(trust.warningText).toContain('Location signal limited');
  });

  it('marks stale fixes with actionable guidance', () => {
    const stale = evaluateLocationStaleness(0, 16001);
    expect(stale.isStale).toBe(true);
    expect(stale.warningText).toContain('stale');
  });

  it('returns a neutral initial trust snapshot', () => {
    expect(createInitialLocationTrust()).toMatchObject({
      score: 100,
      isTrusted: true,
      isStale: false,
      isSuspicious: false,
    });
  });

  it('gates discovery logging by radius and trust', () => {
    const selectedCache = { CacheID: 1 };
    const trustedLocation = { isTrusted: true, isStale: false };

    expect(
      evaluateDiscoveryLogAttempt({
        selectedCache,
        distanceToCache: 29,
        discoveryRadius: 30,
        locationTrust: trustedLocation,
        lastLogAttemptAt: null,
        now: 0,
      }),
    ).toMatchObject({ canLog: true });

    expect(
      evaluateDiscoveryLogAttempt({
        selectedCache,
        distanceToCache: 31,
        discoveryRadius: 30,
        locationTrust: trustedLocation,
        lastLogAttemptAt: null,
        now: 0,
      }),
    ).toMatchObject({ canLog: false });

    expect(
      evaluateDiscoveryLogAttempt({
        selectedCache,
        distanceToCache: 10,
        discoveryRadius: 30,
        locationTrust: { isTrusted: false, isStale: false, warningText: 'Location signal limited.' },
        lastLogAttemptAt: null,
        now: 0,
      }),
    ).toMatchObject({ canLog: false });
  });
});