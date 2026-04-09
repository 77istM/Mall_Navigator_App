# GeoQuest: Location-Based Treasure Hunt App

## What This Project Is
GeoQuest is a React Native + Expo mobile app where players discover treasure caches by physically moving to real-world locations. The app combines location, motion, and heading signals to guide players, validate discovery attempts, and support both public and private treasure hunt experiences.

## Why This Project Exists
This project demonstrates practical mobile development beyond basic CRUD by integrating:
- Real sensor data into gameplay decisions.
- Proximity-based discovery validation with trust checks.
- Interactive map navigation and route guidance.
- A private event mode with invite flows and event-specific discovery rules.

The goal is to show sound architecture, platform-aware implementation, and maintainable engineering practices in an Expo app.

## How It Works
At runtime, the app combines several layers:
- Screens: home flow, live map gameplay, leaderboard, private event dashboard.
- Hooks: location tracking, compass heading, motion state, route guidance, cache and event workflows.
- Services: private event operations and route fetching.
- Utilities: distance/bearing math, trust scoring, validation, and normalization helpers.

Core gameplay loop:
1. User opens the map and grants permissions.
2. App tracks location and sensor state continuously.
3. User selects a cache marker and receives directional guidance.
4. Discovery logging is allowed only when proximity and trust checks pass.
5. Proof capture and leaderboard updates are attached to successful discoveries.

## Key Features
- GPS-based live map with cache markers and user position.
- Compass guidance with fallback modes when sensor confidence is limited.
- Navigation trust model for stale signals, implausible jumps, and speed spikes.
- Discovery gating by radius, trust status, and duplicate-attempt protection.
- Private mode event creation, invite code join, and deep-link join flow.
- Invite sharing via clipboard/share and QR-based deep-link payloads.
- Validation and user-facing status messaging across location, capture, and event actions.

## Tech Stack
- Expo SDK 54
- React Native 0.81
- React Navigation (stack + bottom tabs)
- react-native-maps
- Expo Location, Sensors, Image Picker, Clipboard
- Jest + babel-jest

## Project Structure
```
GeoQuest/
  screens/        # Screen-level UI and navigation entry points
  hooks/          # Stateful gameplay and sensor orchestration
  components/     # Reusable UI and target panel modules
  PrivateMode/    # Private-event feature area (components/services/validation)
  services/       # Route/navigation service layer
  utils/          # Navigation math, trust, normalization, helpers
  constants/      # App settings, thresholds, feature flags
  testModules/    # Unit tests for navigation, trust, flags, helpers
```

## Quickstart (Expo Go)
Prerequisites:
- Node.js 18+
- npm
- Expo Go installed on your phone

Steps:
1. Install dependencies.
	```bash
	npm install
	```
2. Start the Expo development server.
	```bash
	npm start
	```
3. Open Expo Go on your device.
4. Scan the QR code shown in the terminal/browser.
5. Grant requested permissions (location, camera, motion) when prompted.

Optional platform commands:
```bash
npm run android
npm run ios
npm run web
```

## Testing
Run unit tests with:
```bash
npm test
```

Current tests target navigation math, trust evaluation, feature flags, and cache helper behavior.

## Additional Documentation
- `docs/ARCHITECTURE.md` explains module boundaries and data flow.
- `docs/ASSESSMENT-MAPPING.md` maps implemented features to assessment criteria.
