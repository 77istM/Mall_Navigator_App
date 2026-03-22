// screens/MapScreen.js
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

// Adjusting imports to step out of the 'screens' folder
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useCacheManagement } from '../hooks/useCacheManagement';
import TargetPanel from '../components/TargetPanel';
import { DISCOVERY_RADIUS } from '../constants/appConstants';
import { appStyles as styles } from '../styles/appStyles';

export default function MapScreen() {
  const { location, error: locationError } = useLocationTracking();
  const {
    caches,
    loading,
    selectedCache,
    distanceToCache,
    isLogging,
    handleSelectCache,
    handleLogDiscovery,
  } = useCacheManagement(location);

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{locationError || 'Acquiring GPS and Caches...'}</Text>
      </View>
    );
  }

  const isWithinRange = distanceToCache !== null && distanceToCache <= DISCOVERY_RADIUS;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {caches.map((cache) => (
          <Marker
            key={cache.CacheID}
            coordinate={{
              latitude: cache.CacheLatitude,
              longitude: cache.CacheLongitude,
            }}
            title={cache.CacheName}
            pinColor={selectedCache?.CacheID === cache.CacheID ? "blue" : "gold"}
            onPress={() => handleSelectCache(cache)}
          >
            <Callout>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{cache.CacheName}</Text>
                <Text>Clue: {cache.CacheClue}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {selectedCache && (
        <TargetPanel
          selectedCache={selectedCache}
          distanceToCache={distanceToCache}
          isWithinRange={isWithinRange}
          isLogging={isLogging}
          onLogDiscovery={handleLogDiscovery}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}