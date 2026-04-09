# GeoQuest Assessment Mapping

This document maps implemented behavior to the assessment criteria using concrete evidence files.

## Criterion 1: Depth and Sophistication of Features

### Sensor-Driven Gameplay Logic
- hooks/useLocationTracking.js
- hooks/useCompassHeading.js
- hooks/useMotionTracking.js
- hooks/useStepCounter.js

Outcome:
- Sensor state directly affects guidance and discovery behavior.

### Proximity Unlocking and Trust Validation
- utils/navigationTrust.js
- hooks/useCacheManagement.js
- constants/appConstants.js

Outcome:
- Discovery requires distance and trust checks, not distance alone.

### Advanced Map Interaction
- screens/MapScreen.js
- hooks/useRouteGuidance.js
- services/navigation/routeService.js

Outcome:
- Live route guidance and fallback behavior go beyond static marker placement.

### Global Mode and Private Mode Support
- App.js
- screens/PrivateScreen.js
- PrivateMode/services/PrivateModeService.js

Outcome:
- Private mode adds event ownership, joining, and invite-based flows.

### Scoring, Validation, and Error Handling
- api.js
- PrivateMode/validation/PrivateModeValidation.js
- utils/imageCaptureValidation.js
- components/StatusBanner.js

Outcome:
- User actions are validated and surfaced with explicit feedback paths.

## Criterion 2: Platform and Framework Understanding

### Architecture and Framework Usage Evidence
- App.js
- hooks/sensors/index.js
- hooks/gameplay/index.js
- services/navigation/routeService.js
- utils/navigation/index.js

Outcome:
- Architecture separates orchestration, side effects, domain services, and pure utilities.

### Platform APIs and Permission Handling Evidence
- hooks/useLocationTracking.js
- hooks/useCameraProofCapture.js
- app.json
- screens/MapScreen.js

Outcome:
- Expo APIs and platform permissions are integrated into runtime flow, with fallback behavior.

## Criterion 3: Professional Standard and Development Practice

### Maintainability and Code Organization Evidence
- screens/
- hooks/
- components/
- utils/
- PrivateMode/

Outcome:
- Folder boundaries and naming remain consistent and readable.

### Testing and Quality Controls Evidence
- testModules/navigationTrust.test.js
- testModules/navigationMath.test.js
- testModules/featureFlags.test.js
- jest.config.js

Outcome:
- Core navigation and trust logic have automated test coverage.

### Iterative Development and UX Resilience Evidence
- constants/featureFlags.js
- components/StatusBanner.js
- PrivateMode/validation/PrivateModeValidation.js

Outcome:
- Rollout control, status messaging, and validation are built into core user flows.
