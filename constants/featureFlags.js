const ROLLOUT_STAGES = {
  ACCURACY: 'accuracy',
  ANTI_CHEAT: 'anti-cheat',
  ROUTE: 'route',
};

const normalizeStage = (value) => {
  const nextValue = String(value || '').trim().toLowerCase();

  if (nextValue === ROLLOUT_STAGES.ACCURACY) {
    return ROLLOUT_STAGES.ACCURACY;
  }

  if (nextValue === ROLLOUT_STAGES.ANTI_CHEAT) {
    return ROLLOUT_STAGES.ANTI_CHEAT;
  }

  if (nextValue === ROLLOUT_STAGES.ROUTE) {
    return ROLLOUT_STAGES.ROUTE;
  }

  return ROLLOUT_STAGES.ROUTE;
};

const DEFAULT_ROLLOUT_STAGE = ROLLOUT_STAGES.ROUTE;

export const resolveRolloutStage = (value = DEFAULT_ROLLOUT_STAGE) => normalizeStage(value);

export const getRolloutFlags = (stage = resolveRolloutStage()) => ({
  rolloutStage: stage,
  accuracyEnabled: true,
  antiCheatEnabled: stage === ROLLOUT_STAGES.ANTI_CHEAT || stage === ROLLOUT_STAGES.ROUTE,
  routeEnabled: stage === ROLLOUT_STAGES.ROUTE,
});

export const GEOQUEST_ROLLOUT_FLAGS = getRolloutFlags(DEFAULT_ROLLOUT_STAGE);
export { ROLLOUT_STAGES };