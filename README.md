# GeoQuest: Location-Based Treasure Hunt App

## Overview
GeoQuest is a React Native + Expo mobile app where players discover treasure caches by physically moving to real-world locations. The app combines GPS, motion, and heading signals to guide players and validate discovery attempts.

## Why
This project demonstrates practical mobile development beyond basic CRUD by integrating:
- Real sensor data into gameplay decisions.
- Proximity-based discovery validation with trust checks.
- Interactive map navigation and route guidance.
- A private event mode with invite flows and event-specific discovery rules.

## How It Works
The app is organized into clear layers:
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

## Project Structure
```
GeoQuest/
  screens/        # Screen-level UI and navigation entry points
  hooks/          # Core hooks + domain entry points
    sensors/      # Sensor-focused hook entry point (location, heading, motion, steps)
    gameplay/     # Gameplay hook entry point (cache, route, proof capture)
  components/     # Reusable UI and target panel modules
  PrivateMode/    # Private-event feature area (components/services/validation)
  services/       # Route/navigation service layer
  utils/          # Shared utilities and domain entry points
    navigation/   # Navigation utility entry point (distance, bearing, trust, math)
  constants/      # App settings, thresholds, feature flags
  testModules/    # Unit tests for navigation, trust, flags, helpers
```

## Simple Expo Go Quickstart
1. Install dependencies.
```bash
npm install
```
2. Start the app.
```bash
npm start
```
3. Open Expo Go on your phone.
4. Scan the QR code from the terminal/browser.
5. Grant location, camera, and motion permissions when prompted.

## Testing and Status Notes
- Run tests:
```bash
npm test
```
- Current baseline: 6 suites passed, 22 tests passed.
- This repository uses feature flags and graceful fallback modes when sensors are unavailable.

## Supporting Docs
- docs/ARCHITECTURE.md
- docs/ASSESSMENT-MAPPING.md
