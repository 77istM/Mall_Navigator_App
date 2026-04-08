import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';
import { MOTION_GUIDANCE_SETTINGS } from '../constants/appConstants';
import {
  COLLAPSED_PANEL_VISIBLE_HEIGHT,
  PANEL_DRAG_START_THRESHOLD,
} from './targetPanel/constants';
import {
  clampPanelOffset,
  shouldCollapseFromRelease,
  shouldCollapseFromOffset,
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
  routeSummary,
  routeLoading,
  routeError,
  isWithinRange,
  isLogging,
  capturedImage,
  isCapturing,
  captureError,
  isCollapsed,
  onToggleCollapse,
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
  const isPanelCollapsed = !!isCollapsed;

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

  useEffect(() => {
    animatePanelTo(isPanelCollapsed ? collapsedOffset : 0);
  }, [collapsedOffset, isPanelCollapsed, panelTranslateY]);

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
        const nextOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          collapsedOffset,
        );

        panelTranslateY.setValue(nextOffset);
      },
      onPanResponderRelease: (_event, gestureState) => {
        if (collapsedOffset <= 0) {
          return;
        }

        const releaseOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          collapsedOffset,
        );
        const shouldCollapse = shouldCollapseFromRelease(
          releaseOffset,
          gestureState.vy,
          collapsedOffset,
        );
        const targetOffset = shouldCollapse ? collapsedOffset : 0;

        animatePanelTo(targetOffset);
        onToggleCollapse?.(shouldCollapse);
      },
      onPanResponderTerminate: (_event, gestureState) => {
        if (collapsedOffset <= 0) {
          return;
        }

        const terminateOffset = clampPanelOffset(
          dragStartOffsetRef.current + gestureState.dy,
          collapsedOffset,
        );
        const shouldCollapse = shouldCollapseFromOffset(terminateOffset, collapsedOffset);

        animatePanelTo(shouldCollapse ? collapsedOffset : 0);
        onToggleCollapse?.(shouldCollapse);
      },
    });
  }, [collapsedOffset, onToggleCollapse, panelTranslateY]);

  if (!selectedCache) {
    return null;
  }

  const hasDirection = isHeadingAvailable && turnDelta !== null && !!directionHint;
  const isPanelBusy = isLogging || isCapturing;
  const directionStatus = getDirectionStatus({ sensorError, hasDirection, isAligned, directionHint });
  const motionStatus = getMotionStatus({ stableMotionState });
  const hasMotionMagnitude = Number.isFinite(motionMagnitude);
  const isLowMovement =
    stableMotionState === 'stationary' ||
    (hasMotionMagnitude && motionMagnitude < MOTION_GUIDANCE_SETTINGS.LOW_MOVEMENT_INTENSITY_THRESHOLD);
  const motionAdvisoryText = isLowMovement
    ? 'Move steadily toward target for smoother guidance.'
    : stableMotionState === 'walking'
      ? 'Good pace. Keep moving toward the target.'
      : stableMotionState === 'active'
        ? 'Great momentum. Keep your compass heading aligned.'
        : null;
  const motionMagnitudeText = Number.isFinite(motionMagnitude)
    ? `Intensity: ${motionMagnitude.toFixed(3)}`
    : 'Intensity: -';
  const stepCounterStatus = getStepCounterStatus({
    stepError,
    isStepCounterAvailable,
    sessionSteps,
  });
  const collapsedStatus = getCollapsedStatus({ isWithinRange });
  const expandedContentProps = {
    selectedCache,
    distanceToCache,
    distanceTrendText,
    distanceTrendTone,
    guidanceWarningText,
    routeMode,
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
      logAttemptReason,
      onLogDiscovery,
    },
  };

  return (
    <Animated.View
      style={[styles.targetPanel, { transform: [{ translateY: panelTranslateY }] }]}
      {...panelPanResponder.panHandlers}
      onLayout={(event) => {
        const measuredHeight = event.nativeEvent.layout.height;

        if (measuredHeight && measuredHeight !== panelHeight) {
          setPanelHeight(measuredHeight);
        }
      }}
    >
      <PanelHandleSection isPanelCollapsed={isPanelCollapsed} onToggleCollapse={onToggleCollapse} />

      {isPanelCollapsed ? (
        <CollapsedSummarySection
          selectedCache={selectedCache}
          distanceToCache={distanceToCache}
            distanceTrendText={distanceTrendText}
            distanceTrendTone={distanceTrendTone}
            routeMode={routeMode}
          collapsedStatusText={collapsedStatus.text}
          collapsedStatusTone={collapsedStatus.tone}
        />
      ) : (
        <ExpandedPanelContent content={expandedContentProps} />
      )}
    </Animated.View>
  );
};

export default TargetPanel;
