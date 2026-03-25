import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CAMERA_CAPTURE_SETTINGS } from '../constants/appConstants';
import {
  isValidCapturedImageAsset,
  normalizeCapturedImageAsset,
} from '../utils/imageCaptureValidation';

export const useCameraProofCapture = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  const requestCameraPermission = useCallback(async () => {
    const currentPermission = await ImagePicker.getCameraPermissionsAsync();

    if (currentPermission.granted) {
      return true;
    }

    const permissionResponse = currentPermission.canAskAgain
      ? await ImagePicker.requestCameraPermissionsAsync()
      : currentPermission;

    if (!permissionResponse.granted) {
      const blockedMessage = permissionResponse.canAskAgain
        ? 'Camera access was denied. You can still log a discovery without photo proof.'
        : 'Camera access is blocked. Enable it in device settings if you want to attach photo proof.';

      Alert.alert(
        'Camera Permission Needed',
        blockedMessage
      );
      setCaptureError(permissionResponse.canAskAgain
        ? 'Camera access denied. Logging without photo is still available.'
        : 'Camera permission blocked in settings. Logging without photo is still available.');
      return false;
    }

    return true;
  }, []);

  const capturePhotoProof = useCallback(async () => {
    if (isCapturing) {
      return null;
    }

    if (Platform.OS === 'web') {
      const message = 'Camera capture is not available in this web build. You can still log discovery without photo proof.';
      setCaptureError(message);
      Alert.alert('Camera Unavailable', message);
      return null;
    }

    setCaptureError(null);
    setIsCapturing(true);

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return null;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: CAMERA_CAPTURE_SETTINGS.ALLOWS_EDITING,
        aspect: CAMERA_CAPTURE_SETTINGS.ASPECT,
        quality: CAMERA_CAPTURE_SETTINGS.QUALITY,
      });

      const normalizedAsset = normalizeCapturedImageAsset(pickerResult);

      if (!normalizedAsset) {
        setCaptureError('Photo capture canceled. You can log discovery without proof.');
        return null;
      }

      if (!isValidCapturedImageAsset(normalizedAsset)) {
        setCaptureError('Captured image was invalid. Please retake the photo.');
        Alert.alert('Invalid Photo', 'The captured image could not be used. Please try again.');
        return null;
      }

      setCapturedImage(normalizedAsset);
      setCaptureError(null);
      return normalizedAsset;
    } catch (error) {
      const message = error?.message || 'Unable to capture a photo right now.';
      setCaptureError(`Capture failed: ${message}`);
      Alert.alert('Capture Failed', `${message} You can continue and log without photo proof.`);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, requestCameraPermission]);

  const clearCapturedPhotoProof = useCallback(() => {
    setCapturedImage(null);
    setCaptureError(null);
  }, []);

  return {
    capturedImage,
    isCapturing,
    captureError,
    capturePhotoProof,
    clearCapturedPhotoProof,
  };
};
