export const normalizeCapturedImageAsset = (pickerResult) => {
  if (!pickerResult || pickerResult.canceled || !Array.isArray(pickerResult.assets)) {
    return null;
  }

  const [asset] = pickerResult.assets;

  if (!asset) {
    return null;
  }

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName || 'proof-photo.jpg',
    mimeType: asset.mimeType || 'image/jpeg',
    fileSize: asset.fileSize,
    type: asset.type || 'image',
  };
};

export const isValidCapturedImageAsset = (asset) => {
  if (!asset) return false;

  const hasUri = typeof asset.uri === 'string' && asset.uri.trim().length > 0;
  const isImage = !asset.type || asset.type === 'image';

  return hasUri && isImage;
};
