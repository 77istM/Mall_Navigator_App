import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import InlineStatusMessage from '../../components/InlineStatusMessage';
import LoadingActionButton from '../../components/LoadingActionButton';
import { buildInviteDeepLink } from '../constants/PrivateModeConstants';

export default function CreateEventCard({
  styles,
  eventName,
  onEventNameChange,
  eventDescription,
  onEventDescriptionChange,
  eventType,
  onEventTypeChange,
  eventTypes,
  startInHours,
  onStartInHoursChange,
  durationHours,
  onDurationHoursChange,
  discoveryRadiusMeters,
  onDiscoveryRadiusMetersChange,
  onCreateEvent,
  ownedEventId,
  isCreatingEvent,
  createEventStatus,
  onCopyInviteCode,
  onShareInviteCode,
}) {
  const canUseInviteActions = Boolean(ownedEventId) && !isCreatingEvent;
  const inviteCodeValue = String(ownedEventId || '').trim();
  const inviteLinkValue = buildInviteDeepLink(inviteCodeValue, true, discoveryRadiusMeters);

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Event Owner</Text>
      <InlineStatusMessage status={createEventStatus} />
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={onEventNameChange}
        editable={!isCreatingEvent}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={eventDescription}
        onChangeText={onEventDescriptionChange}
        editable={!isCreatingEvent}
      />

      <Text style={styles.label}>Event Type</Text>
      <View style={styles.chipRow}>
        {eventTypes.map((type) => {
          const isSelected = eventType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.chip, isSelected && styles.chipSelected]}
              disabled={isCreatingEvent}
              onPress={() => onEventTypeChange(type)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Time Window</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Starts in hours"
          value={startInHours}
          onChangeText={onStartInHoursChange}
          keyboardType="numeric"
          editable={!isCreatingEvent}
        />
        <TextInput
          style={[styles.input, styles.rowInput, styles.rowInputLast]}
          placeholder="Duration (hours)"
          value={durationHours}
          onChangeText={onDurationHoursChange}
          keyboardType="numeric"
          editable={!isCreatingEvent}
        />
      </View>

      <Text style={styles.label}>Discovery Radius (meters)</Text>
      <TextInput
        style={styles.input}
        placeholder="Discovery radius in meters"
        value={discoveryRadiusMeters}
        onChangeText={onDiscoveryRadiusMetersChange}
        keyboardType="numeric"
        editable={!isCreatingEvent}
      />

      <LoadingActionButton
        style={styles.createButton}
        disabledStyle={styles.buttonDisabled}
        textStyle={styles.buttonText}
        loading={isCreatingEvent}
        onPress={onCreateEvent}
        label="Create Indoor Event"
      />

      {ownedEventId ? (
        <View style={styles.inviteCodePanel}>
          <Text style={styles.inviteCodeLabel}>Event Invite Code:</Text>
          <Text style={styles.inviteCodeValue}>{ownedEventId}</Text>
          <View style={styles.qrWrapper}>
            <QRCode
              value={inviteLinkValue}
              size={150}
              color="#212529"
              backgroundColor="#ffffff"
            />
          </View>
          <Text style={styles.qrHintText}>Scan to open GeoQuest and join this event instantly.</Text>
          <Text style={styles.qrHintText}>This invite includes the event discovery radius.</Text>
          <View style={styles.inviteActionsRow}>
            <TouchableOpacity
              style={[styles.inviteActionButton, styles.inviteCopyButton, !canUseInviteActions && styles.buttonDisabled]}
              disabled={!canUseInviteActions || typeof onCopyInviteCode !== 'function'}
              onPress={onCopyInviteCode}
            >
              <Text style={styles.buttonText}>Copy Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inviteActionButton, styles.inviteShareButton, !canUseInviteActions && styles.buttonDisabled]}
              disabled={!canUseInviteActions || typeof onShareInviteCode !== 'function'}
              onPress={onShareInviteCode}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mutedText}>Share this code with participants so they can join your event.</Text>
        </View>
      ) : null}
    </View>
  );
}
