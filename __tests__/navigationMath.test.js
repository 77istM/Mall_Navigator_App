import { calculateShortestTurnDelta, isWithinCompassThreshold, normalizeHeading } from '../utils/navigationMath';

describe('navigationMath', () => {
  it('wraps turn deltas across 0/360 degrees', () => {
    expect(calculateShortestTurnDelta(10, 350)).toBe(-20);
    expect(calculateShortestTurnDelta(350, 10)).toBe(20);
    expect(calculateShortestTurnDelta(45, 45)).toBe(0);
  });

  it('evaluates compass threshold boundaries', () => {
    expect(isWithinCompassThreshold(5, 5)).toBe(true);
    expect(isWithinCompassThreshold(6, 5)).toBe(false);
    expect(isWithinCompassThreshold(-4, 5)).toBe(true);
  });

  it('normalizes headings into the 0-359 range', () => {
    expect(normalizeHeading(-10)).toBe(350);
    expect(normalizeHeading(370)).toBe(10);
  });
});