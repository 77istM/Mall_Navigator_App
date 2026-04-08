import {
  PANEL_SNAP_VELOCITY_THRESHOLD,
  PANEL_SWIPE_DISTANCE_THRESHOLD,
  PANEL_STATES,
} from './constants';

/**
 * Clamps offset value between 0 and max value (supports 3 snap points)
 */
export const clampPanelOffset = (value, maxOffset) => {
  return Math.min(Math.max(value, 0), maxOffset);
};

const getNextHigherState = (currentState) => {
  if (currentState === PANEL_STATES.COLLAPSED) {
    return PANEL_STATES.HALF;
  }

  return PANEL_STATES.FULL;
};

const getNextLowerState = (currentState) => {
  if (currentState === PANEL_STATES.FULL) {
    return PANEL_STATES.HALF;
  }

  return PANEL_STATES.COLLAPSED;
};

/**
 * Gets the next state from gesture direction and current state.
 * Upward swipe: collapsed -> half -> full
 * Downward swipe: full -> half -> collapsed
 */
export const getNextStateFromGesture = ({
  currentState,
  releaseOffset,
  deltaY,
  velocityY,
  collapsedOffset,
  halfOffset,
}) => {
  const isFastSwipe = Math.abs(velocityY) >= PANEL_SNAP_VELOCITY_THRESHOLD;
  const isLongSwipe = Math.abs(deltaY) >= PANEL_SWIPE_DISTANCE_THRESHOLD;

  if (isFastSwipe || isLongSwipe) {
    if (deltaY < 0 || velocityY < -PANEL_SNAP_VELOCITY_THRESHOLD) {
      return getNextHigherState(currentState);
    }

    if (deltaY > 0 || velocityY > PANEL_SNAP_VELOCITY_THRESHOLD) {
      return getNextLowerState(currentState);
    }
  }

  // Tiny / ambiguous drags snap to nearest state.
  return getNearestSnapPointState(releaseOffset, collapsedOffset, halfOffset);
};

/**
 * Determines the nearest snap point state based on current offset position
 */
export const getNearestSnapPointState = (offset, collapsedOffset, halfOffset) => {
  const snapPoints = [
    { offset: collapsedOffset, state: PANEL_STATES.COLLAPSED },
    { offset: halfOffset, state: PANEL_STATES.HALF },
    { offset: 0, state: PANEL_STATES.FULL },
  ];

  // Find closest snap point
  let nearest = snapPoints[0];
  let minDistance = Math.abs(offset - nearest.offset);

  for (let i = 1; i < snapPoints.length; i++) {
    const distance = Math.abs(offset - snapPoints[i].offset);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = snapPoints[i];
    }
  }

  return nearest.state;
};

/**
 * Converts panel state to animated offset value
 */
export const getOffsetForState = (state, collapsedOffset, halfOffset) => {
  switch (state) {
    case PANEL_STATES.COLLAPSED:
      return collapsedOffset;
    case PANEL_STATES.HALF:
      return halfOffset;
    case PANEL_STATES.FULL:
    default:
      return 0;
  }
};

