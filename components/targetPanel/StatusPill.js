import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

const StatusPill = ({ tone = 'info', label }) => {
  if (!label) {
    return null;
  }

  return (
    <View style={[styles.statusPill, styles[`statusPill_${tone}`]]}>
      <Text style={[styles.statusPillText, styles[`statusPillText_${tone}`]]}>{label}</Text>
    </View>
  );
};

export default StatusPill;