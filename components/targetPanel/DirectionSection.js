import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import StatusPill from './StatusPill';

const DirectionSection = ({
  hasDirection,
  isAligned,
  turnDelta,
  directionStatusText,
  directionStatusTone,
  calibrationHelpText,
  heading,
  targetBearing,
  headingSource,
}) => {
  const accessibilityLabel = hasDirection
    ? `Compass guidance. ${directionStatusText}. Heading ${heading} degrees toward target ${targetBearing} degrees. ${headingSource === 'gps-course' ? 'GPS course source.' : 'Magnetometer source.'}`
    : `Compass guidance. ${directionStatusText}. ${calibrationHelpText || 'Heading is not available yet.'}`;

  return (
    <View
      style={[styles.directionContainer, styles[`directionContainer_${directionStatusTone}`]]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.arrowContainer,
          styles[`arrowContainer_${directionStatusTone}`],
          hasDirection ? { transform: [{ rotate: `${turnDelta}deg` }] } : null,
        ]}
      >
        <Text style={[styles.arrowText, styles[`arrowText_${directionStatusTone}`]]}>^</Text>
      </View>
      <View style={styles.directionTextContainer}>
        <Text style={styles.directionTitle}>Compass Guidance</Text>
        <StatusPill tone={directionStatusTone} label={isAligned ? 'Aligned' : 'Needs attention'} />
        <Text style={styles.directionHint}>{directionStatusText}</Text>
        {calibrationHelpText ? (
          <Text style={styles.directionMeta}>{calibrationHelpText}</Text>
        ) : null}
        {hasDirection ? (
          <Text style={styles.directionMeta}>
            Heading: {heading}° | Target: {targetBearing}°
          </Text>
        ) : null}
        {headingSource ? (
          <Text style={styles.directionMeta}>
            Source: {headingSource === 'gps-course' ? 'GPS course' : 'Magnetometer'}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default DirectionSection;
