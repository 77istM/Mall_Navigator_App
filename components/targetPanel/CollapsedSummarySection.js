import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const CollapsedSummarySection = ({ selectedCache, distanceToCache, collapsedStatusText }) => {
  return (
    <View style={styles.collapsedSummaryContainer}>
      <Text style={styles.panelTitle} numberOfLines={1}>Target: {selectedCache.CacheName}</Text>
      <Text style={styles.collapsedDistanceText} numberOfLines={1}>
        Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
      </Text>
      <Text style={styles.collapsedHintText} numberOfLines={1}>{collapsedStatusText}</Text>
    </View>
  );
};

export default CollapsedSummarySection;
