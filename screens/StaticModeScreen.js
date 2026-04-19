import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { normalizeCapturedImageAsset, isValidCapturedImageAsset } from '../utils/imageCaptureValidation';
import { getBearingInDegrees, getDistanceInMeters } from '../utils/navigation';
import { denormalizeLayoutPoint, getLayoutDistance, getSegmentGeometry, normalizeLayoutPoint } from '../utils/staticModeLayout';
import StatusBanner from '../components/StatusBanner';

const TOOLS = {
  CACHE: 'cache',
  PATH: 'path',
  SOURCE: 'source',
};

const IMAGE_CANVAS_HEIGHT = 320;
const MARKER_SIZE = 20;

const createCacheFromPoint = ({ point, location, name, clue, imageUri }) => ({
  id: String(Date.now() + Math.random()),
  name: name.trim() || `Cache ${Date.now() % 1000}`,
  clue: clue.trim() || 'Tap to add a clue',
  point,
  latitude: location?.latitude ?? null,
  longitude: location?.longitude ?? null,
  imageUri,
});

export default function StaticModeScreen() {
  const { location, loading: locationLoading, error: locationError } = useLocationTracking();
  const [imageAsset, setImageAsset] = useState(null);
  const [canvasLayout, setCanvasLayout] = useState({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState(TOOLS.CACHE);
  const [sourcePoint, setSourcePoint] = useState({ x: 0.5, y: 0.8 });
  const [pathPoints, setPathPoints] = useState([]);
  const [caches, setCaches] = useState([]);
  const [selectedCacheId, setSelectedCacheId] = useState(null);
  const [cacheName, setCacheName] = useState('');
  const [cacheClue, setCacheClue] = useState('');

  const selectedCache = useMemo(
    () => caches.find((cache) => cache.id === selectedCacheId) || null,
    [caches, selectedCacheId],
  );

  const routeSummary = useMemo(() => {
    if (!selectedCache) {
      return null;
    }

    const imageDistance = getLayoutDistance(sourcePoint, selectedCache.point);

    if (location && Number.isFinite(selectedCache.latitude) && Number.isFinite(selectedCache.longitude)) {
      return {
        mode: 'gps',
        distanceMeters: Math.round(getDistanceInMeters(location.latitude, location.longitude, selectedCache.latitude, selectedCache.longitude)),
        bearing: getBearingInDegrees(location.latitude, location.longitude, selectedCache.latitude, selectedCache.longitude),
        imageDistance: Number.isFinite(imageDistance) ? Math.round(imageDistance * 1000) / 1000 : null,
      };
    }

    return {
      mode: 'image',
      distanceMeters: null,
      bearing: null,
      imageDistance: Number.isFinite(imageDistance) ? Math.round(imageDistance * 1000) / 1000 : null,
    };
  }, [location, selectedCache, sourcePoint]);

  const headerBanners = useMemo(() => {
    const banners = [];

    if (locationError) {
      banners.push({
        key: 'location',
        variant: 'warning',
        title: 'GPS limited',
        message: locationError,
      });
    }

    if (selectedCache && routeSummary?.mode === 'gps') {
      banners.push({
        key: 'route',
        variant: 'success',
        title: 'Navigation ready',
        message: `Distance ${routeSummary.distanceMeters}m, bearing ${routeSummary.bearing}°`,
      });
    }

    if (selectedCache && routeSummary?.mode === 'image') {
      banners.push({
        key: 'fallback',
        variant: 'info',
        title: 'Manual fallback active',
        message: 'Live GPS is unavailable, so the route is being drawn from the image start point.',
      });
    }

    return banners;
  }, [locationError, routeSummary, selectedCache]);

  const pickImage = useCallback(async (source) => {
    try {
      if (source === 'camera' && Platform.OS === 'web') {
        Alert.alert('Camera unavailable', 'Use the gallery picker on web.');
        return;
      }

      const pickerResult = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });

      const normalizedAsset = normalizeCapturedImageAsset(pickerResult);

      if (!normalizedAsset || !isValidCapturedImageAsset(normalizedAsset)) {
        return;
      }

      setImageAsset(normalizedAsset);
      setSelectedCacheId(null);
      setCaches([]);
      setPathPoints([]);
      setSourcePoint({ x: 0.5, y: 0.8 });
    } catch (error) {
      Alert.alert('Image selection failed', error?.message || 'Unable to load image.');
    }
  }, []);

  const handleCanvasTap = useCallback((event) => {
    if (!imageAsset || canvasLayout.width <= 0 || canvasLayout.height <= 0) {
      return;
    }

    const tapPoint = normalizeLayoutPoint({
      x: event?.nativeEvent?.locationX,
      y: event?.nativeEvent?.locationY,
      width: canvasLayout.width,
      height: canvasLayout.height,
    });

    if (!tapPoint) {
      return;
    }

    if (activeTool === TOOLS.SOURCE) {
      setSourcePoint(tapPoint);
      return;
    }

    if (activeTool === TOOLS.PATH) {
      setPathPoints((previous) => [...previous, tapPoint]);
      return;
    }

    const nextCache = createCacheFromPoint({
      point: tapPoint,
      location,
      name: cacheName,
      clue: cacheClue,
      imageUri: imageAsset.uri,
    });

    setCaches((previous) => [...previous, nextCache]);
    setSelectedCacheId(nextCache.id);
    setCacheName('');
    setCacheClue('');
  }, [activeTool, cacheClue, cacheName, canvasLayout.height, canvasLayout.width, imageAsset, location]);

  const routePathSegments = useMemo(() => {
    const points = [sourcePoint, ...pathPoints, selectedCache?.point].filter(Boolean);

    if (points.length < 2 || canvasLayout.width <= 0 || canvasLayout.height <= 0) {
      return [];
    }

    return points.slice(0, -1).map((point, index) => getSegmentGeometry(point, points[index + 1], canvasLayout.width, canvasLayout.height)).filter(Boolean);
  }, [canvasLayout.height, canvasLayout.width, pathPoints, selectedCache, sourcePoint]);

  const sourceMarkerPosition = useMemo(
    () => denormalizeLayoutPoint(sourcePoint, canvasLayout.width, canvasLayout.height),
    [canvasLayout.height, canvasLayout.width, sourcePoint],
  );

  const locationStatusText = location
    ? `Live GPS available at ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
    : locationLoading
      ? 'Waiting for live location...'
      : 'Live GPS is unavailable, so Static Mode will use the manual start point.';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Static Mode</Text>
      <Text style={styles.subtitle}>Upload a schema image, place caches on top, and sketch the main path.</Text>

      {headerBanners.map((banner) => (
        <StatusBanner
          key={banner.key}
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      ))}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Add a schema image</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage('library')}>
            <Text style={styles.secondaryButtonText}>Choose from gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage('camera')}>
            <Text style={styles.primaryButtonText}>Take a photo</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>{locationStatusText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Layout tools</Text>
        <View style={styles.toolRow}>
          <TouchableOpacity style={[styles.toolButton, activeTool === TOOLS.CACHE ? styles.toolButtonActive : null]} onPress={() => setActiveTool(TOOLS.CACHE)}>
            <Text style={[styles.toolButtonText, activeTool === TOOLS.CACHE ? styles.toolButtonTextActive : null]}>Place cache</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toolButton, activeTool === TOOLS.PATH ? styles.toolButtonActive : null]} onPress={() => setActiveTool(TOOLS.PATH)}>
            <Text style={[styles.toolButtonText, activeTool === TOOLS.PATH ? styles.toolButtonTextActive : null]}>Draw path</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toolButton, activeTool === TOOLS.SOURCE ? styles.toolButtonActive : null]} onPress={() => setActiveTool(TOOLS.SOURCE)}>
            <Text style={[styles.toolButtonText, activeTool === TOOLS.SOURCE ? styles.toolButtonTextActive : null]}>Set start</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.input} placeholder="Cache name" value={cacheName} onChangeText={setCacheName} />
        <TextInput style={styles.input} placeholder="Cache clue" value={cacheClue} onChangeText={setCacheClue} />
      </View>

      <View
        style={styles.canvasWrapper}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setCanvasLayout({ width, height });
        }}
      >
        {imageAsset ? (
          <Image source={{ uri: imageAsset.uri }} style={styles.canvasImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyCanvas}>
            <Text style={styles.emptyCanvasTitle}>No image loaded yet</Text>
            <Text style={styles.emptyCanvasText}>Choose a gallery image or take a photo to begin.</Text>
          </View>
        )}

        {imageAsset ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCanvasTap} />
        ) : null}

        {routePathSegments.map((segment, index) => (
          <View
            key={`segment-${index}`}
            style={[
              styles.pathSegment,
              {
                left: segment.left,
                top: segment.top,
                width: segment.width,
                transform: segment.transform,
              },
            ]}
          />
        ))}

        {sourceMarkerPosition ? (
          <View
            style={[
              styles.sourceMarker,
              {
                left: sourceMarkerPosition.x - MARKER_SIZE / 2,
                top: sourceMarkerPosition.y - MARKER_SIZE / 2,
              },
            ]}
          >
            <Text style={styles.sourceMarkerText}>S</Text>
          </View>
        ) : null}

        {caches.map((cache) => {
          const position = denormalizeLayoutPoint(cache.point, canvasLayout.width, canvasLayout.height);
          if (!position) {
            return null;
          }

          return (
            <Pressable
              key={cache.id}
              onPress={() => setSelectedCacheId(cache.id)}
              style={[
                styles.cacheMarker,
                cache.id === selectedCacheId ? styles.cacheMarkerSelected : null,
                {
                  left: position.x - MARKER_SIZE / 2,
                  top: position.y - MARKER_SIZE / 2,
                },
              ]}
            >
              <Text style={styles.cacheMarkerText}>C</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>3. Cache navigation</Text>
        <Text style={styles.helperText}>Tap the image in cache mode to place a cache, then tap a cache marker to inspect the route.</Text>
        {selectedCache ? (
          <>
            <Text style={styles.selectedTitle}>{selectedCache.name}</Text>
            <Text style={styles.selectedSubtitle}>{selectedCache.clue}</Text>
            <Text style={styles.routeText}>
              {routeSummary?.mode === 'gps'
                ? `GPS distance: ${routeSummary.distanceMeters}m | Bearing: ${routeSummary.bearing}°`
                : `Image route length: ${routeSummary?.imageDistance ?? '-'} units`}
            </Text>
            <Text style={styles.routeText}>Path points: {pathPoints.length}</Text>
          </>
        ) : (
          <Text style={styles.helperText}>No cache selected yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexGrow: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexGrow: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '800',
  },
  helperText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  toolButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  toolButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  toolButtonText: {
    color: '#374151',
    fontWeight: '700',
  },
  toolButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  canvasWrapper: {
    position: 'relative',
    height: IMAGE_CANVAS_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111827',
    marginBottom: 14,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  emptyCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyCanvasTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyCanvasText: {
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  pathSegment: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },
  sourceMarker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sourceMarkerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  cacheMarker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cacheMarkerSelected: {
    backgroundColor: '#10b981',
  },
  cacheMarkerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  selectedSubtitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 13,
  },
  routeText: {
    marginTop: 8,
    color: '#111827',
    fontWeight: '700',
  },
});