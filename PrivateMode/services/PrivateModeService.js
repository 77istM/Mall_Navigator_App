import {
  createPrivateEvent,
  joinEvent,
  createEventCache,
  getEventLeaderboard,
} from '../../api';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { buildInviteShareMessage, INVITE_SHARE_TITLE } from '../constants/PrivateModeConstants';

export const normalizeEventId = (value) => {
  const numericEventId = Number(value);
  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    return null;
  }
  return numericEventId;
};

export const joinPrivateEvent = (userId, eventId) => {
  return joinEvent(Number(userId), Number(eventId));
};

export const createPrivateModeEvent = (eventPayload) => {
  return createPrivateEvent(eventPayload);
};

export const extractCreatedEventId = (response) => {
  const rawEventId = response?.EventID ?? response?.[0]?.EventID ?? null;
  return normalizeEventId(rawEventId);
};

export const createPrivateModeCache = (eventId, cachePayload) => {
  return createEventCache(eventId, cachePayload);
};

export const fetchEventProgress = (eventId) => {
  return getEventLeaderboard(eventId);
};

export const copyInviteCodeToClipboard = async (inviteCode) => {
  const normalizedCode = String(inviteCode || '').trim();
  if (!normalizedCode) {
    return { ok: false, tone: 'error', message: 'No invite code available to copy yet.' };
  }

  try {
    await Clipboard.setStringAsync(normalizedCode);
    return { ok: true, tone: 'success', message: 'Invite code copied to clipboard.' };
  } catch (error) {
    return {
      ok: false,
      tone: 'error',
      message: error?.message || 'Failed to copy invite code to clipboard.',
    };
  }
};

export const shareInviteCode = async (inviteCode, eventName = '') => {
  const normalizedCode = String(inviteCode || '').trim();
  if (!normalizedCode) {
    return { ok: false, tone: 'error', message: 'No invite code available to share yet.' };
  }

  try {
    const result = await Share.share({
      title: INVITE_SHARE_TITLE,
      message: buildInviteShareMessage(normalizedCode, eventName),
    });

    if (result?.action === Share.dismissedAction) {
      return { ok: false, tone: 'warning', message: 'Share canceled.' };
    }

    return { ok: true, tone: 'success', message: 'Invite shared successfully.' };
  } catch (error) {
    return {
      ok: false,
      tone: 'error',
      message: error?.message || 'Unable to open share options right now.',
    };
  }
};
