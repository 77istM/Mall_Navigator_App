import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, ScrollView } from 'react-native';
import { MOTION_GUIDANCE_SETTINGS } from '../constants/appConstants';
import {
  COLLAPSED_PANEL_VISIBLE_HEIGHT,
  PANEL_DRAG_START_THRESHOLD,
  PANEL_STATES,
  HALF_SCREEN_HEIGHT_RATIO,
} from './targetPanel/constants';
import {
  clampPanelOffset,
  getNextStateFromGesture,
  getOffsetForState,
} from './targetPanel/helpers';
import styles from './targetPanel/styles';
import PanelHandleSection from './targetPanel/PanelHandleSection';
import CollapsedSummarySection from './targetPanel/CollapsedSummarySection';
import ExpandedPanelContent from './targetPanel/ExpandedPanelContent';
import {
  getCollapsedStatus,
  getDirectionStatus,
  getMotionStatus,
  getStepCounterStatus,
} from './targetPanel/statusHelpers';

/**
 * TargetPanel Component
 * Displays the selected cache details and log discovery button
 */
export const TargetPanel = ({
  selectedCache,
  distanceToCache,
  heading,
  isHeadingAvailable,
  sensorError,
  motionState,
  motionMagnitude,
  sessionSteps,
  isStepCounterAvailable,
  stepError,
  targetBearing,
  turnDelta,
  isAligned,
  directionHint,
  headingSource,
  calibrationHelpText,
  guidanceWarningText,
  logAttemptReason,
  distanceTrendText,
  distanceTrendTone,
  routeMode,
  guidanceModeLabel,
  guidanceModeTone,
  routeSummary,
  routeLoading,
  routeError,
  discoveryRadius,
  isWithinRange,
  isLogging,
  capturedImage,
  isCapturing,
  captureError,
  panelState = PANEL_STATES.COLLAPSED,
  onStateChange,
  availableScreenHeight = 0,
  onCaptureProof,
  onClearProof,
  onLogDiscovery,
}) => {
  const [stableMotionState, setStableMotionState] = useState(motionState || 'unknown');
  const [panelHeight, setPanelHeight] = useState(0);
  const panelTranslateY = useRef(new Animated.Value(0)).current;
  const dragStartOffsetRef = useRef(0);
  const activeAnimationRef = useRef(null);

  useEffect(() => {
    if (!motionState) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setStableMotionState(motionState);
    }, MOTION_GUIDANCE_SETTINGS.HINT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [motionState]);

  const collapsedOffset = Math.max(panelHeight - COLLAPSED_PANEL_VISIBLE_HEIGHT, 0);
  const halfOffset = Math.max(collapsedOffset * HALF_SCREEN_HEIGHT_RATIO, 0);
  const fullPanelHeight = availableScreenHeight > 0
    ? Math.round(availableScreenHeight * 0.75)
    : undefined;

  const animatePanelTo = (toValue) => {
    if (activeAnimationRef.current) {
      activeAnimationRef.current.stop();
    }

    const nextAnimation = Animated.timing(panelTranslateY, {
      toValue,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    activeAnimationRef.current = nextAnimation;
    nextAnimation.start(({ finished }) => {
      if (finished) {
        activeAnimationRef.current = null;
      }
    });
  };

  // Animate panel to current state's offset
  useEffect(() => {
    const targetOffset = getOffsetForState(panelState, collapsedOffset, halfOffset);
    animatePanelTo(targetOffset);
  }, [panelState, collapsedOffset, halfOffset, panelTranslateY]);

  const panelPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gestureState) => {
        if (collapsedOffset <= 0) {
          return false;
        }

        return Math.abs(gestureState.dy) > PANEL_DRAG_START_THRESHOLD;
      },
      onPanResponderGrant: () => {
        panelTranslateY.stopAnimation((currentValue) => {
          dragStartOffsetRef.current = currentValue;
        });
      },
      onPanResponderMove: (_event, gestureState) => {
        const maxOffset = Math.max(collapsedOffset, halfOffset);
        const nextOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          maxOffset,
        );

        panelTranslateY.setValue(nextOffset);
      },
      onPanResponderRelease: (_event, gestureState) => {
        if (collapsedOffset <= 0) {
          return;
        }

        const maxOffset = Math.max(collapsedOffset, halfOffset);
        const releaseOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          maxOffset,
        );
        const nextState = getNextStateFromGesture({
          currentState: panelState,
          releaseOffset,
          deltaY: gestureState.dy,
          velocityY: gestureState.vy,
          collapsedOffset,
          halfOffset,
        });
        const targetOffset = getOffsetForState(nextState, collapsedOffset, halfOffset);

        animatePanelTo(targetOffset);
        onStateChange?.(nextState);
      },
      onPanResponderTerminate: (_event, gestureState) => {
        if (collapsedOffset <= 0) {
          return;
        }

        const maxOffset = Math.max(collapsedOffset, halfOffset);
        const terminateOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          maxOffset,
        );
        const nextState = getNextStateFromGesture({
          currentState: panelState,
          releaseOffset: terminateOffset,
          deltaY: gestureState.dy,
          velocityY: gestureState.vy,
          collapsedOffset,
          halfOffset,
        });
        const targetOffset = getOffsetForState(nextState, collapsedOffset, halfOffset);

        animatePanelTo(targetOffset);
        onStateChange?.(nextState);
      },
    });
  }, [collapsedOffset, halfOffset, onStateChange, panelState, panelTranslateY]);

  if (!selectedCache) {
    return null;
  }

  const hasDirection = isHeadingAvailable && turnDelta !== null && !!directionHint;
  const isPanelBusy = isLogging || isCapturing;
  const directionStatus = useMemo(
    () => getDirectionStatus({ sensorError, hasDirection, isAligned, directionHint }),
    [sensorError, hasDirection, isAligned, directionHint],
  );
  const motionStatus = useMemo(
    () => getMotionStatus({ stableMotionState }),
    [stableMotionState],
  );
  const motionMagnitudeText = useMemo(
    () => (Number.isFinite(motionMagnitude) ? `Intensity: ${motionMagnitude.toFixed(3)}` : 'Intensity: -'),
    [motionMagnitude],
  );
  const motionAdvisoryText = useMemo(() => {
    const hasMotionMagnitude = Number.isFinite(motionMagnitude);
    const isLowMovement =
      stableMotionState === 'stationary' ||
      (hasMotionMagnitude && motionMagnitude < MOTION_GUIDANCE_SETTINGS.LOW_MOVEMENT_INTENSITY_THRESHOLD);

    if (isLowMovement) {
      return 'Move steadily toward target for smoother guidance.';
    }

    if (stableMotionState === 'walking') {
      return 'Good pace. Keep moving toward the target.';
    }

    if (stableMotionState === 'active') {
      return 'Great momentum. Keep your compass heading aligned.';
    }

    return null;
  }, [motionMagnitude, stableMotionState]);
  const stepCounterStatus = useMemo(
    () => getStepCounterStatus({ stepError, isStepCounterAvailable, sessionSteps }),
    [stepError, isStepCounterAvailable, sessionSteps],
  );
  const collapsedStatus = useMemo(
    () => getCollapsedStatus({ isWithinRange }),
    [isWithinRange],
  );
  const expandedContentProps = useMemo(() => ({
    selectedCache,
    distanceToCache,
    distanceTrendText,
    distanceTrendTone,
    guidanceWarningText,
    routeMode,
    guidanceModeLabel,
    guidanceModeTone,
    routeSummary,
    routeLoading,
    routeError,
    direction: {
      hasDirection,
      isAligned,
      turnDelta,
      directionStatusText: directionStatus.text,
      directionStatusTone: directionStatus.tone,
      calibrationHelpText,
      heading,
      targetBearing,
      headingSource,
    },
    motion: {
      motionStatusText: motionStatus.text,
      motionStatusTone: motionStatus.tone,
      motionMagnitudeText,
      stepCounterStatusText: stepCounterStatus.text,
      stepCounterStatusTone: stepCounterStatus.tone,
      motionAdvisoryText,
    },
    proof: {
      capturedImage,
      captureError,
      isCapturing,
      isLogging,
      onCaptureProof,
      onClearProof,
    },
    action: {
      isWithinRange,
      isPanelBusy,
      isLogging,
      isCapturing,
      discoveryRadius,
      logAttemptReason,
      onLogDiscovery,
    },
  }), [
    capturedImage,
    captureError,
    calibrationHelpText,
    discoveryRadius,
    distanceToCache,
    distanceTrendText,
    distanceTrendTone,
    guidanceModeLabel,
    guidanceModeTone,
    guidanceWarningText,
    hasDirection,
    heading,
    headingSource,
    isAligned,
    isCapturing,
    isLogging,
    isPanelBusy,
    isWithinRange,
    logAttemptReason,
    motionAdvisoryText,
    motionMagnitudeText,
    motionStatus.tone,
    motionStatus.text,
    onCaptureProof,
    onClearProof,
    onLogDiscovery,
    routeError,
    routeLoading,
    routeMode,
    routeSummary,
    selectedCache,
    sensorError,
    sessionSteps,
    stepCounterStatus.text,
    stepCounterStatus.tone,
    targetBearing,
    turnDelta,
  ]);

  return (
    <Animated.View
      style={[
        styles.targetPanel,
        panelState === PANEL_STATES.FULL && fullPanelHeight
          ? { height: fullPanelHeight }
          : null,
        { transform: [{ translateY: panelTranslateY }] },
      ]}
      {...panelPanResponder.panHandlers}
      onLayout={(event) => {
        const measuredHeight = event.nativeEvent.layout.height;

        if (measuredHeight && measuredHeight !== panelHeight) {
          setPanelHeight(measuredHeight);
        }
      }}
    >
      <PanelHandleSection panelState={panelState} onStateChange={onStateChange} />

      {panelState === PANEL_STATES.COLLAPSED ? (
        <CollapsedSummarySection
          selectedCache={selectedCache}
          distanceToCache={distanceToCache}
          distanceTrendText={distanceTrendText}
          distanceTrendTone={distanceTrendTone}
          routeMode={routeMode}
          guidanceModeLabel={guidanceModeLabel}
          guidanceModeTone={guidanceModeTone}
          collapsedStatusText={collapsedStatus.text}
          collapsedStatusTone={collapsedStatus.tone}
        />
      ) : (
        <ScrollView
          style={[
            styles.expandedContentContainer,
            panelState === PANEL_STATES.HALF && styles.expandedContentContainer_half,
          ]}
          scrollEnabled={panelState === PANEL_STATES.HALF || panelState === PANEL_STATES.FULL}
          scrollEventThrottle={16}
          contentContainerStyle={styles.expandedContentScroll}
        >
          <ExpandedPanelContent content={expandedContentProps} panelState={panelState} />
        </ScrollView>
      )}
    </Animated.View>
  );
};

export default TargetPanel;
