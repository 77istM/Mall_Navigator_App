import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VARIANT_STYLES = {
  info: {
    container: '#eff6ff',
    border: '#93c5fd',
    title: '#1d4ed8',
    message: '#1e3a8a',
  },
  success: {
    container: '#ecfdf5',
    border: '#86efac',
    title: '#166534',
    message: '#14532d',
  },
  warning: {
    container: '#fffbeb',
    border: '#fcd34d',
    title: '#92400e',
    message: '#78350f',
  },
  error: {
    container: '#fef2f2',
    border: '#fca5a5',
    title: '#b91c1c',
    message: '#7f1d1d',
  },
};

const StatusBanner = ({ variant = 'info', title, message, compact = false }) => {
  const palette = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: palette.container, borderColor: palette.border },
        compact ? styles.bannerCompact : null,
      ]}
      accessibilityRole="alert"
    >
      {title ? <Text style={[styles.title, { color: palette.title }]}>{title}</Text> : null}
      {message ? <Text style={[styles.message, { color: palette.message }]}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  bannerCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default StatusBanner;
