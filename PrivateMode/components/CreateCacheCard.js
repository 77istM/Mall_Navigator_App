import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Owner: Create Caches</Text>
      <TextInput
        style={styles.input}
        placeholder="Cache Name"
        value={cacheName}
        onChangeText={onCacheNameChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Clue"
        value={cacheClue}
        onChangeText={onCacheClueChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Description"
        value={cacheDescription}
        onChangeText={onCacheDescriptionChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Cache Image URL (optional)"
        value={cacheImageURL}
        onChangeText={onCacheImageURLChange}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={onToggleMapPicker}>
        <Text style={styles.secondaryButtonText}>
          {isMapPickerVisible ? 'Hide Map Picker' : 'Use Map to Pinpoint Location'}
        </Text>
      </TouchableOpacity>

      {isMapPickerVisible ? (
        <View style={styles.mapPickerContainer}>
          <Text style={styles.mapPickerHint}>Tap on map to set cache coordinates</Text>
          <MapView style={styles.mapPicker} initialRegion={getPickerRegion()} onPress={onMapPress}>
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
        />
        <TextInput
          style={[styles.input, styles.rowInput, styles.rowInputLast]}
          placeholder="Longitude"
          value={cacheLongitude}
          onChangeText={onCacheLongitudeChange}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Points"
        value={cachePoints}
        onChangeText={onCachePointsChange}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.createButton} onPress={onCreateCache}>
        <Text style={styles.buttonText}>Create Cache</Text>
      </TouchableOpacity>
    </View>
  );
}
