export const EVENT_TYPES = ['Families', 'Schools', 'Companies', 'University Activities'];

export const TEST_IMAGE_URL = 'https://imgs.search.brave.com/QepbmUa7ANhll-Fjdx6_3dxZxzRVSNNg5JCt8Nbiehk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI5/OTQ5MjY4Mi9waG90/by9jYXQtaW4teW91/ci1mYWNlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz05WDAt/VlRQRktHakN0QzFa/Tkc4YUUxb2hoaU1z/c3V0RDgwWEtBZk9P/X3VvPQ';

export const WORLD_PICKER_REGION = {
  // Balanced global framing so first glance shows major continents.
  latitude: 51.553463,
  longitude: -0.103881,
  latitudeDelta: 80,
  longitudeDelta: 320,
};

export const DEFAULT_START_IN_HOURS = '0';
export const DEFAULT_DURATION_HOURS = '24';
export const DEFAULT_DISCOVERY_RADIUS_METERS = '1000';
export const DEFAULT_CACHE_POINTS = '10';

export const INVITE_SHARE_TITLE = 'GeoQuest Private Event Invite';

export const buildInviteDeepLink = (inviteCode, autoJoin = true, eventDiscoveryRadius = '') => {
  const normalizedCode = String(inviteCode || '').trim();
  const autoJoinParam = autoJoin ? '1' : '0';
  const normalizedRadius = String(eventDiscoveryRadius || '').trim();
  const radiusParam = normalizedRadius ? `&eventDiscoveryRadius=${encodeURIComponent(normalizedRadius)}` : '';
  return `geoquest://join?inviteCode=${encodeURIComponent(normalizedCode)}&autoJoin=${autoJoinParam}${radiusParam}`;
};

export const buildInviteShareMessage = (inviteCode, eventName = '', eventDiscoveryRadius = '') => {
  const normalizedCode = String(inviteCode || '').trim();
  const normalizedEventName = String(eventName || '').trim();
  const normalizedRadius = String(eventDiscoveryRadius || '').trim();
  const eventLine = normalizedEventName ? `Event: ${normalizedEventName}\n` : '';
  const radiusLine = normalizedRadius ? `Radius: ${normalizedRadius}m\n` : '';
  const inviteLink = buildInviteDeepLink(normalizedCode, true, normalizedRadius);

  return `${eventLine}${radiusLine}Join my GeoQuest private event with invite code: ${normalizedCode}\n${inviteLink}`;
};
