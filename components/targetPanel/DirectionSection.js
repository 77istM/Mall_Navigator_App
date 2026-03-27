import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const DirectionSection = ({
  hasDirection,
  turnDelta,
  directionStatusText,
  calibrationHelpText,
  heading,
  targetBearing,
}) => {
  return (
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
  );
};

export default DirectionSection;
