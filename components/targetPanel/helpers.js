import { PANEL_SNAP_VELOCITY_THRESHOLD, PANEL_HIGH_VELOCITY_THRESHOLD, PANEL_STATES } from './constants';

/**
 * Clamps offset value between 0 and max value (supports 3 snap points)
 */
export const clampPanelOffset = (value, maxOffset) => {
  return Math.min(Math.max(value, 0), maxOffset);
};

/**
 * Gets the next state from gesture velocity and current offset
 * Snaps to 3 states: collapsed, half, full
 */
export const getNextStateFromGesture = (
  releaseOffset,
  velocityY,
  collapsedOffset,
  halfOffset,
) => {
  // HIGH velocity: skip states
  if (velocityY > PANEL_HIGH_VELOCITY_THRESHOLD) {
    // Swiping up: cycle forward (collapsed → half → full)
    if (releaseOffset > halfOffset) return PANEL_STATES.HALF;
    if (releaseOffset > 0) return PANEL_STATES.FULL;
    return PANEL_STATES.FULL;
  }

  if (velocityY < -PANEL_HIGH_VELOCITY_THRESHOLD) {
    // Swiping down: cycle backward (full → half → collapsed)
    if (releaseOffset < halfOffset * 0.5) return PANEL_STATES.COLLAPSED;
    if (releaseOffset < halfOffset * 1.5) return PANEL_STATES.HALF;
    return PANEL_STATES.COLLAPSED;
  }

  // LOW velocity: snap to nearest state based on position
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

/**
 * Legacy function for backward compatibility - determines collapse state from release
 */
export const shouldCollapseFromRelease = (releaseOffset, velocityY, collapsedOffset) => {
  if (velocityY > PANEL_SNAP_VELOCITY_THRESHOLD) {
    return true;
  }

  if (velocityY < -PANEL_SNAP_VELOCITY_THRESHOLD) {
    return false;
  }

  return releaseOffset > collapsedOffset * 0.5;
};

/**
 * Legacy function for backward compatibility - determines collapse from offset
 */
export const shouldCollapseFromOffset = (offset, collapsedOffset) => {
  return offset > collapsedOffset * 0.5;
};
