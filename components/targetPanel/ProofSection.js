import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import styles from './styles';

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

export default ProofSection;
