import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import styles from './styles';
import StatusPill from './StatusPill';

const ProofSection = ({ capturedImage, captureError, isCapturing, isLogging, onCaptureProof, onClearProof }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const proofTone = captureError ? 'error' : isCapturing || isLogging ? 'warning' : capturedImage?.uri ? 'success' : 'info';
  const proofLabel = captureError
    ? 'Capture issue'
    : isCapturing
      ? 'Capturing'
      : isLogging
        ? 'Logging'
        : capturedImage?.uri
          ? 'Photo ready'
          : 'Optional';

  useEffect(() => {
    if (captureError || isCapturing || capturedImage?.uri) {
      setIsExpanded(true);
    }
  }, [captureError, isCapturing, capturedImage?.uri]);

  return (
    <View style={[styles.proofContainer, styles[`proofContainer_${proofTone}`]]}>
      <TouchableOpacity
        style={styles.proofHeaderButton}
        onPress={() => setIsExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="Toggle camera proof"
      >
        <View style={styles.proofHeaderTextWrap}>
          <Text style={styles.proofTitle}>Camera Proof (Optional)</Text>
          <Text style={styles.proofHeaderHint}>{isExpanded ? 'Tap to collapse' : 'Tap to expand'}</Text>
        </View>
        <View style={styles.proofHeaderRight}>
          <StatusPill tone={proofTone} label={proofLabel} />
          <Text style={styles.proofChevron}>{isExpanded ? '▾' : '▸'}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.proofExpandedContent}>
          <Text style={styles.proofSubtitle}>
            Capture a photo as extra evidence before logging your discovery.
          </Text>

          {capturedImage?.uri ? (
            <Image source={{ uri: capturedImage.uri }} style={styles.proofPreview} resizeMode="cover" />
          ) : null}

          {captureError ? <Text style={styles.proofErrorText}>{captureError}</Text> : null}

          {(isCapturing || isLogging) ? (
            <Text style={styles.proofBusyText}>{isCapturing ? 'Preparing camera proof...' : 'Submitting discovery...'}</Text>
          ) : null}

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
      ) : null}
    </View>
  );
};

export default ProofSection;
