export const getDirectionStatus = ({ sensorError, hasDirection, isAligned, directionHint }) => {
  if (sensorError) {
    const fallbackWarning = /gps course|compass limited/i.test(sensorError);
    return { text: sensorError, tone: fallbackWarning ? 'warning' : 'error' };
  }

  if (isAligned) {
    return { text: 'On target', tone: 'success' };
  }

  if (hasDirection) {
    return { text: directionHint, tone: 'warning' };
  }

  return { text: 'Compass calibrating.', tone: 'warning' };
};

export const getMotionStatus = ({ stableMotionState }) => {
  if (!stableMotionState) {
    return { text: 'Motion data unavailable.', tone: 'warning' };
  }

  if (stableMotionState === 'stationary') {
    return { text: `State: ${stableMotionState}`, tone: 'warning' };
  }

  if (stableMotionState === 'walking' || stableMotionState === 'active') {
    return { text: `State: ${stableMotionState}`, tone: 'success' };
  }

  return { text: `State: ${stableMotionState}`, tone: 'info' };
};

export const getStepCounterStatus = ({ stepError, isStepCounterAvailable, sessionSteps }) => {
  if (stepError) {
    return { text: stepError, tone: 'error' };
  }

  if (isStepCounterAvailable) {
    const steps = Number.isFinite(sessionSteps) ? sessionSteps : 0;
    return { text: `Session steps: ${steps}`, tone: 'info' };
  }

  return { text: 'Step counter unavailable.', tone: 'warning' };
};

export const getCollapsedStatus = ({ isWithinRange }) => {
  if (isWithinRange) {
    return { text: 'Within discovery range. Slide up for details.', tone: 'success' };
  }

  return { text: 'Slide up to view guidance and cache actions.', tone: 'info' };
};
