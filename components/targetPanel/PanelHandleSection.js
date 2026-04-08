import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PANEL_STATES } from './constants';
import styles from './styles';

const PanelHandleSection = ({ panelState = PANEL_STATES.COLLAPSED, onStateChange }) => {
  const getNextState = (currentState) => {
    switch (currentState) {
      case PANEL_STATES.COLLAPSED:
        return PANEL_STATES.FULL;
      case PANEL_STATES.HALF:
        return PANEL_STATES.FULL;
      case PANEL_STATES.FULL:
        return PANEL_STATES.COLLAPSED;
      default:
        return PANEL_STATES.FULL;
    }
  };

  const handleToggle = () => {
    const nextState = getNextState(panelState);
    onStateChange?.(nextState);
  };

  const getStateLabel = (state) => {
    switch (state) {
      case PANEL_STATES.COLLAPSED:
        return 'Expand cache details';
      case PANEL_STATES.HALF:
        return 'Expand to full screen';
      case PANEL_STATES.FULL:
        return 'Collapse cache details';
      default:
        return 'Toggle panel';
    }
  };

  const getStateButtonText = (state) => {
    switch (state) {
      case PANEL_STATES.COLLAPSED:
        return 'Expand';
      case PANEL_STATES.HALF:
        return 'Expand More';
      case PANEL_STATES.FULL:
        return 'Collapse';
      default:
        return 'Toggle';
    }
  };

  return (
    <View style={styles.panelHandleRow}>
      <View style={styles.panelHandle} />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={getStateLabel(panelState)}
        style={styles.panelToggleButton}
        onPress={handleToggle}
      >
        <Text style={styles.panelToggleText}>{getStateButtonText(panelState)}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PanelHandleSection;
