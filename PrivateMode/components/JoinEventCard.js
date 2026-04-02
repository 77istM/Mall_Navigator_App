import React from 'react';
import { View, Text, TextInput } from 'react-native';
import InlineStatusMessage from '../../components/InlineStatusMessage';
import LoadingActionButton from '../../components/LoadingActionButton';

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
      <InlineStatusMessage status={joinStatus} />
      <TextInput
        style={styles.input}
        placeholder="Invite Code (Event ID)"
        value={inviteCode}
        onChangeText={onInviteCodeChange}
        keyboardType="numeric"
        editable={!isJoiningEvent}
      />
      <LoadingActionButton
        style={styles.joinButton}
        disabledStyle={styles.buttonDisabled}
        textStyle={styles.buttonText}
        loading={isJoiningEvent}
        onPress={onJoinEvent}
        label="Join via Code"
      />
    </View>
  );
}
