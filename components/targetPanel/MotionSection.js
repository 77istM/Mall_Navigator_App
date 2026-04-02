import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import StatusPill from './StatusPill';

const MotionSection = ({ motionStatusText, motionStatusTone, motionMagnitudeText, stepCounterStatusText, stepCounterStatusTone, motionAdvisoryText }) => {
  return (
    <View style={[styles.motionContainer, styles[`motionContainer_${motionStatusTone}`]]}>
      <Text style={styles.motionTitle}>Motion Sensor</Text>
      <StatusPill tone={motionStatusTone} label={motionStatusText.replace(/^State: /, '')} />
      <Text style={styles.motionStatus}>{motionStatusText}</Text>
      <Text style={styles.motionMeta}>{motionMagnitudeText}</Text>
      <Text style={styles.motionMeta}>{stepCounterStatusText}</Text>
      <StatusPill tone={stepCounterStatusTone} label={stepCounterStatusText} />
      {motionAdvisoryText ? <Text style={styles.motionAdvisory}>{motionAdvisoryText}</Text> : null}
    </View>
  );
};

export default MotionSection;
