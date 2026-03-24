import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  createPrivateModeEvent,
  createPrivateModeCache,
  extractCreatedEventId,
  fetchEventProgress,
  joinPrivateEvent,
} from '../PrivateMode/services/PrivateModeService';
import {
  EVENT_TYPES,
  TEST_IMAGE_URL,
  WORLD_PICKER_REGION,
  DEFAULT_START_IN_HOURS,
  DEFAULT_DURATION_HOURS,
  DEFAULT_CACHE_POINTS,
} from '../PrivateMode/constants/PrivateModeConstants';
import {
  parsePositiveNumber,
  validateCacheForm,
  validateEventForm,
  validateInviteCode,
} from '../PrivateMode/validation/PrivateModeValidation';
import JoinEventCard from '../PrivateMode/components/JoinEventCard';
import CreateEventCard from '../PrivateMode/components/CreateEventCard';
import CreateCacheCard from '../PrivateMode/components/CreateCacheCard';
import ParticipantProgressCard from '../PrivateMode/components/ParticipantProgressCard';

export default function PrivateDashboardScreen({ navigation }) {
  const [inviteCode, setInviteCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [startInHours, setStartInHours] = useState(DEFAULT_START_IN_HOURS);
  const [durationHours, setDurationHours] = useState(DEFAULT_DURATION_HOURS);

  const [ownedEventId, setOwnedEventId] = useState(null);
  const [cacheName, setCacheName] = useState('');
  const [cacheClue, setCacheClue] = useState('');
  const [cacheDescription, setCacheDescription] = useState('');
  const [cacheImageURL, setCacheImageURL] = useState(TEST_IMAGE_URL);
  const [cacheLatitude, setCacheLatitude] = useState('');
  const [cacheLongitude, setCacheLongitude] = useState('');
  const [cachePoints, setCachePoints] = useState(DEFAULT_CACHE_POINTS);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);

  const [progress, setProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  // Hardcoded for demonstration; replace with auth user ID from state.
  const currentUserId = '1';

  const activeEventId = useMemo(() => {
    const trimmedInvite = inviteCode.trim();
    if (!trimmedInvite) {
      return ownedEventId;
    }
    const numericInvite = Number(trimmedInvite);
    return Number.isNaN(numericInvite) ? ownedEventId : numericInvite;
  }, [inviteCode, ownedEventId]);

  const loadProgress = async (eventId) => {
    if (!eventId) {
      return;
    }

    setProgressLoading(true);
    try {
      const ranking = await fetchEventProgress(eventId);
      setProgress(ranking);
    } catch (error) {
      console.warn('Failed to fetch event progress:', error?.message || error);
      setProgress([]);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (ownedEventId) {
      loadProgress(ownedEventId);
    }
  }, [ownedEventId]);

  const handleJoinEvent = async () => {
    const code = inviteCode.trim();
    const numericEventId = Number(code);
    const inviteCodeError = validateInviteCode(inviteCode);

    if (inviteCodeError) {
      return Alert.alert('Error', inviteCodeError);
    }

    try {
      await joinPrivateEvent(currentUserId, numericEventId);
      Alert.alert('Success', 'Joined event successfully.');
      navigation.navigate('GlobalTabs', { eventId: numericEventId, eventName: eventName.trim() || undefined });
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to join event. Check the code and try again.');
    }
  };

  const handleCreateEvent = async () => {
    const trimmedName = eventName.trim();
    const trimmedDescription = eventDescription.trim();
    const startOffset = Number(startInHours);
    const duration = parsePositiveNumber(durationHours);
    const eventFormError = validateEventForm({ eventName, startInHours, durationHours });

    if (eventFormError) {
      return Alert.alert('Error', eventFormError);
    }

    const eventStart = new Date(Date.now() + startOffset * 60 * 60 * 1000);
    const eventFinish = new Date(eventStart.getTime() + duration * 60 * 60 * 1000);

    try {
      const newEvent = {
        EventName: trimmedName,
        EventDescription: trimmedDescription || `${eventType} private treasure hunt`,
        EventOwnerID: Number(currentUserId),
        EventIspublic: false,
        EventStatusID: 1,
        EventStart: eventStart.toISOString(),
        EventFinish: eventFinish.toISOString(),
      };

      const response = await createPrivateModeEvent(newEvent);
      const createdEventId = extractCreatedEventId(response);

      if (createdEventId) {
        const normalizedEventId = Number(createdEventId);
        setOwnedEventId(normalizedEventId);
        setInviteCode(String(normalizedEventId));
        await loadProgress(normalizedEventId);
      }

      Alert.alert(
        'Event Created',
        createdEventId
          ? `Invite code: ${createdEventId}. Share this with participants.`
          : 'Event created successfully, but no Event ID was returned by the API.'
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create event.');
    }
  };

  const handleCreateCache = async () => {
    if (!ownedEventId) {
      return Alert.alert('Error', 'Create an event first before adding caches.');
    }

    const trimmedCacheName = cacheName.trim();
    const trimmedCacheClue = cacheClue.trim();
    const trimmedCacheDescription = cacheDescription.trim();
    const trimmedCacheImageURL = cacheImageURL.trim();
    const latitude = Number(cacheLatitude);
    const longitude = Number(cacheLongitude);
    const points = parsePositiveNumber(cachePoints);
    const cacheFormError = validateCacheForm({
      cacheName,
      cacheClue,
      cacheDescription,
      cacheLatitude,
      cacheLongitude,
      cachePoints,
    });

    if (cacheFormError) {
      return Alert.alert('Error', cacheFormError);
    }

    try {
      await createPrivateModeCache(ownedEventId, {
        CacheName: trimmedCacheName,
        CacheClue: trimmedCacheClue,
        CacheDescription: trimmedCacheDescription,
        CacheImageURL: trimmedCacheImageURL,
        CacheLatitude: latitude,
        CacheLongitude: longitude,
        CachePoints: points,
      });

      Alert.alert('Success', 'Cache created for this private event.');
      setCacheName('');
      setCacheClue('');
      setCacheDescription('');
      setCacheImageURL(TEST_IMAGE_URL);
      setCacheLatitude('');
      setCacheLongitude('');
      setCachePoints(DEFAULT_CACHE_POINTS);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create cache.');
    }
  };

  const handleOpenEventMap = () => {
    if (!activeEventId) {
      return Alert.alert('Error', 'Join or create an event first.');
    }

    navigation.navigate('GlobalTabs', {
      eventId: activeEventId,
      eventName: eventName.trim() || undefined,
    });
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCacheLatitude(latitude.toFixed(6));
    setCacheLongitude(longitude.toFixed(6));
  };

  const getPickerRegion = () => {
    const latitude = Number(cacheLatitude);
    const longitude = Number(cacheLongitude);

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      return {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    return WORLD_PICKER_REGION;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Private Event Mode</Text>
      <Text style={styles.subtitle}>Families, Schools, Companies, University Activities</Text>

      <JoinEventCard
        styles={styles}
        inviteCode={inviteCode}
        onInviteCodeChange={setInviteCode}
        onJoinEvent={handleJoinEvent}
      />

      <CreateEventCard
        styles={styles}
        eventName={eventName}
        onEventNameChange={setEventName}
        eventDescription={eventDescription}
        onEventDescriptionChange={setEventDescription}
        eventType={eventType}
        onEventTypeChange={setEventType}
        eventTypes={EVENT_TYPES}
        startInHours={startInHours}
        onStartInHoursChange={setStartInHours}
        durationHours={durationHours}
        onDurationHoursChange={setDurationHours}
        onCreateEvent={handleCreateEvent}
        ownedEventId={ownedEventId}
      />

      <CreateCacheCard
        styles={styles}
        cacheName={cacheName}
        onCacheNameChange={setCacheName}
        cacheClue={cacheClue}
        onCacheClueChange={setCacheClue}
        cacheDescription={cacheDescription}
        onCacheDescriptionChange={setCacheDescription}
        cacheImageURL={cacheImageURL}
        onCacheImageURLChange={setCacheImageURL}
        isMapPickerVisible={isMapPickerVisible}
        onToggleMapPicker={() => setIsMapPickerVisible((prev) => !prev)}
        getPickerRegion={getPickerRegion}
        onMapPress={handleMapPress}
        cacheLatitude={cacheLatitude}
        onCacheLatitudeChange={setCacheLatitude}
        cacheLongitude={cacheLongitude}
        onCacheLongitudeChange={setCacheLongitude}
        cachePoints={cachePoints}
        onCachePointsChange={setCachePoints}
        onCreateCache={handleCreateCache}
      />

      <ParticipantProgressCard
        styles={styles}
        activeEventId={activeEventId}
        progressLoading={progressLoading}
        progress={progress}
        onRefreshProgress={() => loadProgress(activeEventId)}
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