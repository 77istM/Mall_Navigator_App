import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const LoadingActionButton = ({
  style,
  disabledStyle,
  textStyle,
  disabled,
  loading,
  onPress,
  label,
  spinnerColor = '#fff',
  spinnerSize = 'small',
}) => {
  const isDisabled = Boolean(disabled || loading);

  return (
    <TouchableOpacity
      style={[style, isDisabled ? disabledStyle : null]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size={spinnerSize} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default LoadingActionButton;
