import React, { useEffect, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useEventManagement } from '../hooks/useEventManagement';
import { useCacheCreation } from '../hooks/useCacheCreation';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { EVENT_TYPES } from '../PrivateMode/constants/PrivateModeConstants';
import JoinEventCard from '../PrivateMode/components/JoinEventCard';
import CreateEventCard from '../PrivateMode/components/CreateEventCard';
import CreateCacheCard from '../PrivateMode/components/CreateCacheCard';
import ParticipantProgressCard from '../PrivateMode/components/ParticipantProgressCard';

export default function PrivateDashboardScreen({ navigation }) {
  // Hardcoded for demonstration; replace with auth user ID from state.
  const currentUserId = '1';

  // Custom hooks for better state management
  const eventMgmt = useEventManagement(
    currentUserId,
    useCallback((eventId, name) => {
      navigation.navigate('GlobalTabs', { eventId, eventName: name?.trim() || undefined });
    }, [navigation])
  );

  const cacheMgmt = useCacheCreation();
  const progressMgmt = useProgressTracking();

  // Load progress when owned event is created
  useEffect(() => {
    if (eventMgmt.ownedEventId) {
      progressMgmt.loadProgress(eventMgmt.ownedEventId);
    }
  }, [eventMgmt.ownedEventId, progressMgmt]);

  // Handle navigation to map
  const handleOpenEventMap = useCallback(() => {
    if (!eventMgmt.activeEventId) {
      return Alert.alert('Error', 'Join or create an event first.');
    }

    navigation.navigate('GlobalTabs', {
      eventId: eventMgmt.activeEventId,
      eventName: eventMgmt.eventName.trim() || undefined,
    });
  }, [eventMgmt.activeEventId, eventMgmt.eventName, navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Private Event Mode</Text>
      <Text style={styles.subtitle}>Families, Schools, Companies, University Activities</Text>

      <JoinEventCard
        styles={styles}
        inviteCode={eventMgmt.inviteCode}
        onInviteCodeChange={eventMgmt.setInviteCode}
        onJoinEvent={eventMgmt.handleJoinEvent}
      />

      <CreateEventCard
        styles={styles}
        eventName={eventMgmt.eventName}
        onEventNameChange={eventMgmt.setEventName}
        eventDescription={eventMgmt.eventDescription}
        onEventDescriptionChange={eventMgmt.setEventDescription}
        eventType={eventMgmt.eventType}
        onEventTypeChange={eventMgmt.setEventType}
        eventTypes={EVENT_TYPES}
        startInHours={eventMgmt.startInHours}
        onStartInHoursChange={eventMgmt.setStartInHours}
        durationHours={eventMgmt.durationHours}
        onDurationHoursChange={eventMgmt.setDurationHours}
        onCreateEvent={() => eventMgmt.handleCreateEvent(progressMgmt.loadProgress)}
        ownedEventId={eventMgmt.ownedEventId}
      />

      <CreateCacheCard
        styles={styles}
        cacheName={cacheMgmt.cacheName}
        onCacheNameChange={cacheMgmt.setCacheName}
        cacheClue={cacheMgmt.cacheClue}
        onCacheClueChange={cacheMgmt.setCacheClue}
        cacheDescription={cacheMgmt.cacheDescription}
        onCacheDescriptionChange={cacheMgmt.setCacheDescription}
        cacheImageURL={cacheMgmt.cacheImageURL}
        onCacheImageURLChange={cacheMgmt.setCacheImageURL}
        isMapPickerVisible={cacheMgmt.isMapPickerVisible}
        onToggleMapPicker={cacheMgmt.toggleMapPicker}
        getPickerRegion={cacheMgmt.getPickerRegion}
        onMapPress={cacheMgmt.handleMapPress}
        cacheLatitude={cacheMgmt.cacheLatitude}
        onCacheLatitudeChange={cacheMgmt.setCacheLatitude}
        cacheLongitude={cacheMgmt.cacheLongitude}
        onCacheLongitudeChange={cacheMgmt.setCacheLongitude}
        cachePoints={cacheMgmt.cachePoints}
        onCachePointsChange={cacheMgmt.setCachePoints}
        onCreateCache={() => cacheMgmt.handleCreateCache(eventMgmt.ownedEventId)}
      />

      <ParticipantProgressCard
        styles={styles}
        activeEventId={eventMgmt.activeEventId}
        progressLoading={progressMgmt.progressLoading}
        progress={progressMgmt.progress}
        onRefreshProgress={() => progressMgmt.refreshProgress(eventMgmt.activeEventId)}
      />

      <TouchableOpacity style={styles.openMapButton} onPress={handleOpenEventMap}>
        <Text style={styles.buttonText}>Open Event Map + Leaderboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f8f9fa',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#343a40',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 11,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  rowInput: {
    flex: 1,
    marginRight: 8,
  },
  rowInputLast: {
    marginRight: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  chipText: {
    color: '#495057',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  joinButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  openMapButton: {
    backgroundColor: '#198754',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#495057',
    fontWeight: '700',
  },
  mapPickerContainer: {
    marginBottom: 10,
  },
  mapPickerHint: {
    color: '#6c757d',
    marginBottom: 6,
    fontSize: 13,
  },
  mapPicker: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  infoText: {
    marginTop: 10,
    color: '#0f5132',
    fontWeight: '700',
  },
  mutedText: {
    color: '#6c757d',
  },
  progressRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  progressName: {
    fontWeight: '700',
    color: '#212529',
  },
  progressStats: {
    marginTop: 2,
    color: '#495057',
  },
});