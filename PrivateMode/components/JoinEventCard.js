import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function JoinEventCard({ styles, inviteCode, onInviteCodeChange, onJoinEvent }) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Participant</Text>
      <TextInput
        style={styles.input}
        placeholder="Invite Code (Event ID)"
        value={inviteCode}
        onChangeText={onInviteCodeChange}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.joinButton} onPress={onJoinEvent}>
        <Text style={styles.buttonText}>Join via Code</Text>
      </TouchableOpacity>
    </View>
  );
}
