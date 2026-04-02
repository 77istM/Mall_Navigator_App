import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import InlineStatusMessage from '../../components/InlineStatusMessage';
import LoadingActionButton from '../../components/LoadingActionButton';

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
  onCreateEvent,
  ownedEventId,
  isCreatingEvent,
  createEventStatus,
}) {
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

      <LoadingActionButton
        style={styles.createButton}
        disabledStyle={styles.buttonDisabled}
        textStyle={styles.buttonText}
        loading={isCreatingEvent}
        onPress={onCreateEvent}
        label="Create Private Event"
      />

      {ownedEventId ? <Text style={styles.infoText}>Owner Invite Code: {ownedEventId}</Text> : null}
    </View>
  );
}
