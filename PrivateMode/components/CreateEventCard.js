import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import ShareInviteCode from '../../components/ShareInviteCode';

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
  onToast,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Event Owner</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={onEventNameChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={eventDescription}
        onChangeText={onEventDescriptionChange}
      />

      <Text style={styles.label}>Event Type</Text>
      <View style={styles.chipRow}>
        {eventTypes.map((type) => {
          const isSelected = eventType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.chip, isSelected && styles.chipSelected]}
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
        />
        <TextInput
          style={[styles.input, styles.rowInput, styles.rowInputLast]}
          placeholder="Duration (hours)"
          value={durationHours}
          onChangeText={onDurationHoursChange}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.createButton} onPress={onCreateEvent}>
        <Text style={styles.buttonText}>Create Private Event</Text>
      </TouchableOpacity>

      <ShareInviteCode
        inviteCode={ownedEventId}
        eventName={eventName}
        onToast={onToast}
      />
    </View>
  );
}
