// screens/MapScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

// Adjusting imports to step out of the 'screens' folder
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useCompassHeading } from '../hooks/useCompassHeading';
import { useMotionTracking } from '../hooks/useMotionTracking';
import { useStepCounter } from '../hooks/useStepCounter';
import { useCacheManagement } from '../hooks/useCacheManagement';
import { useCameraProofCapture } from '../hooks/useCameraProofCapture';
import TargetPanel from '../components/TargetPanel';
import StatusBanner from '../components/StatusBanner';
import { appStyles as styles } from '../styles/appStyles';

export default function MapScreen({ route, eventId: eventIdProp, eventName: eventNameProp, eventDiscoveryRadius: eventDiscoveryRadiusProp }) {
  const activeEventId = eventIdProp ?? route?.params?.eventId ?? null;
  const activeEventName = eventNameProp ?? route?.params?.eventName ?? null;
  const activeEventDiscoveryRadius = eventDiscoveryRadiusProp ?? route?.params?.eventDiscoveryRadius ?? null;
  const { location, loading: locationLoading, error: locationError, locationTrust } = useLocationTracking();
  const { motionState, smoothedMagnitude } = useMotionTracking();
  const { heading, headingSource, isHeadingAvailable, sensorError, calibrationHelpText } = useCompassHeading({
    courseHeading: location?.heading,
    courseSpeed: location?.speed,
    motionState,
  });
  const { sessionSteps, isAvailable: isStepCounterAvailable, stepError } = useStepCounter();
  const {
    caches,
    loading: cacheLoading,
    error: cacheError,
    selectedCache,
    distanceToCache,
    targetBearing,
    turnDelta,
    isAligned,
    directionHint,
    canLogDiscovery,
    logAttemptReason,
    isLogging,
    handleSelectCache,
    handleLogDiscovery,
  } = useCacheManagement(location, activeEventId, heading, {
    motionState,
    motionMagnitude: smoothedMagnitude,
    locationTrust,
    discoveryRadius: Number(activeEventDiscoveryRadius) || undefined,
  });
  const {
    capturedImage,
    isCapturing,
    captureError,
    capturePhotoProof,
    clearCapturedPhotoProof,
  } = useCameraProofCapture();
  const lastSelectedCacheIdRef = useRef(null);
  const [isTargetPanelCollapsed, setIsTargetPanelCollapsed] = useState(false);
  const handleSetTargetPanelCollapsed = (nextCollapsed) => {
    setIsTargetPanelCollapsed((previous) => {
      if (typeof nextCollapsed === 'boolean') {
        return nextCollapsed;
      }

      return !previous;
    });
  };

  const isLoading = locationLoading || cacheLoading || (!location && !locationError);
  const loadingTitle = locationLoading
    ? 'Acquiring GPS signal...'
    : cacheLoading
      ? 'Loading cache data...'
      : 'Preparing the map...';
  const loadingSubtitle = locationLoading
    ? 'Waiting for location permission and a stable GPS fix.'
    : cacheLoading
      ? 'Fetching caches and gameplay state for this event.'
      : 'The map will appear as soon as your location is ready.';

  const feedbackBanners = [
    activeEventId
      ? {
          key: 'event',
          variant: 'success',
          title: 'Private Event',
          message: activeEventName
            ? `${activeEventName} (#${activeEventId})`
            : `Event #${activeEventId}`,
        }
      : null,
    sensorError
      ? {
          key: 'sensor',
          variant: 'warning',
          title: 'Compass limited',
          message: sensorError,
        }
      : null,
    cacheError
      ? {
          key: 'cache',
          variant: 'error',
          title: 'Cache data unavailable',
          message: cacheError,
        }
      : null,
    locationTrust && !locationTrust.isTrusted
      ? {
          key: 'location-trust',
          variant: 'warning',
          title: 'Location quality limited',
          message: locationTrust.warningText || 'Waiting for a stronger GPS fix before trusting guidance.',
        }
      : null,
  ].filter(Boolean);

  const renderBannerStack = (compact = false) => {
    if (feedbackBanners.length === 0) {
      return null;
    }

    return (
      <View style={styles.bannerStack} pointerEvents="box-none">
        {feedbackBanners.map((banner) => (
          <StatusBanner
            key={banner.key}
            variant={banner.variant}
            title={banner.title}
            message={banner.message}
            compact={compact}
          />
        ))}
      </View>
    );
  };

  useEffect(() => {
    const currentCacheId = selectedCache?.CacheID ?? null;

    if (lastSelectedCacheIdRef.current !== currentCacheId) {
      clearCapturedPhotoProof();
      lastSelectedCacheIdRef.current = currentCacheId;
      setIsTargetPanelCollapsed(false);
    }
  }, [selectedCache, clearCapturedPhotoProof]);

  useEffect(() => {
    clearCapturedPhotoProof();
    lastSelectedCacheIdRef.current = null;
    setIsTargetPanelCollapsed(false);
  }, [activeEventId, clearCapturedPhotoProof]);

  if (locationError && !location) {
    return (
      <View style={styles.loadingContainer}>
        {renderBannerStack()}
        <StatusBanner
          variant="error"
          title="Location unavailable"
          message={locationError}
        />
        <Text style={styles.loadingText}>GeoQuest needs location access to place you on the map.</Text>
        <Text style={styles.loadingSubtext}>Grant permission in device settings, then reopen the app.</Text>
      </View>
    );
  }

  if (isLoading || !location) {
    return (
      <View style={styles.loadingContainer}>
        {renderBannerStack()}
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{loadingTitle}</Text>
        <Text style={styles.loadingSubtext}>{loadingSubtitle}</Text>
      </View>
    );
  }

  const isWithinRange = canLogDiscovery;

  return (
    <View style={styles.container}>
      {renderBannerStack(true)}
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
          sessionSteps={sessionSteps}
          isStepCounterAvailable={isStepCounterAvailable}
          stepError={stepError}
          targetBearing={targetBearing}
          turnDelta={turnDelta}
          isAligned={isAligned}
          directionHint={directionHint}
          headingSource={headingSource}
          calibrationHelpText={calibrationHelpText}
          guidanceWarningText={locationTrust?.warningText || null}
          logAttemptReason={logAttemptReason}
          distanceTrendText={distanceTrendText}
          distanceTrendTone={distanceTrendTone}
          isWithinRange={isWithinRange}
          isLogging={isLogging}
          capturedImage={capturedImage}
          isCapturing={isCapturing}
          captureError={captureError}
          isCollapsed={isTargetPanelCollapsed}
          onToggleCollapse={handleSetTargetPanelCollapsed}
          onCaptureProof={capturePhotoProof}
          onClearProof={clearCapturedPhotoProof}
          onLogDiscovery={() => handleLogDiscovery(capturedImage?.uri || null)}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}