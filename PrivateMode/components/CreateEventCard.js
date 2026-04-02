import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import StatusBanner from '../../components/StatusBanner';

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
      {createEventStatus?.message ? (
        <StatusBanner compact variant={createEventStatus.tone || 'info'} message={createEventStatus.message} />
      ) : null}
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

      <TouchableOpacity style={[styles.createButton, isCreatingEvent ? styles.buttonDisabled : null]} onPress={onCreateEvent} disabled={isCreatingEvent}>
        {isCreatingEvent ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Private Event</Text>}
      </TouchableOpacity>

      {ownedEventId ? <Text style={styles.infoText}>Owner Invite Code: {ownedEventId}</Text> : null}
    </View>
  );
}
