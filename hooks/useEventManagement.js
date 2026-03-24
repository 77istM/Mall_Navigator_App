import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  joinPrivateEvent,
  createPrivateModeEvent,
  extractCreatedEventId,
} from '../PrivateMode/services/PrivateModeService';
import {
  validateInviteCode,
  validateEventForm,
} from '../PrivateMode/validation/PrivateModeValidation';
import { EVENT_TYPES, DEFAULT_START_IN_HOURS, DEFAULT_DURATION_HOURS } from '../PrivateMode/constants/PrivateModeConstants';

export const useEventManagement = (currentUserId, onNavigateToMap) => {
  const [inviteCode, setInviteCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [startInHours, setStartInHours] = useState(DEFAULT_START_IN_HOURS);
  const [durationHours, setDurationHours] = useState(DEFAULT_DURATION_HOURS);
  const [ownedEventId, setOwnedEventId] = useState(null);

  const activeEventId = useMemo(() => {
    const trimmedInvite = inviteCode.trim();
    if (!trimmedInvite) {
      return ownedEventId;
    }
    const numericInvite = Number(trimmedInvite);
    return Number.isNaN(numericInvite) ? ownedEventId : numericInvite;
  }, [inviteCode, ownedEventId]);

  const handleJoinEvent = useCallback(async () => {
    const inviteCodeError = validateInviteCode(inviteCode);

    if (inviteCodeError) {
      return Alert.alert('Error', inviteCodeError);
    }

    const numericEventId = Number(inviteCode.trim());

    try {
      await joinPrivateEvent(currentUserId, numericEventId);
      Alert.alert('Success', 'Joined event successfully.');
      onNavigateToMap(numericEventId, eventName);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to join event. Check the code and try again.');
    }
  }, [inviteCode, currentUserId, eventName, onNavigateToMap]);

  const handleCreateEvent = useCallback(async (onProgressLoaded) => {
    const eventFormError = validateEventForm({ eventName, startInHours, durationHours });

    if (eventFormError) {
      return Alert.alert('Error', eventFormError);
    }

    const startOffset = Number(startInHours);
    const duration = Number(durationHours);
    const eventStart = new Date(Date.now() + startOffset * 60 * 60 * 1000);
    const eventFinish = new Date(eventStart.getTime() + duration * 60 * 60 * 1000);

    try {
      const trimmedName = eventName.trim();
      const trimmedDescription = eventDescription.trim();

      const newEvent = {
        EventName: trimmedName,
        EventDescription: trimmedDescription || `${eventType} private treasure hunt`,
        EventOwnerID: Number(currentUserId),
        EventIspublic: false,
        EventStatusID: 1,
        EventStart: eventStart.toISOString(),
        EventFinish: eventFinish.toISOString(),
      };

      const response = await createPrivateModeEvent(newEvent);
      const createdEventId = extractCreatedEventId(response);

      if (createdEventId) {
        const normalizedEventId = Number(createdEventId);
        setOwnedEventId(normalizedEventId);
        setInviteCode(String(normalizedEventId));
        await onProgressLoaded(normalizedEventId);
      }

      Alert.alert(
        'Event Created',
        createdEventId
          ? `Invite code: ${createdEventId}. Share this with participants.`
          : 'Event created successfully, but no Event ID was returned by the API.'
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create event.');
    }
  }, [eventName, eventDescription, eventType, startInHours, durationHours, currentUserId]);

  return {
    // State
    inviteCode,
    eventName,
    eventDescription,
    eventType,
    startInHours,
    durationHours,
    ownedEventId,
    activeEventId,
    // Setters
    setInviteCode,
    setEventName,
    setEventDescription,
    setEventType,
    setStartInHours,
    setDurationHours,
    // Handlers
    handleJoinEvent,
    handleCreateEvent,
  };
};
