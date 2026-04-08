import { useEffect, useRef, useState } from 'react';
import { Magnetometer } from 'expo-sensors';
import { COMPASS_SETTINGS } from '../constants/appConstants';

/**
 * Custom Hook: useCompassHeading
 * Tracks magnetic heading using device magnetometer with GPS-course fallback.
 * @returns {Object} { heading, headingSource, isHeadingAvailable, sensorError, calibrationHelpText }
 */
export const useCompassHeading = ({ courseHeading = null, courseSpeed = null, motionState = null } = {}) => {
  const [heading, setHeading] = useState(null);
  const [headingSource, setHeadingSource] = useState(null);
  const [isHeadingAvailable, setIsHeadingAvailable] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [calibrationHelpText, setCalibrationHelpText] = useState(null);
  const lastSmoothedHeadingRef = useRef(null);
  const courseHeadingRef = useRef(courseHeading);
  const courseSpeedRef = useRef(courseSpeed);
  const motionStateRef = useRef(motionState);

  const normalizeHeading = (value) => ((value % 360) + 360) % 360;
  const getShortestDelta = (from, to) => ((to - from + 540) % 360) - 180;

  const shouldUseCourseFallback = () => {
    const nextCourseHeading = courseHeadingRef.current;
    const nextCourseSpeed = courseSpeedRef.current;
    const nextMotionState = motionStateRef.current;

    return Number.isFinite(nextCourseHeading) && nextCourseHeading >= 0 && (
      Number.isFinite(nextCourseSpeed)
        ? nextCourseSpeed >= 0.5
        : false
    ) && (nextMotionState === 'walking' || nextMotionState === 'active');
  };

  const smoothHeading = (rawHeading) => {
    const previousHeading = lastSmoothedHeadingRef.current;

    if (previousHeading === null) {
      return rawHeading;
    }

    const delta = getShortestDelta(previousHeading, rawHeading);
    const absDelta = Math.abs(delta);
    const smoothingFactor = absDelta >= 60 ? 0.32 : absDelta >= 30 ? 0.2 : 0.12;
    return normalizeHeading(previousHeading + delta * smoothingFactor);
  };

  const applyHeading = (value, source, warningText = null, helpText = null) => {
    const normalizedHeading = normalizeHeading(value);
    const nextHeading = source === 'magnetometer'
      ? smoothHeading(normalizedHeading)
      : normalizedHeading;

    lastSmoothedHeadingRef.current = nextHeading;
    setHeading(Math.round(nextHeading));
    setHeadingSource(source);
    setIsHeadingAvailable(true);
    setSensorError(warningText);
    setCalibrationHelpText(helpText);
  };

  useEffect(() => {
    courseHeadingRef.current = courseHeading;
    courseSpeedRef.current = courseSpeed;
    motionStateRef.current = motionState;

    if (shouldUseCourseFallback()) {
      applyHeading(
        courseHeadingRef.current,
        'gps-course',
        'Compass limited. Using GPS course guidance.',
        'Keep moving steadily to let the compass recover automatically.',
      );
    }
  }, [courseHeading, courseSpeed, motionState]);

  useEffect(() => {
    let subscription;

    const startCompass = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable) {
          if (shouldUseCourseFallback()) {
            applyHeading(
              courseHeadingRef.current,
              'gps-course',
              'Compass limited. Using GPS course guidance.',
              'Keep moving steadily to let the compass recover automatically.',
            );
          } else {
            setIsHeadingAvailable(false);
            setSensorError('Compass sensor not available on this device.');
            setCalibrationHelpText('Move your phone in a figure-8 motion to recalibrate the compass.');
          }
          return;
        }

        setIsHeadingAvailable(true);
        setSensorError(null);
        setCalibrationHelpText(null);

        Magnetometer.setUpdateInterval(COMPASS_SETTINGS.UPDATE_INTERVAL_MS);

        subscription = Magnetometer.addListener(({ x, y }) => {
          const headingInDegrees = (Math.atan2(y, x) * 180) / Math.PI;

          if (shouldUseCourseFallback()) {
            applyHeading(
              courseHeadingRef.current,
              'gps-course',
              'Compass limited. Using GPS course guidance.',
              'Keep moving steadily to let the compass recover automatically.',
            );
            return;
          }

          const normalizedHeading = normalizeHeading(headingInDegrees);
          const smoothedHeading = smoothHeading(normalizedHeading);

          lastSmoothedHeadingRef.current = smoothedHeading;
          setHeading(Math.round(smoothedHeading));
          setHeadingSource('magnetometer');
          setIsHeadingAvailable(true);
          setSensorError(null);
          setCalibrationHelpText(null);
        });
      } catch (err) {
        console.error('Compass sensor error:', err);

        if (shouldUseCourseFallback()) {
          applyHeading(
            courseHeadingRef.current,
            'gps-course',
            'Compass limited. Using GPS course guidance.',
            'Keep moving steadily to let the compass recover automatically.',
          );
        } else {
          setSensorError(err.message || 'Failed to initialize compass sensor.');
          setIsHeadingAvailable(false);
          setCalibrationHelpText('Move your phone in a figure-8 motion to recalibrate the compass.');
        }
      }
    };

    startCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      lastSmoothedHeadingRef.current = null;
    };
  }, []);

  return {
    heading,
    headingSource,
    isHeadingAvailable,
    sensorError,
    calibrationHelpText,
  };
};

export default useCompassHeading;
