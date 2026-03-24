import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function ParticipantProgressCard({
  styles,
  activeEventId,
  progressLoading,
  progress,
  onRefreshProgress,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Participant Progress</Text>
      {!activeEventId ? (
        <Text style={styles.mutedText}>Create or join an event to track progress.</Text>
      ) : progressLoading ? (
        <ActivityIndicator size="small" color="#28a745" />
      ) : progress.length === 0 ? (
        <Text style={styles.mutedText}>No participant activity yet.</Text>
      ) : (
        progress.map((entry, index) => (
          <View key={`${entry.playerId}-${index}`} style={styles.progressRow}>
            <Text style={styles.progressName}>#{index + 1} {entry.playerName || `Player #${entry.playerId}`}</Text>
            <Text style={styles.progressStats}>{entry.findsCount} finds • {entry.totalPoints} pts</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onRefreshProgress}>
        <Text style={styles.secondaryButtonText}>Refresh Progress</Text>
      </TouchableOpacity>
    </View>
  );
}
