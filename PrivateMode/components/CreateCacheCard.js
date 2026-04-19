import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import InlineStatusMessage from '../../components/InlineStatusMessage';
import LoadingActionButton from '../../components/LoadingActionButton';

export default function CreateCacheCard({
  styles,
  cacheName,
  onCacheNameChange,
  cacheClue,
  onCacheClueChange,
  cacheDescription,
  onCacheDescriptionChange,
  cacheImageURL,
  onCacheImageURLChange,
  isMapPickerVisible,
  onToggleMapPicker,
  getPickerRegion,
  onMapPress,
  cacheLatitude,
  onCacheLatitudeChange,
  cacheLongitude,
  onCacheLongitudeChange,
  cachePoints,
  onCachePointsChange,
  onCreateCache,
  isCreatingCache,
  cacheStatus,
  ownedEventId,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Owner: Create Items</Text>
      {!ownedEventId ? (
        <Text style={{ color: 'red', fontSize: 12, marginTop: 4, marginBottom: 8 }}>
          Create an event first to add caches.
        </Text>
      ) : null}
      <InlineStatusMessage status={cacheStatus} />
      <TextInput
        style={styles.input}
        placeholder="Cache Name"
        value={cacheName}
        onChangeText={onCacheNameChange}
        editable={!isCreatingCache}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Clue"
        value={cacheClue}
        onChangeText={onCacheClueChange}
        editable={!isCreatingCache}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Description"
        value={cacheDescription}
        onChangeText={onCacheDescriptionChange}
        editable={!isCreatingCache}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Image URL (optional)"
        value={cacheImageURL}
        onChangeText={onCacheImageURLChange}
        autoCapitalize="none"
        editable={!isCreatingCache}
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={onToggleMapPicker} disabled={isCreatingCache}>
        <Text style={styles.secondaryButtonText}>
          {isMapPickerVisible ? 'Hide Map Picker' : 'Use Map to Pinpoint Location'}
        </Text>
      </TouchableOpacity>

      {isMapPickerVisible ? (
        <View style={styles.mapPickerContainer}>
          <Text style={styles.mapPickerHint}>Tap on map to set cache coordinates</Text>
          <MapView style={styles.mapPicker} initialRegion={getPickerRegion()} onPress={isCreatingCache ? undefined : onMapPress}>
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
          onChangeText={onCacheLatitudeChange}
          keyboardType="numeric"
          editable={!isCreatingCache}
        />
        <TextInput
          style={[styles.input, styles.rowInput, styles.rowInputLast]}
          placeholder="Longitude"
          value={cacheLongitude}
          onChangeText={onCacheLongitudeChange}
          keyboardType="numeric"
          editable={!isCreatingCache}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Points"
        value={cachePoints}
        onChangeText={onCachePointsChange}
        keyboardType="numeric"
        editable={!isCreatingCache}
      />
      <LoadingActionButton
        style={styles.createButton}
        disabledStyle={styles.buttonDisabled}
        textStyle={styles.buttonText}
        loading={isCreatingCache}
        onPress={onCreateCache}
        label="Create Item"
      />
    </View>
  );
}
