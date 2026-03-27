import React from 'react';
import { Text } from 'react-native';
import styles from './styles';
import DirectionSection from './DirectionSection';
import MotionSection from './MotionSection';
import ProofSection from './ProofSection';
import LogActionSection from './LogActionSection';

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

export default ExpandedPanelContent;
