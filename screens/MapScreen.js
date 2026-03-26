// screens/MapScreen.js
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

// Adjusting imports to step out of the 'screens' folder
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useCompassHeading } from '../hooks/useCompassHeading';
import { useMotionTracking } from '../hooks/useMotionTracking';
import { useCacheManagement } from '../hooks/useCacheManagement';
import { useCameraProofCapture } from '../hooks/useCameraProofCapture';
import TargetPanel from '../components/TargetPanel';
import { DISCOVERY_RADIUS } from '../constants/appConstants';
import { appStyles as styles } from '../styles/appStyles';

export default function MapScreen({ route, eventId: eventIdProp, eventName: eventNameProp }) {
  const activeEventId = eventIdProp ?? route?.params?.eventId ?? null;
  const activeEventName = eventNameProp ?? route?.params?.eventName ?? null;
  const { location, error: locationError } = useLocationTracking();
  const { heading, isHeadingAvailable, sensorError } = useCompassHeading();
  const { motionState, smoothedMagnitude } = useMotionTracking();
  const {
    caches,
    loading,
    selectedCache,
    distanceToCache,
    targetBearing,
    turnDelta,
    directionHint,
    isLogging,
    handleSelectCache,
    handleLogDiscovery,
  } = useCacheManagement(location, activeEventId, heading);
  const {
    capturedImage,
    isCapturing,
    captureError,
    capturePhotoProof,
    clearCapturedPhotoProof,
  } = useCameraProofCapture();
  const lastSelectedCacheIdRef = useRef(null);

  useEffect(() => {
    const currentCacheId = selectedCache?.CacheID ?? null;

    if (lastSelectedCacheIdRef.current !== currentCacheId) {
      clearCapturedPhotoProof();
      lastSelectedCacheIdRef.current = currentCacheId;
    }
  }, [selectedCache, clearCapturedPhotoProof]);

  useEffect(() => {
    clearCapturedPhotoProof();
    lastSelectedCacheIdRef.current = null;
  }, [activeEventId, clearCapturedPhotoProof]);

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
      {activeEventId ? (
        <View style={styles.PrivateModeBanner}>
          <Text style={styles.PrivateModeBannerText}>
            {activeEventName
              ? `Private Event: ${activeEventName} (#${activeEventId})`
              : `Private Event #${activeEventId}`}
          </Text>
        </View>
      ) : null}
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
          heading={heading}
          isHeadingAvailable={isHeadingAvailable}
          sensorError={sensorError}
          motionState={motionState}
          motionMagnitude={smoothedMagnitude}
          targetBearing={targetBearing}
          turnDelta={turnDelta}
          directionHint={directionHint}
          isWithinRange={isWithinRange}
          isLogging={isLogging}
          capturedImage={capturedImage}
          isCapturing={isCapturing}
          captureError={captureError}
          onCaptureProof={capturePhotoProof}
          onClearProof={clearCapturedPhotoProof}
          onLogDiscovery={() => handleLogDiscovery(capturedImage?.uri || null)}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}