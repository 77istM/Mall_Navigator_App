import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function ShareInviteCode({ inviteCode, eventName, onToast }) {
  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(String(inviteCode));
      if (onToast) {
        onToast('Invite code copied to clipboard!', 'success');
      }
    } catch (error) {
      if (onToast) {
        onToast('Failed to copy invite code', 'error');
      }
    }
  };

  const handleShareCode = async () => {
    try {
      const shareMessage = eventName
        ? `Join my GeoQuest event "${eventName}"!\n\nInvite Code: ${inviteCode}\n\nEnter this code in the Private Event Mode to participate.`
        : `Join my GeoQuest event!\n\nInvite Code: ${inviteCode}\n\nEnter this code in the Private Event Mode to participate.`;

      const result = await Share.share({
        message: shareMessage,
        title: 'GeoQuest Event Invitation',
      });

      if (result.action === Share.sharedAction) {
        if (onToast) {
          onToast('Invite shared successfully!', 'success');
        }
      }
    } catch (error) {
      if (onToast) {
        onToast('Failed to share invite code', 'error');
      }
    }
  };

  if (!inviteCode) return null;

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        <Text style={styles.label}>Event Invite Code:</Text>
        <Text style={styles.code}>{inviteCode}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.buttonText}>📋 Copy Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
          <Text style={styles.buttonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Share this code with participants so they can join your event
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#74c0fc',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
    marginBottom: 4,
  },
  code: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0d6efd',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
