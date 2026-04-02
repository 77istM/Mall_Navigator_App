import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import StatusBanner from '../../components/StatusBanner';

export default function JoinEventCard({
  styles,
  inviteCode,
  onInviteCodeChange,
  onJoinEvent,
  isJoiningEvent,
  joinStatus,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Participant</Text>
      {joinStatus?.message ? (
        <StatusBanner compact variant={joinStatus.tone || 'info'} message={joinStatus.message} />
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Invite Code (Event ID)"
        value={inviteCode}
        onChangeText={onInviteCodeChange}
        keyboardType="numeric"
        editable={!isJoiningEvent}
      />
      <TouchableOpacity style={[styles.joinButton, isJoiningEvent ? styles.buttonDisabled : null]} onPress={onJoinEvent} disabled={isJoiningEvent}>
        {isJoiningEvent ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join via Code</Text>}
      </TouchableOpacity>
    </View>
  );
}
