import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import styles from './styles';

const LogActionSection = ({
  isWithinRange,
  isPanelBusy,
  isLogging,
  isCapturing,
  distanceToCache,
  discoveryRadius,
  logAttemptReason,
  onLogDiscovery,
}) => {
  const buttonTone = isLogging ? 'success' : isCapturing ? 'warning' : isWithinRange ? 'info' : 'warning';
  const actionMessage = isLogging
    ? 'Logging discovery...'
    : isCapturing
      ? 'Waiting for photo proof...'
      : isWithinRange
        ? 'Ready to log'
        : 'Move closer to activate logging';
  const showReason = Boolean(logAttemptReason) && logAttemptReason !== actionMessage;
    const formattedRadius = Number.isFinite(discoveryRadius) ? `${Math.round(discoveryRadius)}m` : 'required radius';
    const formattedDistance = Number.isFinite(distanceToCache) ? `${Math.round(distanceToCache)}m` : 'distance unavailable';
    const distanceSummary = isWithinRange
      ? `Within ${formattedRadius}. Current distance ${formattedDistance}.`
      : `Need ${formattedRadius}. Current distance ${formattedDistance}.`;
    const buttonAccessibilityLabel = isLogging
      ? 'Logging discovery in progress.'
      : isCapturing
        ? 'Capture proof photo before logging discovery.'
        : isWithinRange
          ? `Log discovery. ${distanceSummary}`
          : `Log discovery unavailable. ${distanceSummary} Move closer to enable logging.`;

  return (
    <>
      <Text style={[styles.logButtonMeta, styles[`logButtonMeta_${buttonTone}`]]}>{actionMessage}</Text>
      {showReason ? (
          <Text style={[styles.logButtonMeta, styles.logButtonMeta_warning]} accessibilityRole="text">
            {logAttemptReason}
          </Text>
      ) : null}
        <Text style={[styles.logButtonMeta, styles[`logButtonMeta_${buttonTone}`]]} accessibilityRole="text">
          {distanceSummary}
        </Text>
      <TouchableOpacity
        style={[
          styles.logButton,
          styles[`logButton_${buttonTone}`],
          !isWithinRange || isPanelBusy ? styles.logButtonDisabled : null,
        ]}
          accessibilityRole="button"
          accessibilityLabel={buttonAccessibilityLabel}
          accessibilityState={{ disabled: !isWithinRange || isPanelBusy, busy: isPanelBusy }}
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
    </>
  );
};

export default LogActionSection;
