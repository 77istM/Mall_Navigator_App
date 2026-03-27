import React from 'react';
import { Text } from 'react-native';
import styles from './styles';
import DirectionSection from './DirectionSection';
import MotionSection from './MotionSection';
import ProofSection from './ProofSection';
import LogActionSection from './LogActionSection';

const ExpandedPanelContent = ({ content }) => {
  const {
    selectedCache,
    distanceToCache,
    direction,
    motion,
    proof,
    action,
  } = content;

  return (
    <>
      <Text style={styles.panelTitle}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.panelDistance}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>

      <DirectionSection
        hasDirection={direction.hasDirection}
        turnDelta={direction.turnDelta}
        directionStatusText={direction.directionStatusText}
        calibrationHelpText={direction.calibrationHelpText}
        heading={direction.heading}
        targetBearing={direction.targetBearing}
      />

      <MotionSection
        motionStatusText={motion.motionStatusText}
        motionMagnitudeText={motion.motionMagnitudeText}
        stepCounterStatusText={motion.stepCounterStatusText}
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
        onLogDiscovery={action.onLogDiscovery}
      />
    </>
  );
};

export default ExpandedPanelContent;
