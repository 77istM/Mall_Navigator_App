import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import styles from './styles';

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

export default LogActionSection;
