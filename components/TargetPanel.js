import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { MOTION_GUIDANCE_SETTINGS } from '../constants/appConstants';

const COLLAPSED_PANEL_VISIBLE_HEIGHT = 132;
const PANEL_DRAG_START_THRESHOLD = 6;
const PANEL_SNAP_VELOCITY_THRESHOLD = 0.45;

const clampPanelOffset = (value, collapsedOffset) => {
  return Math.min(Math.max(value, 0), collapsedOffset);
};

const shouldCollapseFromRelease = (releaseOffset, velocityY, collapsedOffset) => {
  if (velocityY > PANEL_SNAP_VELOCITY_THRESHOLD) {
    return true;
  }

  if (velocityY < -PANEL_SNAP_VELOCITY_THRESHOLD) {
    return false;
  }

  return releaseOffset > collapsedOffset * 0.5;
};

const shouldCollapseFromOffset = (offset, collapsedOffset) => {
  return offset > collapsedOffset * 0.5;
};

const PanelHandleSection = ({ isPanelCollapsed, onToggleCollapse }) => {
  return (
    <View style={styles.panelHandleRow}>
      <View style={styles.panelHandle} />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isPanelCollapsed ? 'Expand cache details' : 'Collapse cache details'}
        style={styles.panelToggleButton}
        onPress={() => onToggleCollapse?.(!isPanelCollapsed)}
      >
        <Text style={styles.panelToggleText}>{isPanelCollapsed ? 'Expand' : 'Collapse'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const CollapsedSummarySection = ({ selectedCache, distanceToCache, collapsedStatusText }) => {
  return (
    <View style={styles.collapsedSummaryContainer}>
      <Text style={styles.panelTitle} numberOfLines={1}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.collapsedDistanceText} numberOfLines={1}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>
      <Text style={styles.collapsedHintText} numberOfLines={1}>{collapsedStatusText}</Text>
    </View>
  );
};

const DirectionSection = ({ hasDirection, turnDelta, directionStatusText, calibrationHelpText, heading, targetBearing }) => {
  return (
    <View style={styles.directionContainer}>
      <View
        style={[
          styles.arrowContainer,
          hasDirection ? { transform: [{ rotate: `${turnDelta}deg` }] } : null,
        ]}
      >
        <Text style={styles.arrowText}>^</Text>
      </View>
      <View style={styles.directionTextContainer}>
        <Text style={styles.directionTitle}>Compass Guidance</Text>
        <Text style={styles.directionHint}>{directionStatusText}</Text>
        {calibrationHelpText ? (
          <Text style={styles.directionMeta}>{calibrationHelpText}</Text>
        ) : null}
        {hasDirection ? (
          <Text style={styles.directionMeta}>
            Heading: {heading}° | Target: {targetBearing}°
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const MotionSection = ({ motionStatusText, motionMagnitudeText, stepCounterStatusText, motionAdvisoryText }) => {
  return (
    <View style={styles.motionContainer}>
      <Text style={styles.motionTitle}>Motion Sensor</Text>
      <Text style={styles.motionStatus}>{motionStatusText}</Text>
      <Text style={styles.motionMeta}>{motionMagnitudeText}</Text>
      <Text style={styles.motionMeta}>{stepCounterStatusText}</Text>
      {motionAdvisoryText ? <Text style={styles.motionAdvisory}>{motionAdvisoryText}</Text> : null}
    </View>
  );
};

const ProofSection = ({ capturedImage, captureError, isCapturing, isLogging, onCaptureProof, onClearProof }) => {
  return (
    <View style={styles.proofContainer}>
      <Text style={styles.proofTitle}>Camera Proof (Optional)</Text>
      <Text style={styles.proofSubtitle}>
        Capture a photo as extra evidence before logging your discovery.
      </Text>

      {capturedImage?.uri ? (
        <Image source={{ uri: capturedImage.uri }} style={styles.proofPreview} resizeMode="cover" />
      ) : null}

      {captureError ? <Text style={styles.proofErrorText}>{captureError}</Text> : null}

      <View style={styles.proofButtonRow}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          disabled={isCapturing || isLogging}
          onPress={() => onCaptureProof?.()}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>
              {capturedImage?.uri ? 'Retake Proof Photo' : 'Capture Proof Photo'}
            </Text>
          )}
        </TouchableOpacity>

        {capturedImage?.uri ? (
          <TouchableOpacity
            style={styles.clearProofButton}
            disabled={isCapturing || isLogging}
            onPress={() => onClearProof?.()}
          >
            <Text style={styles.clearProofButtonText}>Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const LogActionSection = ({ isWithinRange, isPanelBusy, isLogging, isCapturing, onLogDiscovery }) => {
  return (
    <TouchableOpacity
      style={[styles.logButton, !isWithinRange && styles.logButtonDisabled]}
      disabled={!isWithinRange || isPanelBusy}
      onPress={() => onLogDiscovery?.()}
    >
      {isLogging ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.logButtonText}>
          {isCapturing
            ? 'Capturing Photo...'
            : isWithinRange
              ? 'Log Discovery!'
              : 'Get Closer to Log'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const ExpandedPanelContent = ({
  selectedCache,
  distanceToCache,
  hasDirection,
  turnDelta,
  directionStatusText,
  calibrationHelpText,
  heading,
  targetBearing,
  motionStatusText,
  motionMagnitudeText,
  stepCounterStatusText,
  motionAdvisoryText,
  capturedImage,
  captureError,
  isCapturing,
  isLogging,
  onCaptureProof,
  onClearProof,
  isWithinRange,
  isPanelBusy,
  onLogDiscovery,
}) => {
  return (
    <>
      <Text style={styles.panelTitle}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.panelDistance}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>

      <DirectionSection
        hasDirection={hasDirection}
        turnDelta={turnDelta}
        directionStatusText={directionStatusText}
        calibrationHelpText={calibrationHelpText}
        heading={heading}
        targetBearing={targetBearing}
      />

      <MotionSection
        motionStatusText={motionStatusText}
        motionMagnitudeText={motionMagnitudeText}
        stepCounterStatusText={stepCounterStatusText}
        motionAdvisoryText={motionAdvisoryText}
      />

      <ProofSection
        capturedImage={capturedImage}
        captureError={captureError}
        isCapturing={isCapturing}
        isLogging={isLogging}
        onCaptureProof={onCaptureProof}
        onClearProof={onClearProof}
      />

      <LogActionSection
        isWithinRange={isWithinRange}
        isPanelBusy={isPanelBusy}
        isLogging={isLogging}
        isCapturing={isCapturing}
        onLogDiscovery={onLogDiscovery}
      />
    </>
  );
};

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
  directionHint,
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
  const directionStatusText = sensorError
    ? sensorError
    : hasDirection
      ? directionHint
      : 'Compass calibrating.';
  const motionStatusText = stableMotionState
    ? `State: ${stableMotionState}`
    : 'Motion data unavailable.';
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
  const hasSessionSteps = Number.isFinite(sessionSteps);
  const stepCounterStatusText = stepError
    ? stepError
    : isStepCounterAvailable
      ? `Session steps: ${hasSessionSteps ? sessionSteps : 0}`
      : 'Step counter unavailable.';
  const calibrationHelpText =
    !hasDirection && !sensorError
      ? 'Move your phone in a figure-8 motion to calibrate compass.'
      : null;
  const collapsedStatusText = isWithinRange
    ? 'Within discovery range. Slide up for details.'
    : 'Slide up to view guidance and cache actions.';

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
          collapsedStatusText={collapsedStatusText}
        />
      ) : (
        <ExpandedPanelContent
          selectedCache={selectedCache}
          distanceToCache={distanceToCache}
          hasDirection={hasDirection}
          turnDelta={turnDelta}
          directionStatusText={directionStatusText}
          calibrationHelpText={calibrationHelpText}
          heading={heading}
          targetBearing={targetBearing}
          motionStatusText={motionStatusText}
          motionMagnitudeText={motionMagnitudeText}
          stepCounterStatusText={stepCounterStatusText}
          motionAdvisoryText={motionAdvisoryText}
          capturedImage={capturedImage}
          captureError={captureError}
          isCapturing={isCapturing}
          isLogging={isLogging}
          onCaptureProof={onCaptureProof}
          onClearProof={onClearProof}
          isWithinRange={isWithinRange}
          isPanelBusy={isPanelBusy}
          onLogDiscovery={onLogDiscovery}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  targetPanel: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelHandleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: 6,
    marginBottom: 8,
  },
  panelHandle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    marginBottom: 8,
  },
  panelToggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  panelToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
  collapsedSummaryContainer: {
    paddingBottom: 4,
  },
  collapsedDistanceText: {
    fontSize: 15,
    color: '#4b5563',
    marginTop: 4,
  },
  collapsedHintText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
    fontWeight: '600',
  },
  panelDistance: { fontSize: 16, marginVertical: 10, color: '#555' },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  arrowContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e6eeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  arrowText: {
    fontSize: 26,
    color: '#1e5aa8',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  directionTextContainer: {
    flex: 1,
  },
  directionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e5aa8',
    marginBottom: 2,
  },
  directionHint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  directionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  motionContainer: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  motionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  motionStatus: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  motionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  motionAdvisory: {
    marginTop: 6,
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  proofContainer: {
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
  },
  proofTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  proofSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
    marginBottom: 8,
  },
  proofPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e5e7eb',
  },
  proofErrorText: {
    color: '#b91c1c',
    fontSize: 12,
    marginBottom: 8,
  },
  proofButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  captureButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  clearProofButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  clearProofButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logButtonDisabled: { backgroundColor: '#cccccc' },
  logButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default TargetPanel;
