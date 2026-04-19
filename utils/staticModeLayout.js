export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const normalizeLayoutPoint = ({ x, y, width, height }) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: clamp(x / width, 0, 1),
    y: clamp(y / height, 0, 1),
  };
};

export const denormalizeLayoutPoint = ({ x, y }, width, height) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: clamp(x, 0, 1) * width,
    y: clamp(y, 0, 1) * height,
  };
};

export const getLayoutDistance = (fromPoint, toPoint) => {
  if (!fromPoint || !toPoint) {
    return null;
  }

  const deltaX = toPoint.x - fromPoint.x;
  const deltaY = toPoint.y - fromPoint.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

export const getSegmentGeometry = (fromPoint, toPoint, width, height) => {
  if (!fromPoint || !toPoint || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  const start = denormalizeLayoutPoint(fromPoint, width, height);
  const end = denormalizeLayoutPoint(toPoint, width, height);

  if (!start || !end) {
    return null;
  }

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  return {
    left: start.x,
    top: start.y,
    width: length,
    transform: [{ rotate: `${angle}deg` }],
  };
};