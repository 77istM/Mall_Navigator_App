# GeoQuest: Location-Based Treasure Hunt App

GeoQuest is a React Native app where players discover treasure caches by physically moving to real-world locations. The app combines GPS, motion, and heading signals to guide players and validate discovery attempts.

The project uses:
- REST API integration (KU provided) using private key (public key for backup).
- Sensor data directly into gameplay decisions.
- GPS, Compass, Accelerometer -based discovery validation with trust checks.
- Interactive map navigation and route guidance.
- A Private Mode flow with invite-based participation and event-specific discovery rules.

## How it works
The app is organised into clear layers:
- Screens: home flow, live map gameplay, leaderboard, private event dashboard.
- Hooks: location tracking, compass heading, motion state, route guidance, cache and event workflows.
- Services: private event operations and route fetching.
- Utilities: distance/bearing math, trust scoring, validation, and normalisation helpers.

Core gameplay loop:
1. User opens the map and grants permissions.
2. App tracks location and sensor state continuously.
3. User selects a cache marker and receives directional guidance.
4. Discovery logging is allowed only when proximity and trust checks pass.
5. Proof capture and leaderboard updates are attached to successful discoveries.

## Key features
- GPS-based live map with cache markers and user position.
- Compass guidance with fallback modes when sensor confidence is limited.
- Navigation trust model for stale signals, implausible jumps, and speed spikes.
- Discovery gating by radius, trust status, and duplicate-attempt protection.
- Private Mode event creation, invite-code join, and deep-link join flow.
- Invite sharing via clipboard/share actions and QR-based deep-link payloads.
- Validation and user-facing status messaging across location, capture, and event actions.

## Project structure
```
screens- Screen-level UI and navigation entry points
hooks- Core hooks + domain entry points
    sensors- Sensor-focused hook entry point (location, heading, motion, steps)
    gameplay- Gameplay hook entry point (cache, route, proof capture)
components- Reusable UI and target panel modules
PrivateMode- Private-event feature area (components/services/validation)
service- Route/navigation service layer
utils- Shared utilities and domain entry points
    navigation- Navigation utility entry point (distance, bearing, trust, math)
constants- App settings, thresholds, feature flags
testModules- Unit tests for navigation, trust, flags, helpers
api.js- Handles api call and request
```
## To run the app
Clone the repo to your device. Download Expo Go app.

1. Install dependencies.
```bash
npm install
```
2. Start the app.
```bash
npm start
or
npx expo start -c //To clear the cache
```
3. Open Expo Go on your phone.
4. Scan the QR code from the terminal/browser.
5. Grant location, camera, and motion permissions when prompted.
6. Choose your game play mode- Global or Private.
