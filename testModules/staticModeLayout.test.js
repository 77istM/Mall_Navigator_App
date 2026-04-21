import {
  denormalizeLayoutPoint,
  getLayoutDistance,
  getSegmentGeometry,
  normalizeLayoutPoint,
} from '../utils/staticModeLayout';

describe('static mode layout helpers', () => {
  it('normalizes and denormalizes points using canvas bounds', () => {
    const normalized = normalizeLayoutPoint({ x: 50, y: 25, width: 100, height: 50 });

    expect(normalized).toEqual({ x: 0.5, y: 0.5 });
    expect(denormalizeLayoutPoint(normalized, 100, 50)).toEqual({ x: 50, y: 25 });
  });

  it('calculates image-space distance between points', () => {
    expect(getLayoutDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('builds segment geometry for overlay lines', () => {
    const geometry = getSegmentGeometry({ x: 0, y: 0 }, { x: 1, y: 0 }, 200, 100);

    expect(geometry).toEqual({
      left: 0,
      top: 0,
      width: 200,
      transform: [{ rotate: '0deg' }],
    });
  });
});