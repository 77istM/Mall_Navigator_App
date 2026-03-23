import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { getAllFinds, getEventLeaderboard } from '../api';

export default function LeaderboardScreen({ route, eventId: eventIdProp }) {
  const activeEventId = eventIdProp ?? route?.params?.eventId ?? null;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data when the screen mounts
  useEffect(() => {
    fetchLeaderboardData();
  }, [activeEventId]);

  const fetchLeaderboardData = async () => {
    try {
      if (activeEventId) {
        const eventLeaderboard = await getEventLeaderboard(activeEventId);
        setLeaderboard(eventLeaderboard);
        return;
      }

      const finds = await getAllFinds();

      // Dictionary to aggregate points and counts per player
      const playerScores = {};

      finds.forEach((find) => {
        const playerId = find.FindPlayerID;
        // The API returns the nested Cache object which holds the points
        const points = find.FindCache?.CachePoints || 0; 

        if (!playerScores[playerId]) {
          playerScores[playerId] = {
            playerId: playerId,
            totalPoints: 0,
            findsCount: 0,
          };
        }
        
        playerScores[playerId].totalPoints += points;
        playerScores[playerId].findsCount += 1;
      });

      // Convert our dictionary into an array and sort descending by totalPoints
      const sortedLeaderboard = Object.values(playerScores).sort(
        (a, b) => b.totalPoints - a.totalPoints
      );

      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Allows the user to pull down on the list to refresh the scores
  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Calculating Scores...</Text>
      </View>
    );
  }

  // UI for individual rows in the Leaderboard
  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>#{index + 1}</Text>
      
      <View style={styles.playerInfo}>
        {/* Using Player ID since nested User data might not always be exposed by the basic endpoint */}
        <Text style={styles.playerName}>{item.playerName || `Player #${item.playerId}`}</Text>
        <Text style={styles.playerStats}>{item.findsCount} Caches Found</Text>
      </View>

      <View style={styles.scoreBadge}>
        <Text style={styles.points}>{item.totalPoints} pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeEventId ? `Event Leaderboard #${activeEventId}` : 'Global Leaderboard'}
        </Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.playerId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        // Pull-to-refresh implementation
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#28a745']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No caches found yet. Be the first!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    paddingTop: 60, // Safe area padding
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  listContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rank: {
    fontSize: 20,
    fontWeight: '900',
    color: '#adb5bd',
    width: 45,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  playerStats: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 30,
    fontSize: 16,
  },
});