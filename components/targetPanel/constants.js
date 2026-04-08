// Panel state enum
export const PANEL_STATES = {
  COLLAPSED: 'collapsed',
  HALF: 'half',
  FULL: 'full',
};

// Panel dimensions
export const COLLAPSED_PANEL_VISIBLE_HEIGHT = 132;
export const HALF_SCREEN_HEIGHT_RATIO = 0.5; // Half-screen panel at 50% of available height

// Gesture tuning
export const PANEL_DRAG_START_THRESHOLD = 6;
export const PANEL_SNAP_VELOCITY_THRESHOLD = 0.45;
export const PANEL_HIGH_VELOCITY_THRESHOLD = 0.6; // Velocity threshold for state skipping
