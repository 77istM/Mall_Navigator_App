// screens/PrivateDashboardScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createPrivateEvent, joinEvent } from '../api';

export default function PrivateDashboardScreen({ navigation }) {
  const [inviteCode, setInviteCode] = useState('');
  const [eventName, setEventName] = useState('');
  
  // Hardcoded for demonstration; retrieve from your auth state in production
  const currentUserId = '1'; 

  const handleJoinEvent = async () => {
    if (!inviteCode) return Alert.alert('Error', 'Please enter an invite code (Event ID)');
    try {
      // Creates a Player entity linking the user to the event [cite: 19, 20]
      await joinEvent(currentUserId, inviteCode);
      Alert.alert('Success', 'Joined event!');
      // Navigate to the filtered map view passing the event ID
      navigation.navigate('GlobalTabs', { eventId: inviteCode }); 
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Check the code and try again.');
    }
  };

  const handleCreateEvent = async () => {
    const trimmedName = eventName.trim();
    if (!trimmedName) return Alert.alert('Error', 'Event name is required');
    if (trimmedName.length < 8) {
      return Alert.alert('Error', 'Event name must be at least 8 characters long.');
    }

    try {
      const newEvent = {
        EventName: trimmedName,
        EventDescription: 'A private treasure hunt',
        EventOwnerID: Number(currentUserId), // The UserID of the user who created the event [cite: 14]
        EventIspublic: false, // Ensures it requires an invite [cite: 15]
        EventStatusID: 1, // Pending status, required by API schema
        EventStart: new Date().toISOString(), // Using ISO 8601 format [cite: 33, 34]
        EventFinish: new Date(Date.now() + 86400000).toISOString(), // +24 hours
      };
      const response = await createPrivateEvent(newEvent);
      Alert.alert('Event Created', `Share this ID with participants: ${response.EventID}`);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create event.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Participant</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Invite Code (Event ID)"
        value={inviteCode}
        onChangeText={setInviteCode}
      />
      <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
        <Text style={styles.buttonText}>Join Event</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.header}>Event Owner</Text>
      <TextInput
        style={styles.input}
        placeholder="New Event Name"
        value={eventName}
        onChangeText={setEventName}
      />
      <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Create Private Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  joinButton: { backgroundColor: '#17a2b8', padding: 15, borderRadius: 8, alignItems: 'center' },
  createButton: { backgroundColor: '#6c757d', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 30 }
});