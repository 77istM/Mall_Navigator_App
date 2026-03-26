/**
 * App-wide constants
 */
export const DISCOVERY_RADIUS = 5000000; // User must be within 5000000 meters to log

export const LOCATION_PERMISSIONS = {
  HIGH_ACCURACY: true,
  TIME_INTERVAL: 5000, // Update every 5 seconds
  DISTANCE_INTERVAL: 5, // Or every 5 meters
};

export const MAP_REGION = {
  LATITUDE_DELTA: 0.01, // Zoomed in a bit closer for walking
  LONGITUDE_DELTA: 0.01,
};

export const PLAYER_ID = 3; // Dummy player ID for testing

export const COMPASS_SETTINGS = {
  ON_TARGET_THRESHOLD_DEGREES: 10,
  UPDATE_INTERVAL_MS: 1000,
};

export const CAMERA_CAPTURE_SETTINGS = {
  ALLOWS_EDITING: true,
  ASPECT: [4, 3],
  QUALITY: 0.7,
};

export const MOTION_FEATURES = {
  ENABLE_ACCELEROMETER: true,
  ENABLE_PEDOMETER: false,
};

export const ACCELEROMETER_SETTINGS = {
  UPDATE_INTERVAL_MS: 300,
  SMOOTHING_FACTOR: 0.2,
  STATIONARY_THRESHOLD: 0.08,
  ACTIVE_MOVEMENT_THRESHOLD: 0.22,
};

export const STEP_COUNTER_SETTINGS = {
  DEFAULT_DAILY_STEP_GOAL: 5000,
  MIN_STEPS_FOR_MOVEMENT_CONFIDENCE: 20,
};
