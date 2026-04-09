import {
  clampPanelOffset,
  getNextStateFromGesture,
  getNearestSnapPointState,
  getOffsetForState,
} from '../components/targetPanel/helpers';
import { PANEL_STATES } from '../components/targetPanel/constants';

describe('targetPanel gesture helpers', () => {
  const collapsedOffset = 600;
  const halfOffset = 300;

  describe('getNextStateFromGesture', () => {
    it('moves one level up on upward swipe', () => {
      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.COLLAPSED,
          releaseOffset: 540,
          deltaY: -50,
          velocityY: -0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.HALF);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 240,
          deltaY: -50,
          velocityY: -0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.FULL);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.FULL,
          releaseOffset: 0,
          deltaY: -50,
          velocityY: -0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.FULL);
    });

    it('moves one level down on downward swipe', () => {
      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.FULL,
          releaseOffset: 80,
          deltaY: 48,
          velocityY: 0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.HALF);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 380,
          deltaY: 48,
          velocityY: 0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.COLLAPSED);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.COLLAPSED,
          releaseOffset: collapsedOffset,
          deltaY: 48,
          velocityY: 0.1,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.COLLAPSED);
    });

    it('treats fast swipes as transitions even with short distance', () => {
      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 280,
          deltaY: -5,
          velocityY: -0.7,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.FULL);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 320,
          deltaY: 5,
          velocityY: 0.7,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.COLLAPSED);
    });

    it('snaps tiny ambiguous drags to nearest state', () => {
      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 280,
          deltaY: 5,
          velocityY: 0.05,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.HALF);

      expect(
        getNextStateFromGesture({
          currentState: PANEL_STATES.HALF,
          releaseOffset: 40,
          deltaY: -2,
          velocityY: -0.05,
          collapsedOffset,
          halfOffset,
        }),
      ).toBe(PANEL_STATES.FULL);
    });
  });

  it('finds nearest snap point state', () => {
    expect(getNearestSnapPointState(580, collapsedOffset, halfOffset)).toBe(PANEL_STATES.COLLAPSED);
    expect(getNearestSnapPointState(310, collapsedOffset, halfOffset)).toBe(PANEL_STATES.HALF);
    expect(getNearestSnapPointState(20, collapsedOffset, halfOffset)).toBe(PANEL_STATES.FULL);
  });

  it('maps panel state to offsets correctly', () => {
    expect(getOffsetForState(PANEL_STATES.COLLAPSED, collapsedOffset, halfOffset)).toBe(600);
    expect(getOffsetForState(PANEL_STATES.HALF, collapsedOffset, halfOffset)).toBe(300);
    expect(getOffsetForState(PANEL_STATES.FULL, collapsedOffset, halfOffset)).toBe(0);
  });

  it('clamps panel offset correctly', () => {
    expect(clampPanelOffset(-20, 500)).toBe(0);
    expect(clampPanelOffset(250, 500)).toBe(250);
    expect(clampPanelOffset(700, 500)).toBe(500);
  });
});
