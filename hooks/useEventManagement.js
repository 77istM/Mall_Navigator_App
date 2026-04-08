import { useState, useMemo, useCallback } from 'react';
import {
  joinPrivateEvent,
  createPrivateModeEvent,
  extractCreatedEventId,
  normalizeEventId,
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
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null);
  const [createEventStatus, setCreateEventStatus] = useState(null);

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
      setJoinStatus({ tone: 'error', message: inviteCodeError });
      return;
    }

    const numericEventId = Number(inviteCode.trim());
    setIsJoiningEvent(true);
    setJoinStatus({ tone: 'info', message: 'Joining event...' });

    try {
      await joinPrivateEvent(currentUserId, numericEventId);
      setJoinStatus({ tone: 'success', message: 'Joined event successfully. Opening the event map...' });
      onNavigateToMap(numericEventId, eventName);
    } catch (error) {
      setJoinStatus({
        tone: 'error',
        message: error?.message || 'Failed to join event. Check the code and try again.',
      });
    } finally {
      setIsJoiningEvent(false);
    }
  }, [inviteCode, currentUserId, eventName, onNavigateToMap]);

  const handleCreateEvent = useCallback(async (onProgressLoaded) => {
    const eventFormError = validateEventForm({ eventName, startInHours, durationHours });

    if (eventFormError) {
      setCreateEventStatus({ tone: 'error', message: eventFormError });
      return;
    }

    const startOffset = Number(startInHours);
    const duration = Number(durationHours);
    const eventStart = new Date(Date.now() + startOffset * 60 * 60 * 1000);
    const eventFinish = new Date(eventStart.getTime() + duration * 60 * 60 * 1000);
    setIsCreatingEvent(true);
    setCreateEventStatus({ tone: 'info', message: 'Creating private event...' });

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
        const normalizedEventId = normalizeEventId(createdEventId);
        if (!normalizedEventId) {
          throw new Error('Event created, but received an invalid Event ID from the API.');
        }
        setOwnedEventId(normalizedEventId);
        setInviteCode(String(normalizedEventId));
        await onProgressLoaded(normalizedEventId);
      }

      setCreateEventStatus({
        tone: createdEventId ? 'success' : 'warning',
        message: createdEventId
          ? `Event created. Invite code: ${createdEventId}`
          : 'Event created successfully, but no Event ID was returned by the API.',
      });
    } catch (error) {
      setCreateEventStatus({ tone: 'error', message: error?.message || 'Failed to create event.' });
    } finally {
      setIsCreatingEvent(false);
    }
  }, [eventName, eventDescription, eventType, startInHours, durationHours, currentUserId]);

  const handleInviteCodeChange = useCallback((value) => {
    setInviteCode(value);
    if (joinStatus?.tone === 'error') {
      setJoinStatus(null);
    }
  }, [joinStatus]);

  const handleEventNameChange = useCallback((value) => {
    setEventName(value);
    if (createEventStatus?.tone === 'error') {
      setCreateEventStatus(null);
    }
  }, [createEventStatus]);

  const handleEventDescriptionChange = useCallback((value) => {
    setEventDescription(value);
  }, []);

  const handleEventTypeChange = useCallback((value) => {
    setEventType(value);
  }, []);

  const handleStartInHoursChange = useCallback((value) => {
    setStartInHours(value);
    if (createEventStatus?.tone === 'error') {
      setCreateEventStatus(null);
    }
  }, [createEventStatus]);

  const handleDurationHoursChange = useCallback((value) => {
    setDurationHours(value);
    if (createEventStatus?.tone === 'error') {
      setCreateEventStatus(null);
    }
  }, [createEventStatus]);

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
    isJoiningEvent,
    isCreatingEvent,
    joinStatus,
    createEventStatus,
    // Setters
    setInviteCode: handleInviteCodeChange,
    setEventName: handleEventNameChange,
    setEventDescription: handleEventDescriptionChange,
    setEventType: handleEventTypeChange,
    setStartInHours: handleStartInHoursChange,
    setDurationHours: handleDurationHoursChange,
    // Handlers
    handleJoinEvent,
    handleCreateEvent,
  };
};
