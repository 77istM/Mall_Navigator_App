import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const CollapsedSummarySection = ({
  selectedCache,
  distanceToCache,
  distanceTrendText,
  distanceTrendTone,
  routeMode,
  guidanceModeLabel,
  guidanceModeTone,
  collapsedStatusText,
  collapsedStatusTone,
}) => {
  const modeLabel = guidanceModeLabel
    || (routeMode === 'route' ? 'Route Active' : routeMode === 'gps-fallback' ? 'GPS Fallback' : routeMode === 'sensor-limited' ? 'Sensor Limited' : 'Compass Only');

  return (
    <View style={[styles.collapsedSummaryContainer, styles[`collapsedSummaryContainer_${collapsedStatusTone}`]]}>
      <Text style={styles.panelTitle} numberOfLines={1}>Target: {selectedCache.CacheName}</Text>
      <Text style={[styles.collapsedRouteText, styles[`collapsedRouteText_${guidanceModeTone || 'info'}`]]} numberOfLines={1}>
        {modeLabel}
      </Text>
      <Text style={styles.collapsedDistanceText} numberOfLines={1}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>
      {distanceTrendText ? (
        <Text style={[styles.collapsedTrendText, styles[`collapsedTrendText_${distanceTrendTone}`]]} numberOfLines={1}>
          {distanceTrendText}
        </Text>
      ) : null}
      <Text style={[styles.collapsedHintText, styles[`collapsedHintText_${collapsedStatusTone}`]]} numberOfLines={1}>
        {collapsedStatusText}
      </Text>
    </View>
  );
};

export default CollapsedSummarySection;
