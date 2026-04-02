import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import StatusBanner from '../../components/StatusBanner';

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
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Owner: Create Caches</Text>
      {cacheStatus?.message ? (
        <StatusBanner compact variant={cacheStatus.tone || 'info'} message={cacheStatus.message} />
      ) : null}
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
      <TouchableOpacity style={[styles.createButton, isCreatingCache ? styles.buttonDisabled : null]} onPress={onCreateCache} disabled={isCreatingCache}>
        {isCreatingCache ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Cache</Text>}
      </TouchableOpacity>
    </View>
  );
}
