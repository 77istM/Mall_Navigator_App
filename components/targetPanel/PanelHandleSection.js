import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const PanelHandleSection = ({ isPanelCollapsed, onToggleCollapse }) => {
  return (
    <View style={styles.panelHandleRow}>
      <View style={styles.panelHandle} />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isPanelCollapsed ? 'Expand cache details' : 'Collapse cache details'}
        style={styles.panelToggleButton}
        onPress={() => onToggleCollapse?.(!isPanelCollapsed)}
      >
        <Text style={styles.panelToggleText}>{isPanelCollapsed ? 'Expand' : 'Collapse'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PanelHandleSection;
