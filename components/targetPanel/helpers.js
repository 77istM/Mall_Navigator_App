import { PANEL_SNAP_VELOCITY_THRESHOLD } from './constants';

export const clampPanelOffset = (value, collapsedOffset) => {
  return Math.min(Math.max(value, 0), collapsedOffset);
};

export const shouldCollapseFromRelease = (releaseOffset, velocityY, collapsedOffset) => {
  if (velocityY > PANEL_SNAP_VELOCITY_THRESHOLD) {
    return true;
  }

  if (velocityY < -PANEL_SNAP_VELOCITY_THRESHOLD) {
    return false;
  }

  return releaseOffset > collapsedOffset * 0.5;
};

export const shouldCollapseFromOffset = (offset, collapsedOffset) => {
  return offset > collapsedOffset * 0.5;
};
