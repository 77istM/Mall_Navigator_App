import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import InlineStatusMessage from '../../components/InlineStatusMessage';
import LoadingActionButton from '../../components/LoadingActionButton';

export default function JoinEventCard({
  styles,
  inviteCode,
  onInviteCodeChange,
  onJoinEvent,
  isJoiningEvent,
  joinStatus,
  showOwnerEventAction,
  onOpenOwnedEvent,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Participant Join</Text>
      <InlineStatusMessage status={joinStatus} />
      <Text style={styles.mutedText}>Enter the invite code shared by the event owner.</Text>
      <TextInput
        style={styles.input}
        placeholder="Owner-shared invite code"
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
        label="Join Private Event"
      />
      {showOwnerEventAction ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={onOpenOwnedEvent}>
          <Text style={styles.secondaryButtonText}>Open My Event</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
