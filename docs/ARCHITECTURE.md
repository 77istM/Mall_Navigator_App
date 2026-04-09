# GeoQuest Architecture

## Overview
GeoQuest uses a feature-oriented React Native + Expo structure. Screen components orchestrate flow, hooks manage stateful behavior, and services/utilities hold reusable logic.

## Runtime Flow
1. App starts in `App.js` with stack + tab navigation.
2. User enters either global gameplay tabs or private mode dashboard.
3. `MapScreen` composes location, heading, motion, route, and cache hooks.
4. `TargetPanel` presents actionable guidance and discovery controls.
5. Discovery logging routes through trust/radius checks and API calls.

## Module Boundaries

### Screens
- screens/HomeScreen.js: mode entry.
- screens/MapScreen.js: map gameplay orchestration.
- screens/LeaderboardScreen.js: ranking display.
- screens/PrivateScreen.js: private event workflows.

### Hooks
- hooks/sensors/index.js: sensor-domain entry point.
- hooks/gameplay/index.js: gameplay-domain entry point.
- hooks/useLocationTracking.js: location permission + GPS updates + trust state.
- hooks/useCacheManagement.js: cache selection, distance, and discovery logging.
- hooks/useRouteGuidance.js: route fetch + fallback guidance mode.
- hooks/useEventManagement.js: private event create/join/invite actions.

### Services and Utilities
- services/navigation/routeService.js: route provider integration.
- PrivateMode/services/PrivateModeService.js: private mode API and invite sharing.
- utils/navigation/index.js: consolidated navigation math and trust exports.
- utils/routeNormalization.js: route response normalization.
- utils/imageCaptureValidation.js: proof-image checks.

### Constants
- constants/appConstants.js: gameplay thresholds, timing, guidance modes.
- constants/featureFlags.js: staged feature rollout switches.

## Data Flow
1. App.js routes users into global tabs or private dashboard.
2. screens/MapScreen.js composes sensor and gameplay hooks.
3. hooks/useLocationTracking.js emits location and trust state.
4. hooks/useCacheManagement.js evaluates distance/trust and controls discovery logging.
5. hooks/useRouteGuidance.js adds route guidance and fallback mode behavior.
6. components/TargetPanel.js renders guidance, proof capture, and discovery actions.

## Platform API Usage
- expo-location for continuous foreground tracking.
- expo-sensors for heading and motion signals.
- expo-image-picker for proof capture.
- react-native-maps for user marker, cache markers, and route polyline.

## Deep Linking
- Scheme: geoquest://
- Join path: geoquest://join?inviteCode=<code>&autoJoin=1
- App.js parses params and screens/PrivateScreen.js performs invite prefill/auto-join.
