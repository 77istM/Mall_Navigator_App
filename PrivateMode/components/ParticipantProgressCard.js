import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import StatusBanner from '../../components/StatusBanner';

export default function ParticipantProgressCard({
  styles,
  activeEventId,
  progressLoading,
  progress,
  progressError,
  lastProgressUpdatedAt,
  onRefreshProgress,
}) {
  const [isRefreshingProgress, setIsRefreshingProgress] = useState(false);

  const handleRefresh = async () => {
    if (!activeEventId || isRefreshingProgress || progressLoading) {
      return;
    }

    setIsRefreshingProgress(true);
    try {
      await onRefreshProgress?.();
    } finally {
      setIsRefreshingProgress(false);
    }
  };

  const formatUpdatedAt = (isoValue) => {
    if (!isoValue) {
      return null;
    }

    const parsed = new Date(isoValue);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const updatedAtLabel = formatUpdatedAt(lastProgressUpdatedAt);

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Participant Progress</Text>
      {!activeEventId ? null : isRefreshingProgress ? (
        <StatusBanner compact variant="info" message="Refreshing participant progress..." />
      ) : progressError ? (
        <StatusBanner compact variant="error" message={progressError} />
      ) : null}

      {!activeEventId ? (
        <Text style={styles.mutedText}>Create or join an event to view participant rankings.</Text>
      ) : progressLoading ? (
        <View style={styles.progressLoadingRow}>
          <ActivityIndicator size="small" color="#28a745" />
          <Text style={styles.mutedText}>Loading participant progress...</Text>
        </View>
      ) : progress.length === 0 ? (
        <View style={styles.progressEmptyState}>
          <Text style={styles.emptyStateTitle}>No progress yet</Text>
          <Text style={styles.mutedText}>Participants have not logged any finds for this event.</Text>
        </View>
      ) : (
        <>
          {progress.map((entry, index) => (
            <View key={`${entry.playerId}-${index}`} style={styles.progressRow}>
              <Text style={styles.progressName}>#{index + 1} {entry.playerName || `Player #${entry.playerId}`}</Text>
              <Text style={styles.progressStats}>{entry.findsCount} finds • {entry.totalPoints} pts</Text>
            </View>
          ))}
          {updatedAtLabel ? (
            <Text style={styles.progressUpdatedAt}>Last updated at {updatedAtLabel}</Text>
          ) : null}
        </>
      )}

      <TouchableOpacity
        style={[styles.secondaryButton, (isRefreshingProgress || progressLoading || !activeEventId) ? styles.buttonDisabled : null]}
        onPress={handleRefresh}
        disabled={isRefreshingProgress || progressLoading || !activeEventId}
      >
        {isRefreshingProgress ? (
          <ActivityIndicator size="small" color="#495057" />
        ) : (
          <Text style={styles.secondaryButtonText}>Refresh Progress</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
