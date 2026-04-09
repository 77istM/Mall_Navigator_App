import { GEOQUEST_ROLLOUT_FLAGS, getRolloutFlags, resolveRolloutStage } from '../constants/featureFlags';

describe('featureFlags', () => {
  it('resolves staged rollout values', () => {
    expect(getRolloutFlags('accuracy')).toMatchObject({
      rolloutStage: 'accuracy',
      accuracyEnabled: true,
      antiCheatEnabled: false,
      routeEnabled: false,
    });

    expect(getRolloutFlags('anti-cheat')).toMatchObject({
      rolloutStage: 'anti-cheat',
      accuracyEnabled: true,
      antiCheatEnabled: true,
      routeEnabled: false,
    });

    expect(getRolloutFlags('route')).toMatchObject({
      rolloutStage: 'route',
      accuracyEnabled: true,
      antiCheatEnabled: true,
      routeEnabled: true,
    });
  });

  it('defaults invalid stages to route rollout', () => {
    expect(resolveRolloutStage('unknown-stage')).toBe('route');
    expect(GEOQUEST_ROLLOUT_FLAGS.accuracyEnabled).toBe(true);
  });
});