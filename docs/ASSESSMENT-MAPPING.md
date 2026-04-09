# GeoQuest Assessment Mapping

This document maps implemented behavior to the assessment criteria using concrete evidence files.

## Criterion 1: Depth and Sophistication of Features

### Sensor-driven gameplay logic
- hooks/useLocationTracking.js
- hooks/useCompassHeading.js
- hooks/useMotionTracking.js
- hooks/useStepCounter.js

Result:
- Sensor state directly affects guidance and discovery behavior.

### Proximity unlocking and trust validation
- utils/navigationTrust.js
- hooks/useCacheManagement.js
- constants/appConstants.js

Result:
- Discovery requires distance and trust checks, not distance alone.

### Advanced map interaction
- screens/MapScreen.js
- hooks/useRouteGuidance.js
- services/navigation/routeService.js

Result:
- Live route guidance and fallback behavior go beyond static marker placement.

### Global mode and private mode support
- App.js
- screens/PrivateScreen.js
- PrivateMode/services/PrivateModeService.js

Result:
- Private mode adds event ownership, joining, and invite-based flows.

### Scoring, validation, and error handling
- api.js
- PrivateMode/validation/PrivateModeValidation.js
- utils/imageCaptureValidation.js
- components/StatusBanner.js

Result:
- User actions are validated and surfaced with explicit feedback paths.

## Criterion 2: Platform and Framework Understanding

### Architecture and framework usage evidence
- App.js
- hooks/sensors/index.js
- hooks/gameplay/index.js
- services/navigation/routeService.js
- utils/navigation/index.js

Result:
- Architecture separates orchestration, side effects, domain services, and pure utilities.

### Platform APIs and permission handling evidence
- hooks/useLocationTracking.js
- hooks/useCameraProofCapture.js
- app.json
- screens/MapScreen.js

Result:
- Expo APIs and platform permissions are integrated into runtime flow, with fallback behavior.

## Criterion 3: Professional Standard and Development Practice

### Maintainability and code organization evidence
- screens/
- hooks/
- components/
- utils/
- PrivateMode/

Result:
- Folder boundaries and naming remain consistent and readable.

### Testing and quality controls evidence
- testModules/navigationTrust.test.js
- testModules/navigationMath.test.js
- testModules/featureFlags.test.js
- jest.config.js

Result:
- Core navigation and trust logic have automated test coverage.

### Iterative development and UX resilience evidence
- constants/featureFlags.js
- components/StatusBanner.js
- PrivateMode/validation/PrivateModeValidation.js

Result:
- Rollout control, status messaging, and validation are built into core user flows.
