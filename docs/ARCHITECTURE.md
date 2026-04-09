# GeoQuest Architecture

## Overview
GeoQuest uses a feature-oriented React Native + Expo structure. The app favors custom hooks for stateful logic, screen components for orchestration, and utility/service modules for reusable behavior.

## Runtime Flow
1. App starts in `App.js` with stack + tab navigation.
2. User enters either global gameplay tabs or private mode dashboard.
3. `MapScreen` composes location, heading, motion, route, and cache hooks.
4. `TargetPanel` presents actionable guidance and discovery controls.
5. Discovery logging routes through trust/radius checks and API calls.

## Main Modules

### Screens
- `screens/HomeScreen.js`: entry screen and mode selection.
- `screens/MapScreen.js`: map rendering, cache selection, guidance, and discovery UI.
- `screens/LeaderboardScreen.js`: event/global ranking display.
- `screens/PrivateScreen.js`: private event create/join/manage workflow.

### Hooks
- `hooks/useLocationTracking.js`: location permission + GPS tracking + trust updates.
- `hooks/useCompassHeading.js`: heading estimation from sensor/course data.
- `hooks/useMotionTracking.js`: motion magnitude smoothing and movement state.
- `hooks/useRouteGuidance.js`: optional route acquisition and fallback modes.
- `hooks/useCacheManagement.js`: cache lifecycle, selection, distance, and discovery actions.
- `hooks/useCameraProofCapture.js`: proof capture and media validation integration.
- `hooks/useEventManagement.js`: private event creation, joining, and invite handling.
- `hooks/useProgressTracking.js`: participant progress loading/refresh.
- `hooks/sensors/index.js`: sensor-domain entry point for map-facing sensor hooks.
- `hooks/gameplay/index.js`: gameplay-domain entry point for cache/route/proof hooks.

### Components
- `components/TargetPanel.js`: compact/expanded gameplay panel.
- `components/targetPanel/*`: panel subsections (status, motion, direction, proof, actions).
- `components/StatusBanner.js`: consistent user feedback across warning/error/info states.

### Services
- `services/navigation/routeService.js`: route request orchestration and normalization.
- `PrivateMode/services/PrivateModeService.js`: private event APIs, invite code sharing, QR/deep-link payload helpers.

### Utilities
- `utils/distanceCalculator.js` and `utils/bearingCalculator.js`: core navigation calculations.
- `utils/navigationMath.js`: angle and heading helpers.
- `utils/navigationTrust.js`: location trust scoring, staleness checks, discovery gating.
- `utils/routeNormalization.js`: route data shaping.
- `utils/imageCaptureValidation.js`: captured media checks.
- `utils/navigation/index.js`: navigation-domain entry point for distance, bearing, math, and trust helpers.

### Constants and Config
- `constants/appConstants.js`: thresholds, guidance modes, sensor timings.
- `constants/featureFlags.js`: rollout switches and behavior toggles.
- `PrivateMode/constants/PrivateModeConstants.js`: private mode defaults and event settings.

## State and Data Management
GeoQuest uses local React state and custom hooks rather than a global store library.
- Screen-level composition controls feature interactions.
- Hook boundaries encapsulate side effects (location watch, sensor subscriptions, route refresh).
- Utility modules hold pure logic for easier testing.

## Permissions and Platform APIs
Primary Expo APIs and platform surfaces:
- `expo-location`: foreground location permission and watch updates.
- `expo-sensors`: motion/heading-related signals.
- `expo-image-picker`: camera/photo proof capture.
- `expo-clipboard`: invite code copy flow.
- `react-native-maps`: map markers, user location, polyline guidance.

The app degrades gracefully when permissions or sensors are unavailable by surfacing status messages and switching guidance modes.

## Deep Linking
Link prefix: `geoquest://`
- `geoquest://join?inviteCode=<code>&autoJoin=1`

`App.js` maps the `join` path to private dashboard params, where `PrivateScreen` pre-fills code and can auto-join once.

## Current Structural Hotspots (For Incremental Refactor)
1. `MapScreen` to `TargetPanel` prop surface is large and can be consolidated.
2. Cache/gameplay state in `useCacheManagement` can be grouped with reducer patterns.
3. API transport/error parsing can be separated from higher-level domain operations.

These can be improved in staged, low-risk migrations without changing app behavior.
