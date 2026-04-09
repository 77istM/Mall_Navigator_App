import React from 'react';
import { Text } from 'react-native';
import styles from './styles';
import DirectionSection from './DirectionSection';
import MotionSection from './MotionSection';
import ProofSection from './ProofSection';
import LogActionSection from './LogActionSection';
import StatusPill from './StatusPill';

const ExpandedPanelContent = ({ content }) => {
  const {
    selectedCache,
    distanceToCache,
    distanceTrendText,
    distanceTrendTone,
    routeMode,
    guidanceModeLabel,
    guidanceModeTone,
    routeSummary,
    routeLoading,
    routeError,
    direction,
    motion,
    proof,
    action,
    guidanceWarningText,
  } = content;

  const routeTone = routeError ? 'warning' : routeMode === 'route' ? 'success' : routeLoading ? 'info' : guidanceModeTone || 'warning';
  const routeLabel = routeError
    ? 'Route unavailable'
    : routeLoading
      ? 'Route loading'
      : guidanceModeLabel || (routeMode === 'route' ? 'Route Active' : 'Compass Only');

  return (
    <>
      <Text style={styles.panelTitle}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.panelDistance}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>
      <StatusPill tone={routeTone} label={routeLabel} accessibilityLabel={`Guidance mode: ${routeLabel}`} />
      {routeSummary ? (
        <Text style={styles.routeSummaryText}>
          {routeSummary.nextManeuver ? `${routeSummary.nextManeuver} · ` : ''}
          {Math.round(routeSummary.distanceMeters)}m route · {Math.max(1, Math.round(routeSummary.durationSeconds / 60))} min
        </Text>
      ) : null}
      {routeError ? (
        <Text style={styles.routeErrorText}>{routeError}. Compass guidance stays available.</Text>
      ) : null}
      {distanceTrendText ? (
        <Text style={[styles.distanceTrendText, styles[`distanceTrendText_${distanceTrendTone}`]]}>
          {distanceTrendText}
        </Text>
      ) : null}
      {guidanceWarningText ? (
        <Text style={styles.guidanceWarningText}>{guidanceWarningText}</Text>
      ) : null}

      <DirectionSection
        hasDirection={direction.hasDirection}
        isAligned={direction.isAligned}
        turnDelta={direction.turnDelta}
        directionStatusText={direction.directionStatusText}
        directionStatusTone={direction.directionStatusTone}
        calibrationHelpText={direction.calibrationHelpText}
        heading={direction.heading}
        targetBearing={direction.targetBearing}
        headingSource={direction.headingSource}
      />

      <MotionSection
        motionStatusText={motion.motionStatusText}
        motionStatusTone={motion.motionStatusTone}
        motionMagnitudeText={motion.motionMagnitudeText}
        stepCounterStatusText={motion.stepCounterStatusText}
        stepCounterStatusTone={motion.stepCounterStatusTone}
        motionAdvisoryText={motion.motionAdvisoryText}
      />

      <ProofSection
        capturedImage={proof.capturedImage}
        captureError={proof.captureError}
        isCapturing={proof.isCapturing}
        isLogging={proof.isLogging}
        onCaptureProof={proof.onCaptureProof}
        onClearProof={proof.onClearProof}
      />

      <LogActionSection
        isWithinRange={action.isWithinRange}
        isPanelBusy={action.isPanelBusy}
        isLogging={action.isLogging}
        isCapturing={action.isCapturing}
        distanceToCache={distanceToCache}
        discoveryRadius={action.discoveryRadius}
        logAttemptReason={action.logAttemptReason}
        onLogDiscovery={action.onLogDiscovery}
      />
    </>
  );
};

export default ExpandedPanelContent;
