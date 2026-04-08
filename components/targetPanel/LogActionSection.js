import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import styles from './styles';

const LogActionSection = ({
  isWithinRange,
  isPanelBusy,
  isLogging,
  isCapturing,
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

  return (
    <>
      <Text style={[styles.logButtonMeta, styles[`logButtonMeta_${buttonTone}`]]}>{actionMessage}</Text>
      {showReason ? (
        <Text style={[styles.logButtonMeta, styles.logButtonMeta_warning]}>{logAttemptReason}</Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.logButton,
          styles[`logButton_${buttonTone}`],
          !isWithinRange || isPanelBusy ? styles.logButtonDisabled : null,
        ]}
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
