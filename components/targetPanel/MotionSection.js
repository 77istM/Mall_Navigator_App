import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const MotionSection = ({ motionStatusText, motionMagnitudeText, stepCounterStatusText, motionAdvisoryText }) => {
  return (
    <View style={styles.motionContainer}>
      <Text style={styles.motionTitle}>Motion Sensor</Text>
      <Text style={styles.motionStatus}>{motionStatusText}</Text>
      <Text style={styles.motionMeta}>{motionMagnitudeText}</Text>
      <Text style={styles.motionMeta}>{stepCounterStatusText}</Text>
      {motionAdvisoryText ? <Text style={styles.motionAdvisory}>{motionAdvisoryText}</Text> : null}
    </View>
  );
};

export default MotionSection;
