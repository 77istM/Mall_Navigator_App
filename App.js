import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { getPublicCaches, logFind } from './api'; 

// --- Helper: Haversine Formula for Distance Calculation ---
// Calculates distance in meters between two lat/lon coordinates
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => deg * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [caches, setCaches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State Variables for Navigation & Logging
  const [selectedCache, setSelectedCache] = useState(null);
  const [distanceToCache, setDistanceToCache] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  const DISCOVERY_RADIUS = 5000000; //testing  User must be within 5000000 meters to log

  useEffect(() => {
    let locationSubscription;

    (async () => {
      // 1. Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // 2. Fetch public caches from the API
      try {
        const cacheData = await getPublicCaches();
        setCaches(cacheData);
      } catch (error) {
        Alert.alert("Error", "Could not fetch caches from the API.");
      } finally {
        setLoading(false);
      }

      // 3. Start watching the user's location continuously
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 5, // Or every 5 meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    })();

    // Cleanup subscription when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Recalculate distance whenever location OR selected cache changes
  useEffect(() => {
    if (location && selectedCache) {
      const distance = getDistanceInMeters(
        location.latitude,
        location.longitude,
        selectedCache.CacheLatitude,
        selectedCache.CacheLongitude
      );
      setDistanceToCache(Math.round(distance));
    } else {
      setDistanceToCache(null);
    }
  }, [location, selectedCache]);

  const handleLogDiscovery = async () => {
    if (!selectedCache) return;
    
    setIsLogging(true);
    try {
      // Using dummy PlayerID 1 for now based on the GeoQuest API docs
      await logFind(1, selectedCache.CacheID);
      Alert.alert("Success!", `You found ${selectedCache.CacheName} and earned ${selectedCache.CachePoints} points!`);
      // Optionally: Remove the cache from the map or mark it as 'found' visually
      setSelectedCache(null); 
    } catch (error) {
      Alert.alert("Error", "Failed to log discovery. Try again.");
    } finally {
      setIsLogging(false);
    }
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Acquiring GPS and Caches...</Text>
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
          latitudeDelta: 0.01, // Zoomed in a bit closer for walking
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
            onPress={() => setSelectedCache(cache)} // Set target on press
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

      {/* Target & Navigation Panel (Only shows when a cache is tapped) */}
      {selectedCache && (
        <View style={styles.targetPanel}>
          <Text style={styles.panelTitle}>Target: {selectedCache.CacheName}</Text>
          <Text style={styles.panelDistance}>
            Distance: {distanceToCache !== null ? `${distanceToCache} meters` : 'Calculating...'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.logButton, !isWithinRange && styles.logButtonDisabled]}
            disabled={!isWithinRange || isLogging}
            onPress={handleLogDiscovery}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logButtonText}>
                {isWithinRange ? "Log Discovery!" : "Get Closer to Log"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  calloutView: { width: 200, padding: 10 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
  
  // New UI Styles
  targetPanel: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
  panelDistance: { fontSize: 16, marginVertical: 10, color: '#555' },
  logButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logButtonDisabled: { backgroundColor: '#cccccc' },
  logButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});