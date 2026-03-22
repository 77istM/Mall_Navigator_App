import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

// Custom Hooks
import { useLocationTracking } from './hooks/useLocationTracking';
import { useCacheManagement } from './hooks/useCacheManagement';

// Components
import { TargetPanel } from './components/TargetPanel';

// Utils
import { appStyles } from './styles/appStyles';
import { DISCOVERY_RADIUS, MAP_REGION } from './constants/appConstants';

export default function App() {
  // Location tracking hook
  const { location, loading: locationLoading, error: locationError } = useLocationTracking();

  // Cache management hook
  const {
    caches,
    loading: cachesLoading,
    selectedCache,
    distanceToCache,
    handleSelectCache,
    handleLogDiscovery,
    isLogging,
  } = useCacheManagement(location);

  const isWithinRange = distanceToCache !== null && distanceToCache <= DISCOVERY_RADIUS;

  // Show loading screen while acquiring GPS and caches
  if (locationLoading || cachesLoading || !location) {
    return (
      <View style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Acquiring GPS and Caches...</Text>
      </View>
    );
  }

  return (
    <View style={appStyles.container}>
      <MapView 
        style={appStyles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: MAP_REGION.LATITUDE_DELTA,
          longitudeDelta: MAP_REGION.LONGITUDE_DELTA,
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
              <View style={appStyles.calloutView}>
                <Text style={appStyles.calloutTitle}>{cache.CacheName}</Text>
                <Text>Clue: {cache.CacheClue}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Target & Navigation Panel */}
      <TargetPanel
        selectedCache={selectedCache}
        distanceToCache={distanceToCache}
        isWithinRange={isWithinRange}
        isLogging={isLogging}
        onLogDiscovery={handleLogDiscovery}
      />

      <StatusBar style="auto" />
    </View>
  );
}