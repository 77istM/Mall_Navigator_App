import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import styles from './styles';
import StatusPill from './StatusPill';

const ProofSection = ({ capturedImage, captureError, isCapturing, isLogging, onCaptureProof, onClearProof }) => {
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

  return (
    <View style={[styles.proofContainer, styles[`proofContainer_${proofTone}`]]}>
      <Text style={styles.proofTitle}>Camera Proof (Optional)</Text>
      <StatusPill tone={proofTone} label={proofLabel} />
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
  );
};

export default ProofSection;
