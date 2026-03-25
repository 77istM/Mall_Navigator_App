import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

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
  targetBearing,
  turnDelta,
  directionHint,
  isWithinRange,
  isLogging,
  onLogDiscovery,
}) => {
  if (!selectedCache) {
    return null;
  }

  const hasDirection = isHeadingAvailable && turnDelta !== null && !!directionHint;
  const directionStatusText = sensorError
    ? sensorError
    : hasDirection
      ? directionHint
      : 'Compass calibrating.';
  const calibrationHelpText =
    !hasDirection && !sensorError
      ? 'Move your phone in a figure-8 motion to calibrate compass.'
      : null;

  return (
    <View style={styles.targetPanel}>
      <Text style={styles.panelTitle}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.panelDistance}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>

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
      
      <TouchableOpacity 
        style={[styles.logButton, !isWithinRange && styles.logButtonDisabled]}
        disabled={!isWithinRange || isLogging}
        onPress={onLogDiscovery}
      >
        {isLogging ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logButtonText}>
            {isWithinRange ? "Log Discovery!" : "Get Closer to Log"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
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
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
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
