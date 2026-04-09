import { useState, useMemo, useCallback } from 'react';
import {
  joinPrivateEvent,
  createPrivateModeEvent,
  extractCreatedEventId,
  normalizeEventId,
  copyInviteCodeToClipboard,
  shareInviteCode,
} from '../PrivateMode/services/PrivateModeService';
import {
  validateInviteCode,
  validateEventForm,
  validateDiscoveryRadius,
} from '../PrivateMode/validation/PrivateModeValidation';
import {
  EVENT_TYPES,
  DEFAULT_START_IN_HOURS,
  DEFAULT_DURATION_HOURS,
  DEFAULT_DISCOVERY_RADIUS_METERS,
} from '../PrivateMode/constants/PrivateModeConstants';

export const useEventManagement = (currentUserId, onNavigateToMap) => {
  const [inviteCode, setInviteCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [startInHours, setStartInHours] = useState(DEFAULT_START_IN_HOURS);
  const [durationHours, setDurationHours] = useState(DEFAULT_DURATION_HOURS);
  const [discoveryRadiusMeters, setDiscoveryRadiusMeters] = useState(DEFAULT_DISCOVERY_RADIUS_METERS);
  const [activeEventDiscoveryRadius, setActiveEventDiscoveryRadius] = useState(null);
  const [ownedEventId, setOwnedEventId] = useState(null);
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null);
  const [createEventStatus, setCreateEventStatus] = useState(null);
  const [showOwnerEventAction, setShowOwnerEventAction] = useState(false);

  const activeEventId = useMemo(() => {
    const trimmedInvite = inviteCode.trim();
    if (!trimmedInvite) {
      return ownedEventId;
    }
    const numericInvite = Number(trimmedInvite);
    return Number.isNaN(numericInvite) ? ownedEventId : numericInvite;
  }, [inviteCode, ownedEventId]);

  const joinWithInviteCode = useCallback(async (rawInviteCode, eventDiscoveryRadius = null) => {
    const normalizedInviteCode = String(rawInviteCode || '').trim();
    const inviteCodeError = validateInviteCode(normalizedInviteCode);

    if (inviteCodeError) {
      setJoinStatus({ tone: 'error', message: inviteCodeError });
      return;
    }

    const numericEventId = Number(normalizedInviteCode);

    if (ownedEventId && numericEventId === ownedEventId) {
      setShowOwnerEventAction(true);
      setActiveEventDiscoveryRadius(Number(discoveryRadiusMeters));
      setJoinStatus({
        tone: 'info',
        message: 'This is your event. Use the button below to open it.',
      });
      return;
    }

    setShowOwnerEventAction(false);
    setIsJoiningEvent(true);
    setJoinStatus({ tone: 'info', message: 'Joining event...' });

    try {
      await joinPrivateEvent(currentUserId, numericEventId, participantName);
      setJoinStatus({ tone: 'success', message: 'Joined event successfully. Opening the event map...' });
      setActiveEventDiscoveryRadius(Number(eventDiscoveryRadius) || null);
      onNavigateToMap(numericEventId, eventName, Number(eventDiscoveryRadius) || null);
    } catch (error) {
      setJoinStatus({
        tone: 'error',
        message: error?.message || 'Failed to join event. Check the code and try again.',
      });
    } finally {
      setIsJoiningEvent(false);
    }
  }, [currentUserId, participantName, eventName, onNavigateToMap, ownedEventId]);

  const handleJoinEvent = useCallback(async () => {
    await joinWithInviteCode(inviteCode, null);
  }, [inviteCode, joinWithInviteCode]);

  const handleJoinEventWithCode = useCallback(async (nextInviteCode, eventDiscoveryRadius = null) => {
    const normalizedInviteCode = String(nextInviteCode || '').trim();
    setInviteCode(normalizedInviteCode);
    await joinWithInviteCode(normalizedInviteCode, eventDiscoveryRadius);
  }, [joinWithInviteCode]);

  const handleCreateEvent = useCallback(async (onProgressLoaded) => {
    const eventFormError = validateEventForm({ eventName, startInHours, durationHours });
    const radiusFormError = validateDiscoveryRadius(discoveryRadiusMeters);

    if (eventFormError || radiusFormError) {
      setCreateEventStatus({ tone: 'error', message: eventFormError || radiusFormError });
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
        EventDiscoveryRadiusMeters: Number(discoveryRadiusMeters),
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
        setActiveEventDiscoveryRadius(Number(discoveryRadiusMeters));
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
  }, [eventName, eventDescription, eventType, startInHours, durationHours, discoveryRadiusMeters, currentUserId]);

  const handleInviteCodeChange = useCallback((value) => {
    setInviteCode(value);
    if (ownedEventId && Number(value) !== ownedEventId) {
      setShowOwnerEventAction(false);
    }
    if (joinStatus?.tone === 'error') {
      setJoinStatus(null);
    }
  }, [joinStatus, ownedEventId]);

  const handleParticipantNameChange = useCallback((value) => {
    setParticipantName(value);
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

  const handleDiscoveryRadiusChange = useCallback((value) => {
    setDiscoveryRadiusMeters(value);
    if (createEventStatus?.tone === 'error') {
      setCreateEventStatus(null);
    }
  }, [createEventStatus]);

  const handleCopyInviteCode = useCallback(async () => {
    const normalizedCode = String(ownedEventId || '').trim();
    const result = await copyInviteCodeToClipboard(normalizedCode);
    setCreateEventStatus({ tone: result.tone, message: result.message });
  }, [ownedEventId]);

  const handleShareInviteCode = useCallback(async () => {
    const normalizedCode = String(ownedEventId || '').trim();
    const result = await shareInviteCode(normalizedCode, eventName, discoveryRadiusMeters);
    setCreateEventStatus({ tone: result.tone, message: result.message });
  }, [ownedEventId, eventName, discoveryRadiusMeters]);

  const handleOpenOwnedEvent = useCallback(() => {
    if (!ownedEventId) {
      return;
    }

    const eventRadius = Number(discoveryRadiusMeters) || null;
    setActiveEventDiscoveryRadius(eventRadius);
    onNavigateToMap(ownedEventId, eventName, eventRadius);
  }, [ownedEventId, eventName, onNavigateToMap, discoveryRadiusMeters]);

  return {
    // State
    inviteCode,
    participantName,
    eventName,
    eventDescription,
    eventType,
    startInHours,
    durationHours,
    discoveryRadiusMeters,
    activeEventDiscoveryRadius,
    ownedEventId,
    activeEventId,
    isJoiningEvent,
    isCreatingEvent,
    joinStatus,
    createEventStatus,
    showOwnerEventAction,
    // Setters
    setInviteCode: handleInviteCodeChange,
    setParticipantName: handleParticipantNameChange,
    setEventName: handleEventNameChange,
    setEventDescription: handleEventDescriptionChange,
    setEventType: handleEventTypeChange,
    setStartInHours: handleStartInHoursChange,
    setDurationHours: handleDurationHoursChange,
    setDiscoveryRadiusMeters: handleDiscoveryRadiusChange,
    // Handlers
    handleJoinEvent,
    handleJoinEventWithCode,
    handleCreateEvent,
    handleCopyInviteCode,
    handleShareInviteCode,
    handleOpenOwnedEvent,
  };
};
