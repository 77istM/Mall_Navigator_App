import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {
  createPrivateEvent,
  joinEvent,
  createEventCache,
  getEventLeaderboard,
} from '../api';

const EVENT_TYPES = ['Families', 'Schools', 'Companies', 'University Activities'];
const TEST_IMAGE_URL = 'https://imgs.search.brave.com/QepbmUa7ANhll-Fjdx6_3dxZxzRVSNNg5JCt8Nbiehk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI5/OTQ5MjY4Mi9waG90/by9jYXQtaW4teW91/ci1mYWNlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz05WDAt/VlRQRktHakN0QzFa/Tkc4YUUxb2hoaU1z/c3V0RDgwWEtBZk9P/X3VvPQ';
const WORLD_PICKER_REGION = {
  // Balanced global framing so first glance shows major continents.
  latitude: 51.553463,
  longitude: -0.103881,
  latitudeDelta: 80,
  longitudeDelta: 320,
};

const asPositiveNumber = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export default function PrivateDashboardScreen({ navigation }) {
  const [inviteCode, setInviteCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [startInHours, setStartInHours] = useState('0');
  const [durationHours, setDurationHours] = useState('24');

  const [ownedEventId, setOwnedEventId] = useState(null);
  const [cacheName, setCacheName] = useState('');
  const [cacheClue, setCacheClue] = useState('');
  const [cacheDescription, setCacheDescription] = useState('');
  const [cacheImageURL, setCacheImageURL] = useState(TEST_IMAGE_URL);
  const [cacheLatitude, setCacheLatitude] = useState('');
  const [cacheLongitude, setCacheLongitude] = useState('');
  const [cachePoints, setCachePoints] = useState('10');
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
      const ranking = await getEventLeaderboard(eventId);
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

    if (!code || Number.isNaN(numericEventId)) {
      return Alert.alert('Error', 'Please enter a valid numeric invite code (Event ID).');
    }

    try {
      await joinEvent(Number(currentUserId), numericEventId);
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
    const duration = asPositiveNumber(durationHours);

    if (!trimmedName) {
      return Alert.alert('Error', 'Event name is required.');
    }
    if (trimmedName.length < 8) {
      return Alert.alert('Error', 'Event name must be at least 8 characters long.');
    }
    if (Number.isNaN(startOffset) || startOffset < 0) {
      return Alert.alert('Error', 'Start offset hours must be 0 or more.');
    }
    if (!duration) {
      return Alert.alert('Error', 'Duration must be a positive number of hours.');
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

      const response = await createPrivateEvent(newEvent);
      const createdEventId = response?.EventID ?? response?.[0]?.EventID;

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
    const points = asPositiveNumber(cachePoints);

    if (!trimmedCacheName || !trimmedCacheClue) {
      return Alert.alert('Error', 'Cache name and clue are required.');
    }
    if (trimmedCacheClue.length < 4) {
      return Alert.alert('Error', 'Cache clue must be at least 4 characters long.');
    }
    if (!trimmedCacheDescription) {
      return Alert.alert('Error', 'Cache description is required.');
    }
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return Alert.alert('Error', 'Latitude must be a valid value between -90 and 90.');
    }
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return Alert.alert('Error', 'Longitude must be a valid value between -180 and 180.');
    }
    if (!points) {
      return Alert.alert('Error', 'Cache points must be a positive number.');
    }

    try {
      await createEventCache(ownedEventId, {
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
      setCachePoints('10');
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

      <View style={styles.card}>
        <Text style={styles.header}>Participant</Text>
        <TextInput
          style={styles.input}
          placeholder="Invite Code (Event ID)"
          value={inviteCode}
          onChangeText={setInviteCode}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
          <Text style={styles.buttonText}>Join via Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Event Owner</Text>
        <TextInput
          style={styles.input}
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          value={eventDescription}
          onChangeText={setEventDescription}
        />

        <Text style={styles.label}>Event Type</Text>
        <View style={styles.chipRow}>
          {EVENT_TYPES.map((type) => {
            const isSelected = eventType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setEventType(type)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Time Window</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Starts in hours"
            value={startInHours}
            onChangeText={setStartInHours}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.rowInput, styles.rowInputLast]}
            placeholder="Duration (hours)"
            value={durationHours}
            onChangeText={setDurationHours}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
          <Text style={styles.buttonText}>Create Private Event</Text>
        </TouchableOpacity>

        {ownedEventId ? (
          <Text style={styles.infoText}>Owner Invite Code: {ownedEventId}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Owner: Create Caches</Text>
        <TextInput
          style={styles.input}
          placeholder="Cache Name"
          value={cacheName}
          onChangeText={setCacheName}
        />
        <TextInput
          style={styles.input}
          placeholder="Cache Clue"
          value={cacheClue}
          onChangeText={setCacheClue}
        />
        <TextInput
          style={styles.input}
          placeholder="Cache Description"
          value={cacheDescription}
          onChangeText={setCacheDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Cache Image URL (optional)"
          value={cacheImageURL}
          onChangeText={setCacheImageURL}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsMapPickerVisible((prev) => !prev)}
        >
          <Text style={styles.secondaryButtonText}>
            {isMapPickerVisible ? 'Hide Map Picker' : 'Use Map to Pinpoint Location'}
          </Text>
        </TouchableOpacity>

        {isMapPickerVisible ? (
          <View style={styles.mapPickerContainer}>
            <Text style={styles.mapPickerHint}>Tap on map to set cache coordinates</Text>
            <MapView
              style={styles.mapPicker}
              initialRegion={getPickerRegion()}
              onPress={handleMapPress}
            >
              {cacheLatitude && cacheLongitude ? (
                <Marker
                  coordinate={{
                    latitude: Number(cacheLatitude),
                    longitude: Number(cacheLongitude),
                  }}
                />
              ) : null}
            </MapView>
          </View>
        ) : null}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Latitude"
            value={cacheLatitude}
            onChangeText={setCacheLatitude}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.rowInput, styles.rowInputLast]}
            placeholder="Longitude"
            value={cacheLongitude}
            onChangeText={setCacheLongitude}
            keyboardType="numeric"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Points"
          value={cachePoints}
          onChangeText={setCachePoints}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreateCache}>
          <Text style={styles.buttonText}>Create Cache</Text>
        </TouchableOpacity>
      </View>

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

        <TouchableOpacity style={styles.secondaryButton} onPress={() => loadProgress(activeEventId)}>
          <Text style={styles.secondaryButtonText}>Refresh Progress</Text>
        </TouchableOpacity>
      </View>

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