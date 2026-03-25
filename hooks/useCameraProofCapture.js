import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required to capture photo proof.');
      setCaptureError('Camera permission denied');
      return false;
    }

    return true;
  }, []);

  const capturePhotoProof = useCallback(async () => {
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
        return null;
      }

      if (!isValidCapturedImageAsset(normalizedAsset)) {
        setCaptureError('Invalid image captured');
        Alert.alert('Capture failed', 'The captured image was invalid. Please try again.');
        return null;
      }

      setCapturedImage(normalizedAsset);
      return normalizedAsset;
    } catch (error) {
      const message = error?.message || 'Unable to capture image.';
      setCaptureError(message);
      Alert.alert('Capture error', message);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [requestCameraPermission]);

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
