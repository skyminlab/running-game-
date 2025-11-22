// Key mapping for up to 30 players
// Using numbers 0-9 and letters A-T (20 letters) = 30 keys total
export const PLAYER_KEYS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
];

export const MAX_PLAYERS = 30;

export function getKeyForPosition(position) {
  if (position >= 0 && position < PLAYER_KEYS.length) {
    return PLAYER_KEYS[position];
  }
  return null;
}

export function getPositionForKey(key) {
  const normalizedKey = key.toUpperCase();
  return PLAYER_KEYS.indexOf(normalizedKey);
}

